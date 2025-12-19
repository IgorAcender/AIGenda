import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const tenantUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  logo: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
})

const configSchema = z.object({
  businessHours: z.boolean().optional(),
  weekStartDay: z.number().min(0).max(6).optional(),
  appointmentDuration: z.number().min(5).optional(),
  bufferBetweenAppts: z.number().min(0).optional(),
  autoConfirmAppointments: z.boolean().optional(),
  allowCancellation: z.boolean().optional(),
  cancellationDeadline: z.number().min(0).optional(),
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  whatsappNotifications: z.boolean().optional(),
})

export async function tenantRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate)

  // Buscar dados do tenant atual
  app.get('/me', async (request: any) => {
    const { tenantId } = request.user

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        configs: true,
        subscriptions: true,
        _count: {
          select: {
            clients: true,
            professionals: true,
            services: true,
          },
        },
      },
    })

    return tenant
  })

  // Atualizar dados do tenant
  app.put('/me', async (request: any, reply: any) => {
    try {
      const { tenantId, role } = request.user
      
      if (role !== 'ADMIN') {
        return reply.status(403).send({ error: 'Apenas administradores podem atualizar dados da empresa' })
      }

      const data = tenantUpdateSchema.parse(request.body)

      const tenant = await prisma.tenant.update({
        where: { id: tenantId },
        data,
      })

      return tenant
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      throw error
    }
  })

  // Buscar configurações
  app.get('/config', async (request: any) => {
    const { tenantId } = request.user

    const config = await prisma.configuration.findUnique({
      where: { tenantId },
    })

    return config
  })

  // Atualizar configurações
  app.put('/config', async (request: any, reply: any) => {
    try {
      const { tenantId, role } = request.user
      
      if (role !== 'ADMIN') {
        return reply.status(403).send({ error: 'Apenas administradores podem atualizar configurações' })
      }

      const data = configSchema.parse(request.body)

      const config = await prisma.configuration.upsert({
        where: { tenantId },
        update: data,
        create: {
          ...data,
          tenantId,
        },
      })

      return config
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      throw error
    }
  })

  // Listar usuários do tenant
  app.get('/users', async (request: any) => {
    const { tenantId } = request.user

    const users = await prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        avatar: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    })

    return { data: users }
  })
}
