import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const professionalSchema = z.object({
  name: z.string().min(2),
  specialties: z.array(z.string()).default([]),
  bio: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  commissionRate: z.number().min(0).max(100).default(0),
  userId: z.string().optional().nullable(),
})

export async function professionalRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate)

  // Listar profissionais
  app.get('/', async (request: any) => {
    const { tenantId } = request.user
    const { search, active } = request.query as any

    const where: any = { tenantId }
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }
    
    if (active !== undefined) {
      where.active = active === 'true'
    }

    const professionals = await prisma.professional.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        user: {
          select: { id: true, email: true, avatar: true },
        },
        services: {
          include: { service: true },
        },
        _count: {
          select: { appointments: true },
        },
      },
    })

    return { data: professionals }
  })

  // Buscar profissional por ID
  app.get('/:id', async (request: any, reply: any) => {
    const { tenantId } = request.user
    const { id } = request.params

    const professional = await prisma.professional.findFirst({
      where: { id, tenantId },
      include: {
        user: {
          select: { id: true, email: true, avatar: true, phone: true },
        },
        services: {
          include: { service: true },
        },
        appointments: {
          where: { status: 'SCHEDULED' },
          orderBy: { startTime: 'asc' },
          take: 10,
        },
      },
    })

    if (!professional) {
      return reply.status(404).send({ error: 'Profissional não encontrado' })
    }

    return professional
  })

  // Criar profissional
  app.post('/', async (request: any, reply: any) => {
    try {
      const { tenantId } = request.user
      const data = professionalSchema.parse(request.body)

      const professional = await prisma.professional.create({
        data: {
          ...data,
          tenantId,
        },
      })

      return reply.status(201).send(professional)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      throw error
    }
  })

  // Atualizar profissional
  app.put('/:id', async (request: any, reply: any) => {
    try {
      const { tenantId } = request.user
      const { id } = request.params
      const data = professionalSchema.partial().parse(request.body)

      const existing = await prisma.professional.findFirst({
        where: { id, tenantId },
      })

      if (!existing) {
        return reply.status(404).send({ error: 'Profissional não encontrado' })
      }

      const professional = await prisma.professional.update({
        where: { id },
        data,
      })

      return professional
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      throw error
    }
  })

  // Deletar (desativar) profissional
  app.delete('/:id', async (request: any, reply: any) => {
    const { tenantId } = request.user
    const { id } = request.params

    const existing = await prisma.professional.findFirst({
      where: { id, tenantId },
    })

    if (!existing) {
      return reply.status(404).send({ error: 'Profissional não encontrado' })
    }

    await prisma.professional.update({
      where: { id },
      data: { active: false },
    })

    return { message: 'Profissional desativado com sucesso' }
  })

  // Vincular serviços ao profissional
  app.post('/:id/services', async (request: any, reply: any) => {
    const { tenantId } = request.user
    const { id } = request.params
    const { serviceIds } = request.body as { serviceIds: string[] }

    const professional = await prisma.professional.findFirst({
      where: { id, tenantId },
    })

    if (!professional) {
      return reply.status(404).send({ error: 'Profissional não encontrado' })
    }

    // Remove vínculos existentes e cria novos
    await prisma.serviceProfessional.deleteMany({
      where: { professionalId: id },
    })

    if (serviceIds?.length > 0) {
      await prisma.serviceProfessional.createMany({
        data: serviceIds.map((serviceId) => ({
          professionalId: id,
          serviceId,
        })),
      })
    }

    return { message: 'Serviços vinculados com sucesso' }
  })
}
