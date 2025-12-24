import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { cacheGet, cacheSet, cacheDeletePattern } from '../lib/redis'

const serviceSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  price: z.number().min(0),
  duration: z.number().min(5), // mínimo 5 minutos
  category: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
})

export async function serviceRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate)

  // Listar serviços
  app.get('/', async (request: any) => {
    const { tenantId } = request.user
    const { search, category, active } = request.query as any

    // Tentar cache primeiro (só se não tiver busca)
    const cacheKey = `services:${tenantId}:${active || 'all'}`
    if (!search && !category) {
      const cached = await cacheGet<any>(cacheKey)
      if (cached) return cached
    }

    const where: any = { tenantId }
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }
    
    if (category) {
      where.category = category
    }

    if (active !== undefined) {
      where.isActive = active === 'true'
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        professionals: {
          include: { professional: true },
        },
      },
    })

    const result = { data: services }

    // Salvar no cache (5 minutos)
    if (!search && !category) {
      await cacheSet(cacheKey, result, 300)
    }

    return result
  })

  // Buscar serviço por ID
  app.get('/:id', async (request: any, reply: any) => {
    const { tenantId } = request.user
    const { id } = request.params

    const service = await prisma.service.findFirst({
      where: { id, tenantId },
      include: {
        professionals: {
          include: { professional: true },
        },
      },
    })

    if (!service) {
      return reply.status(404).send({ error: 'Serviço não encontrado' })
    }

    return service
  })

  // Criar serviço
  app.post('/', async (request: any, reply: any) => {
    try {
      const { tenantId } = request.user
      const data = serviceSchema.parse(request.body)

      const service = await prisma.service.create({
        data: {
          ...data,
          tenantId,
        },
      })

      return reply.status(201).send(service)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      throw error
    }
  })

  // Atualizar serviço
  app.put('/:id', async (request: any, reply: any) => {
    try {
      const { tenantId } = request.user
      const { id } = request.params
      const data = serviceSchema.partial().parse(request.body)

      const existing = await prisma.service.findFirst({
        where: { id, tenantId },
      })

      if (!existing) {
        return reply.status(404).send({ error: 'Serviço não encontrado' })
      }

      const service = await prisma.service.update({
        where: { id },
        data,
      })

      return service
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      throw error
    }
  })

  // Deletar (desativar) serviço
  app.delete('/:id', async (request: any, reply: any) => {
    const { tenantId } = request.user
    const { id } = request.params

    const existing = await prisma.service.findFirst({
      where: { id, tenantId },
    })

    if (!existing) {
      return reply.status(404).send({ error: 'Serviço não encontrado' })
    }

    await prisma.service.update({
      where: { id },
      data: { active: false },
    })

    return { message: 'Serviço desativado com sucesso' }
  })
}
