import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'

export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook('preHandler', (app as any).authenticate)

  // Dashboard principal
  app.get('/', async (request: any) => {
    const { tenantId } = request.user

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0] // YYYY-MM-DD
    const tomorrowDate = new Date(today)
    tomorrowDate.setDate(tomorrowDate.getDate() + 1)
    const tomorrowStr = tomorrowDate.toISOString().split('T')[0]

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    // Buscar dados em paralelo
    const [
      totalClients,
      totalProfessionals,
      allAppointments,
      allTransactions,
    ] = await Promise.all([
      // Total de clientes ativos
      prisma.client.count({
        where: { tenantId, isActive: true },
      }),
      
      // Total de profissionais ativos
      prisma.professional.count({
        where: { tenantId, isActive: true },
      }),
      
      // Todos os agendamentos do tenant
      prisma.appointment.findMany({
        where: { tenantId },
        orderBy: { startTime: 'desc' },
        take: 100,
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
        take: 50,
        include: {
          client: { select: { name: true } },
        },
      }),
    ])

    // Filtrar agendamentos do mês
    const appointmentsThisMonth = allAppointments.filter((a: any) => {
      const appointmentDate = new Date(a.startTime)
      return appointmentDate >= startOfMonth && appointmentDate <= endOfMonth
    })

    // Contar agendamentos por status (mês atual)
    const totalScheduled = appointmentsThisMonth.length
    const confirmedCount = appointmentsThisMonth.filter((a: any) => a.status === 'CONFIRMED').length
    const scheduledCount = appointmentsThisMonth.filter((a: any) => a.status === 'SCHEDULED').length
    const cancelledCount = appointmentsThisMonth.filter((a: any) => a.status === 'CANCELLED').length
    const noShowCount = appointmentsThisMonth.filter((a: any) => a.status === 'NO_SHOW').length

    // Calcular percentuais
    const confirmedPercent = totalScheduled > 0 ? Math.round((confirmedCount / totalScheduled) * 100) : 0
    const scheduledPercent = totalScheduled > 0 ? Math.round((scheduledCount / totalScheduled) * 100) : 0
    const cancelledPercent = totalScheduled > 0 ? Math.round((cancelledCount / totalScheduled) * 100) : 0
    const noShowPercent = totalScheduled > 0 ? Math.round((noShowCount / totalScheduled) * 100) : 0

    // Agendamentos de hoje
    const appointmentsToday = allAppointments.filter((a: any) => 
      a.startTime >= todayStr && a.startTime < tomorrowStr &&
      ['SCHEDULED', 'CONFIRMED'].includes(a.status)
    ).length

    // Calcular receita do mês
    const revenueMonth = allTransactions
      .filter((t: any) => {
        const transactionDate = new Date(t.createdAt)
        return t.type === 'INCOME' && 
               t.status === 'PAID' &&
               transactionDate >= startOfMonth && 
               transactionDate <= endOfMonth
      })
      .reduce((sum: number, t: any) => sum + t.amount, 0)

    // Calcular métricas adicionais
    const todayAppointments = allAppointments.filter((a: any) => {
      const appointmentDate = new Date(a.startTime).toISOString().split('T')[0]
      return appointmentDate === todayStr
    })

    const todayConfirmed = todayAppointments.filter((a: any) => a.status === 'CONFIRMED').length
    
    // Taxa de conversão (confirmados / total agendado)
    const conversionRate = totalScheduled > 0 
      ? Math.round((confirmedCount / totalScheduled) * 100 * 10) / 10 
      : 0

    // Taxa de cancelamento
    const cancellationRate = totalScheduled > 0 
      ? Math.round((cancelledCount / totalScheduled) * 100 * 10) / 10 
      : 0

    // Remarcações (agendamentos que foram reagendados - que têm originalAppointmentId)
    const rescheduledCount = appointmentsThisMonth.filter((a: any) => a.originalAppointmentId).length

    // Média de agendamentos por dia (considerando dias úteis do mês)
    const daysInMonth = endOfMonth.getDate()
    const averagePerDay = totalScheduled > 0 
      ? Math.round((totalScheduled / daysInMonth) * 10) / 10 
      : 0

    // Média de agendamentos por profissional
    const averagePerProfessional = totalProfessionals > 0 && totalScheduled > 0
      ? Math.round((totalScheduled / totalProfessionals) * 10) / 10
      : 0

    // Taxa de ocupação (agendamentos confirmados hoje / total possível)
    // Considerando 8 horas/dia * 60min / 30min por atendimento = ~16 slots/profissional
    const maxSlotsPerDay = totalProfessionals * 16
    const occupationRate = maxSlotsPerDay > 0
      ? Math.round((todayConfirmed / maxSlotsPerDay) * 100 * 10) / 10
      : 0

    // Próximos agendamentos
    const upcomingAppointments = allAppointments
      .filter((a: any) => 
        a.startTime >= todayStr &&
        ['SCHEDULED', 'CONFIRMED'].includes(a.status)
      )
      .slice(0, 5)

    // Últimas transações
    const recentTransactions = allTransactions.slice(0, 5)

    return {
      stats: {
        appointmentsToday,
        appointmentsMonth: totalScheduled,
        revenueMonth,
        totalClients,
        totalProfessionals,
        // Stats por status
        totalScheduled,
        confirmedCount,
        confirmedPercent,
        scheduledCount,
        scheduledPercent,
        cancelledCount,
        cancelledPercent,
        noShowCount,
        noShowPercent,
        // Métricas adicionais
        todayConfirmed,
        conversionRate,
        cancellationRate,
        rescheduledCount,
        averagePerDay,
        averagePerProfessional,
        occupationRate,
      },
      upcomingAppointments,
      recentTransactions,
    }
  })
}
