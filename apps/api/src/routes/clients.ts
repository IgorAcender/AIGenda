import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const clientSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(8),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export async function clientRoutes(app: FastifyInstance) {
  // Middleware de autenticação em todas as rotas
  app.addHook('preHandler', app.authenticate)

  // Listar todos os clientes
  app.get('/', async (request: any) => {
    const { tenantId } = request.user
    const { search, page = '1', limit = '20' } = request.query as any
    
    const pageNum = parseInt(page, 10)
    const limitNum = parseInt(limit, 10)

    const where: any = { tenantId }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ]
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.client.count({ where }),
    ])

    return {
      data: clients,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    }
  })

  // Buscar cliente por ID
  app.get('/:id', async (request: any, reply) => {
    const { tenantId } = request.user
    const { id } = request.params

    const client = await prisma.client.findFirst({
      where: { id, tenantId },
      include: {
        appointments: {
          orderBy: { startTime: 'desc' },
          take: 10,
          include: {
            service: true,
            professional: true,
          },
        },
        _count: {
          select: { appointments: true, transactions: true },
        },
      },
    })

    if (!client) {
      return reply.status(404).send({ error: 'Cliente não encontrado' })
    }

    return client
  })

  // Criar cliente
  app.post('/', async (request: any, reply) => {
    try {
      const { tenantId } = request.user
      const data = clientSchema.parse(request.body)

      // Verificar CPF duplicado
      if (data.cpf) {
        const existingClient = await prisma.client.findUnique({
          where: { cpf: data.cpf },
        })
        if (existingClient) {
          return reply.status(400).send({ error: 'CPF já cadastrado' })
        }
      }

      const client = await prisma.client.create({
        data: {
          ...data,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          tenantId,
        },
      })

      return reply.status(201).send(client)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      throw error
    }
  })

  // Atualizar cliente
  app.put('/:id', async (request: any, reply) => {
    try {
      const { tenantId } = request.user
      const { id } = request.params
      const data = clientSchema.partial().parse(request.body)

      const existingClient = await prisma.client.findFirst({
        where: { id, tenantId },
      })

      if (!existingClient) {
        return reply.status(404).send({ error: 'Cliente não encontrado' })
      }

      const client = await prisma.client.update({
        where: { id },
        data: {
          ...data,
          birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        },
      })

      return client
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      throw error
    }
  })

  // Deletar cliente (soft delete - desativar)
  app.delete('/:id', async (request: any, reply) => {
    const { tenantId } = request.user
    const { id } = request.params

    const existingClient = await prisma.client.findFirst({
      where: { id, tenantId },
    })

    if (!existingClient) {
      return reply.status(404).send({ error: 'Cliente não encontrado' })
    }

    await prisma.client.update({
      where: { id },
      data: { active: false },
    })

    return { message: 'Cliente desativado com sucesso' }
  })

  // Reativar cliente
  app.patch('/:id/activate', async (request: any, reply) => {
    const { tenantId } = request.user
    const { id } = request.params

    const client = await prisma.client.update({
      where: { id },
      data: { active: true },
    })

    return client
  })
}
