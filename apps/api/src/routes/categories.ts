import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
})

export async function categoryRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate)

  // Listar categorias
  app.get('/', async (request: any) => {
    const { tenantId } = request.user

    const categories = await prisma.category.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { services: true },
        },
      },
    })

    return { data: categories }
  })

  // Buscar categoria por ID
  app.get('/:id', async (request: any, reply: any) => {
    const { tenantId } = request.user
    const { id } = request.params

    const category = await prisma.category.findFirst({
      where: { id, tenantId },
      include: {
        services: true,
      },
    })

    if (!category) {
      return reply.status(404).send({ error: 'Categoria não encontrada' })
    }

    return category
  })

  // Criar categoria
  app.post('/', async (request: any, reply: any) => {
    try {
      const { tenantId } = request.user
      const data = categorySchema.parse(request.body)

      const category = await prisma.category.create({
        data: {
          ...data,
          tenantId,
        },
      })

      return reply.status(201).send(category)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      throw error
    }
  })

  // Atualizar categoria
  app.put('/:id', async (request: any, reply: any) => {
    try {
      const { tenantId } = request.user
      const { id } = request.params
      const data = categorySchema.partial().parse(request.body)

      const existing = await prisma.category.findFirst({
        where: { id, tenantId },
      })

      if (!existing) {
        return reply.status(404).send({ error: 'Categoria não encontrada' })
      }

      const category = await prisma.category.update({
        where: { id },
        data,
      })

      return category
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      throw error
    }
  })

  // Deletar categoria
  app.delete('/:id', async (request: any, reply: any) => {
    const { tenantId } = request.user
    const { id } = request.params

    const existing = await prisma.category.findFirst({
      where: { id, tenantId },
    })

    if (!existing) {
      return reply.status(404).send({ error: 'Categoria não encontrada' })
    }

    // Verificar se tem serviços vinculados
    const servicesCount = await prisma.service.count({
      where: { categoryId: id },
    })

    if (servicesCount > 0) {
      return reply.status(400).send({ 
        error: 'Não é possível excluir categoria com serviços vinculados' 
      })
    }

    await prisma.category.delete({
      where: { id },
    })

    return { message: 'Categoria excluída com sucesso' }
  })
}
