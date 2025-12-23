import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const appointmentSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  clientId: z.string(),
  professionalId: z.string(),
  serviceId: z.string(),
  notes: z.string().optional().nullable(),
})

export async function appointmentRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate)

  // Listar agendamentos
  app.get('/', async (request: any) => {
    const { tenantId } = request.user
    const { 
      startDate, 
      endDate, 
      professionalId, 
      clientId, 
      status 
    } = request.query as any

    const where: any = { tenantId }
    
    if (startDate && endDate) {
      where.startTime = {
        gte: startDate,
        lte: endDate,
      }
    }
    
    if (professionalId) {
      where.professionalId = professionalId
    }

    if (clientId) {
      where.clientId = clientId
    }

    if (status) {
      where.status = status
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { startTime: 'asc' },
      include: {
        client: {
          select: { id: true, name: true, phone: true },
        },
        professional: {
          select: { id: true, name: true, avatar: true },
        },
        service: {
          select: { id: true, name: true, price: true, duration: true },
        },
      },
    })

    return { data: appointments }
  })

  // Buscar agendamento por ID
  app.get('/:id', async (request: any, reply: any) => {
    const { tenantId } = request.user
    const { id } = request.params

    const appointment = await prisma.appointment.findFirst({
      where: { id, tenantId },
      include: {
        client: true,
        professional: true,
        service: true,
        transaction: true,
      },
    })

    if (!appointment) {
      return reply.status(404).send({ error: 'Agendamento não encontrado' })
    }

    return appointment
  })

  // Criar agendamento
  app.post('/', async (request: any, reply: any) => {
    try {
      const { tenantId } = request.user
      const data = appointmentSchema.parse(request.body)

      // Verificar conflito de horário
      const conflict = await prisma.appointment.findFirst({
        where: {
          tenantId,
          professionalId: data.professionalId,
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
          OR: [
            {
              startTime: { lte: data.startTime },
              endTime: { gt: data.startTime },
            },
            {
              startTime: { lt: data.endTime },
              endTime: { gte: data.endTime },
            },
            {
              startTime: { gte: data.startTime },
              endTime: { lte: data.endTime },
            },
          ],
        },
      })

      if (conflict) {
        return reply.status(400).send({ error: 'Conflito de horário com outro agendamento' })
      }

      const appointment = await prisma.appointment.create({
        data: {
          ...data,
          date: new Date(data.startTime),
          tenantId,
        },
        include: {
          client: true,
          professional: true,
          service: true,
        },
      })

      return reply.status(201).send(appointment)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      throw error
    }
  })

  // Atualizar agendamento
  app.put('/:id', async (request: any, reply: any) => {
    try {
      const { tenantId } = request.user
      const { id } = request.params
      const data = appointmentSchema.partial().parse(request.body)

      const existing = await prisma.appointment.findFirst({
        where: { id, tenantId },
      })

      if (!existing) {
        return reply.status(404).send({ error: 'Agendamento não encontrado' })
      }

      const appointment = await prisma.appointment.update({
        where: { id },
        data: {
          ...data,
        },
        include: {
          client: true,
          professional: true,
          service: true,
        },
      })

      return appointment
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      throw error
    }
  })

  // Atualizar status do agendamento
  app.patch('/:id/status', async (request: any, reply: any) => {
    const { tenantId } = request.user
    const { id } = request.params
    const { status, cancelReason } = request.body

    const existing = await prisma.appointment.findFirst({
      where: { id, tenantId },
    })

    if (!existing) {
      return reply.status(404).send({ error: 'Agendamento não encontrado' })
    }

    const updateData: any = { status }

    if (status === 'CANCELLED') {
      updateData.canceledAt = new Date()
      updateData.cancelReason = cancelReason
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
    })

    return appointment
  })

  // Confirmar agendamento
  app.patch('/:id/confirm', async (request: any, reply: any) => {
    const { tenantId } = request.user
    const { id } = request.params

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: 'CONFIRMED' },
    })

    return appointment
  })

  // Concluir agendamento (e criar transação)
  app.patch('/:id/complete', async (request: any, reply: any) => {
    const { tenantId } = request.user
    const { id } = request.params
    const { paymentMethod } = request.body

    const appointment = await prisma.appointment.findFirst({
      where: { id, tenantId },
      include: { service: true, professional: true },
    })

    if (!appointment) {
      return reply.status(404).send({ error: 'Agendamento não encontrado' })
    }

    // Atualizar status e criar transação
    const [updatedAppointment] = await prisma.$transaction([
      prisma.appointment.update({
        where: { id },
        data: { status: 'COMPLETED' },
      }),
      prisma.transaction.create({
        data: {
          tenantId,
          type: 'INCOME',
          description: `Serviço: ${appointment.service.name}`,
          amount: appointment.service.price,
          status: 'PAID',
          paymentMethod,
          clientId: appointment.clientId,
          appointmentId: id,
          paidAt: new Date(),
        },
      }),
    ])

    return updatedAppointment
  })

  // Deletar agendamento
  app.delete('/:id', async (request: any, reply: any) => {
    const { tenantId } = request.user
    const { id } = request.params

    const existing = await prisma.appointment.findFirst({
      where: { id, tenantId },
    })

    if (!existing) {
      return reply.status(404).send({ error: 'Agendamento não encontrado' })
    }

    await prisma.appointment.delete({
      where: { id },
    })

    return { message: 'Agendamento excluído com sucesso' }
  })
}
