import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const transactionSchema = z.object({
  type: z.enum(['INCOME', 'COMMISSION', 'EXPENSE', 'REFUND']),
  description: z.string().min(2),
  amount: z.number(),
  paymentMethod: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  clientId: z.string().optional().nullable(),
  professionalId: z.string().optional().nullable(),
})

export async function transactionRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate)

  // Listar transações
  app.get('/', async (request: any) => {
    const { tenantId } = request.user
    const { 
      startDate, 
      endDate, 
      type, 
      status,
      page = 1,
      limit = 50 
    } = request.query as any

    const where: any = { tenantId }
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }
    
    if (type) {
      where.type = type
    }

    if (status) {
      where.status = status
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          client: {
            select: { id: true, name: true },
          },
          professional: {
            select: { id: true, name: true },
          },
          appointment: {
            select: { id: true, title: true },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ])

    // Calcular totais
    const totals = await prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: { amount: true },
    })

    return {
      data: transactions,
      totals: totals.reduce((acc, t) => {
        acc[t.type] = t._sum.amount || 0
        return acc
      }, {} as Record<string, number>),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  })

  // Buscar transação por ID
  app.get('/:id', async (request: any, reply: any) => {
    const { tenantId } = request.user
    const { id } = request.params

    const transaction = await prisma.transaction.findFirst({
      where: { id, tenantId },
      include: {
        client: true,
        professional: true,
        appointment: true,
      },
    })

    if (!transaction) {
      return reply.status(404).send({ error: 'Transação não encontrada' })
    }

    return transaction
  })

  // Criar transação manual
  app.post('/', async (request: any, reply: any) => {
    try {
      const { tenantId } = request.user
      const data = transactionSchema.parse(request.body)

      const transaction = await prisma.transaction.create({
        data: {
          ...data,
          tenantId,
          status: 'CONFIRMED',
          paidAt: new Date(),
        },
      })

      return reply.status(201).send(transaction)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      throw error
    }
  })

  // Atualizar transação
  app.put('/:id', async (request: any, reply: any) => {
    try {
      const { tenantId } = request.user
      const { id } = request.params
      const data = transactionSchema.partial().parse(request.body)

      const existing = await prisma.transaction.findFirst({
        where: { id, tenantId },
      })

      if (!existing) {
        return reply.status(404).send({ error: 'Transação não encontrada' })
      }

      const transaction = await prisma.transaction.update({
        where: { id },
        data,
      })

      return transaction
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      throw error
    }
  })

  // Atualizar status
  app.patch('/:id/status', async (request: any, reply: any) => {
    const { tenantId } = request.user
    const { id } = request.params
    const { status } = request.body

    const existing = await prisma.transaction.findFirst({
      where: { id, tenantId },
    })

    if (!existing) {
      return reply.status(404).send({ error: 'Transação não encontrada' })
    }

    const updateData: any = { status }
    if (status === 'CONFIRMED') {
      updateData.paidAt = new Date()
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
    })

    return transaction
  })

  // Deletar transação
  app.delete('/:id', async (request: any, reply: any) => {
    const { tenantId } = request.user
    const { id } = request.params

    const existing = await prisma.transaction.findFirst({
      where: { id, tenantId },
    })

    if (!existing) {
      return reply.status(404).send({ error: 'Transação não encontrada' })
    }

    await prisma.transaction.delete({
      where: { id },
    })

    return { message: 'Transação excluída com sucesso' }
  })
}
