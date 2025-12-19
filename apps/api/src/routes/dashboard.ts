import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'

export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate)

  // Dashboard principal
  app.get('/', async (request: any) => {
    const { tenantId } = request.user

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    // Buscar dados em paralelo
    const [
      appointmentsToday,
      appointmentsMonth,
      revenueMonth,
      totalClients,
      totalProfessionals,
      upcomingAppointments,
      recentTransactions,
    ] = await Promise.all([
      // Agendamentos de hoje
      prisma.appointment.count({
        where: {
          tenantId,
          startTime: { gte: today, lt: tomorrow },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
      }),
      
      // Agendamentos do mês
      prisma.appointment.count({
        where: {
          tenantId,
          startTime: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      
      // Receita do mês
      prisma.transaction.aggregate({
        where: {
          tenantId,
          type: 'INCOME',
          status: 'CONFIRMED',
          createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
      
      // Total de clientes ativos
      prisma.client.count({
        where: { tenantId, active: true },
      }),
      
      // Total de profissionais ativos
      prisma.professional.count({
        where: { tenantId, active: true },
      }),
      
      // Próximos agendamentos
      prisma.appointment.findMany({
        where: {
          tenantId,
          startTime: { gte: today },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
        orderBy: { startTime: 'asc' },
        take: 5,
        include: {
          client: { select: { name: true } },
          professional: { select: { name: true } },
          service: { select: { name: true, price: true } },
        },
      }),
      
      // Últimas transações
      prisma.transaction.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          client: { select: { name: true } },
        },
      }),
    ])

    return {
      stats: {
        appointmentsToday,
        appointmentsMonth,
        revenueMonth: revenueMonth._sum.amount || 0,
        totalClients,
        totalProfessionals,
      },
      upcomingAppointments,
      recentTransactions,
    }
  })

  // Estatísticas por período
  app.get('/stats', async (request: any) => {
    const { tenantId } = request.user
    const { startDate, endDate } = request.query as any

    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1))
    const end = endDate ? new Date(endDate) : new Date()

    const [appointments, revenue, appointmentsByStatus] = await Promise.all([
      prisma.appointment.count({
        where: {
          tenantId,
          startTime: { gte: start, lte: end },
        },
      }),
      
      prisma.transaction.aggregate({
        where: {
          tenantId,
          type: 'INCOME',
          status: 'CONFIRMED',
          createdAt: { gte: start, lte: end },
        },
        _sum: { amount: true },
      }),
      
      prisma.appointment.groupBy({
        by: ['status'],
        where: {
          tenantId,
          startTime: { gte: start, lte: end },
        },
        _count: true,
      }),
    ])

    return {
      period: { start, end },
      appointments,
      revenue: revenue._sum.amount || 0,
      appointmentsByStatus: appointmentsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count
        return acc
      }, {} as Record<string, number>),
    }
  })

  // Ranking de profissionais
  app.get('/professionals-ranking', async (request: any) => {
    const { tenantId } = request.user
    const { startDate, endDate } = request.query as any

    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1))
    const end = endDate ? new Date(endDate) : new Date()

    const professionals = await prisma.professional.findMany({
      where: { tenantId, active: true },
      include: {
        _count: {
          select: { appointments: true },
        },
        transactions: {
          where: {
            type: 'INCOME',
            status: 'CONFIRMED',
            createdAt: { gte: start, lte: end },
          },
          select: { amount: true },
        },
      },
    })

    const ranking = professionals.map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      appointmentsCount: p._count.appointments,
      revenue: p.transactions.reduce((sum, t) => sum + t.amount, 0),
    })).sort((a, b) => b.revenue - a.revenue)

    return { data: ranking }
  })
}
