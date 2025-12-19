import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  tenantName: z.string().min(2),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function authRoutes(app: FastifyInstance) {
  // Registro de novo tenant + usuário admin
  app.post('/register', async (request, reply) => {
    try {
      const { name, email, password, tenantName } = registerSchema.parse(request.body)

      // Verificar se email já existe
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        return reply.status(400).send({ error: 'Email já cadastrado' })
      }

      // Criar slug do tenant
      const slug = tenantName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Verificar se slug já existe
      const existingTenant = await prisma.tenant.findUnique({ where: { slug } })
      if (existingTenant) {
        return reply.status(400).send({ error: 'Nome da empresa já está em uso' })
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10)

      // Criar tenant e usuário admin
      const tenant = await prisma.tenant.create({
        data: {
          name: tenantName,
          slug,
          email,
          users: {
            create: {
              name,
              email,
              password: hashedPassword,
              role: 'ADMIN',
            },
          },
          configs: {
            create: {},
          },
        },
        include: {
          users: true,
        },
      })

      const user = tenant.users[0]
      const token = app.jwt.sign({
        userId: user.id,
        tenantId: tenant.id,
        role: user.role,
      })

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
        },
        token,
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      throw error
    }
  })

  // Login
  app.post('/login', async (request, reply) => {
    try {
      const { email, password } = loginSchema.parse(request.body)

      const user = await prisma.user.findUnique({
        where: { email },
        include: { tenant: true },
      })

      if (!user || !user.active) {
        return reply.status(401).send({ error: 'Credenciais inválidas' })
      }

      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) {
        return reply.status(401).send({ error: 'Credenciais inválidas' })
      }

      const token = app.jwt.sign({
        userId: user.id,
        tenantId: user.tenantId,
        role: user.role,
      })

      // Criar sessão
      await prisma.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        },
      })

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        tenant: {
          id: user.tenant.id,
          name: user.tenant.name,
          slug: user.tenant.slug,
          logo: user.tenant.logo,
        },
        token,
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      throw error
    }
  })

  // Logout
  app.post('/logout', { preHandler: [app.authenticate] }, async (request: any) => {
    const token = request.headers.authorization?.replace('Bearer ', '')
    
    if (token) {
      await prisma.session.deleteMany({ where: { token } })
    }

    return { message: 'Logout realizado com sucesso' }
  })

  // Me - dados do usuário logado
  app.get('/me', { preHandler: [app.authenticate] }, async (request: any) => {
    const { userId } = request.user

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    })

    if (!user) {
      return { error: 'Usuário não encontrado' }
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
      },
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug,
        logo: user.tenant.logo,
      },
    }
  })
}
