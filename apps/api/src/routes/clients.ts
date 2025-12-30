import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { cacheGet, cacheSet, cacheDeletePattern } from '../lib/redis'

const clientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().min(1).optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable().or(z.literal('')),
  city: z.string().optional().nullable().or(z.literal('')),
  state: z.string().optional().nullable().or(z.literal('')),
  zipCode: z.string().optional().nullable().or(z.literal('')),
  cpf: z.string().optional().nullable().or(z.literal('')),
  birthDate: z.string().optional().nullable().or(z.literal('')),
  gender: z.string().optional().nullable().or(z.literal('')),
  notes: z.string().optional().nullable().or(z.literal('')),
  active: z.boolean().optional(),
  notifications: z.boolean().optional(),
  blocked: z.boolean().optional(),
})

type ClientInput = z.infer<typeof clientSchema>

function normalizeClientInput(data: any): Partial<ClientInput> {
  const {
    cep,
    street,
    number,
    complement,
    neighborhood,
    ...rest
  } = data || {}

  const addressParts = [street, number, complement, neighborhood].filter(Boolean)
  const address = rest.address ?? (addressParts.length ? addressParts.join(', ') : undefined)

  return {
    ...rest,
    address,
    zipCode: rest.zipCode ?? cep ?? undefined,
  }
}

function buildClientData(
  data: any,
  options: { partial?: boolean } = {}
): Partial<ClientInput> {
  const normalized = normalizeClientInput(data)
  const parsed = (options.partial ? clientSchema.partial() : clientSchema).parse(normalized)

  const allowedFields: Array<keyof ClientInput> = [
    'name',
    'email',
    'phone',
    'address',
    'city',
    'state',
    'zipCode',
    'cpf',
    'birthDate',
    'gender',
    'notes',
    'active',
    'notifications',
    'blocked',
  ]

  const cleanData: any = {}

  allowedFields.forEach((field) => {
    const value = parsed[field]
    if (value !== undefined) {
      cleanData[field] = value === '' ? null : value
    }
  })

  if (cleanData.birthDate) {
    cleanData.birthDate = new Date(cleanData.birthDate)
  }

  return cleanData
}

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
      const clientData = buildClientData(request.body)

      // Verificar CPF duplicado
      if (clientData.cpf) {
        const existingClient = await prisma.client.findUnique({
          where: { cpf: clientData.cpf },
        })
        if (existingClient) {
          return reply.status(400).send({ error: 'CPF já cadastrado' })
        }
      }

      const createData = { ...clientData, tenantId }

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
      const updateData = buildClientData(request.body, { partial: true })

      const existingClient = await prisma.client.findFirst({
        where: { id, tenantId },
      })

      if (!existingClient) {
        return reply.status(404).send({ error: 'Cliente não encontrado' })
      }

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

    await prisma.client.delete({
      where: { id },
    })

    // Invalidar cache
    await cacheDeletePattern(`clients:${tenantId}:*`)

    return { message: 'Cliente excluído com sucesso' }
  })
}
