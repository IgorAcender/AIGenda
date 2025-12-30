import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { cacheGet, cacheSet, cacheDeletePattern } from '../lib/redis'

const clientSchema = z.object({
  name: z.string().min(1).optional(),
  apelido: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().min(1).optional().nullable().or(z.literal('')),
  phone2: z.string().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable().or(z.literal('')),
  city: z.string().optional().nullable().or(z.literal('')),
  cpf: z.string().optional().nullable().or(z.literal('')),
  cnpj: z.string().optional().nullable().or(z.literal('')),
  rg: z.string().optional().nullable().or(z.literal('')),
  birthDate: z.string().optional().nullable().or(z.literal('')),
  gender: z.string().optional().nullable().or(z.literal('')),
  referredBy: z.string().optional().nullable().or(z.literal('')),
  tags: z.string().optional().nullable().or(z.literal('')),
  state: z.string().optional().nullable().or(z.literal('')),
  zipCode: z.string().optional().nullable().or(z.literal('')),
  notes: z.string().optional().nullable().or(z.literal('')),
  defaultDiscount: z.number().optional().nullable(),
  discountType: z.string().optional().nullable().or(z.literal('')),
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
      const parsedData = clientSchema.parse(request.body)

      // Verificar CPF duplicado
      if (parsedData.cpf) {
        const existingClient = await prisma.client.findUnique({
          where: { cpf: parsedData.cpf },
        })
        if (existingClient) {
          return reply.status(400).send({ error: 'CPF já cadastrado' })
        }
      }

      // Preparar dados para criação
      const createData: any = {
        ...parsedData,
        birthDate: parsedData.birthDate ? new Date(parsedData.birthDate) : null,
        tenantId,
      }

      const client = await prisma.client.create({
        data: createData,
      })

      // Invalidar cache
      await cacheDeletePattern(`clients:${tenantId}:*`)

      return reply.status(201).send(client)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      console.error('Erro ao criar cliente:', error)
      throw error
    }
  })

  // Atualizar cliente
  app.put('/:id', async (request: any, reply) => {
    try {
      const { tenantId } = request.user
      const { id } = request.params
      const parsedData = clientSchema.partial().parse(request.body)

      const existingClient = await prisma.client.findFirst({
        where: { id, tenantId },
      })

      if (!existingClient) {
        return reply.status(404).send({ error: 'Cliente não encontrado' })
      }

      // Preparar dados para atualização
      const updateData: any = {
        ...parsedData,
        birthDate: parsedData.birthDate ? new Date(parsedData.birthDate) : undefined,
      }

      // Remover campos undefined para não sobrescrever com null
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key]
        }
      })

      const client = await prisma.client.update({
        where: { id },
        data: updateData,
      })

      // Invalidar cache
      await cacheDeletePattern(`clients:${tenantId}:*`)

      return client
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      console.error('Erro ao atualizar cliente:', error)
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
