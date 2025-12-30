import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { cacheGet, cacheSet, cacheDeletePattern } from '../lib/redis'

const clientSchema = z.object({
  name: z.string().min(2),
  apelido: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(1).optional().nullable(),
  phone2: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  cnpj: z.string().optional().nullable(),
  rg: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  referredBy: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  defaultDiscount: z.number().optional().nullable(),
  discountType: z.string().optional().nullable(),
}).passthrough()

export async function clientRoutes(app: FastifyInstance) {
  // Middleware de autenticação em todas as rotas
  app.addHook('preHandler', app.authenticate)

  // Listar todos os clientes
  app.get('/', async (request: any) => {
    const { tenantId } = request.user
    const { search, page = '1', limit = '20' } = request.query as any
    
    const pageNum = parseInt(page, 10)
    const limitNum = parseInt(limit, 10)

    // Tentar cache primeiro (só se não tiver busca)
    const cacheKey = `clients:${tenantId}:${page}:${limit}`
    if (!search) {
      const cached = await cacheGet<any>(cacheKey)
      if (cached) return cached
    }

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

    const result = {
      data: clients,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    }

    // Salvar no cache (5 minutos)
    if (!search) {
      await cacheSet(cacheKey, result, 300)
    }

    return result
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

      // Extrair campos extras que não estão no schema mas existem no banco
      const extraFields: any = {}
      if (typeof request.body.active === 'boolean') {
        extraFields.active = request.body.active
      }
      if (typeof request.body.notifications === 'boolean') {
        extraFields.notifications = request.body.notifications
      }
      if (typeof request.body.blocked === 'boolean') {
        extraFields.blocked = request.body.blocked
      }

      const client = await prisma.client.create({
        data: {
          ...data,
          ...extraFields,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          tenantId,
        },
      })

      // Invalidar cache
      await cacheDeletePattern(`clients:${tenantId}:*`)

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

      // Extrair campos extras que não estão no schema mas existem no banco
      const extraFields: any = {}
      if (typeof request.body.active === 'boolean') {
        extraFields.active = request.body.active
      }
      if (typeof request.body.notifications === 'boolean') {
        extraFields.notifications = request.body.notifications
      }
      if (typeof request.body.blocked === 'boolean') {
        extraFields.blocked = request.body.blocked
      }

      const client = await prisma.client.update({
        where: { id },
        data: {
          ...data,
          ...extraFields,
          birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        },
      })

      // Invalidar cache
      await cacheDeletePattern(`clients:${tenantId}:*`)

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

    // Invalidar cache
    await cacheDeletePattern(`clients:${tenantId}:*`)

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
