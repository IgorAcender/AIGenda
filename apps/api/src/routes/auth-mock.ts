import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import jwt from '@fastify/jwt'

// ============= SCHEMAS =============

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const registerOwnerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  tenantName: z.string().min(2),
  phone: z.string().optional(),
})

// ============= MOCK DATA =============

// Usuários simulados para teste
const MOCK_USERS: { [key: string]: any } = {
  'test@example.com': {
    id: 'user-001',
    name: 'Teste User',
    email: 'test@example.com',
    password: 'password123', // Em produção, isso seria hasheado
    role: 'OWNER',
    tenantId: 'tenant-001',
  },
  'master@example.com': {
    id: 'user-master',
    name: 'Master User',
    email: 'master@example.com',
    password: 'master123',
    role: 'MASTER',
    tenantId: 'tenant-master',
  },
  'professional@example.com': {
    id: 'user-pro-001',
    name: 'Professional User',
    email: 'professional@example.com',
    password: 'pro123',
    role: 'PROFESSIONAL',
    tenantId: 'tenant-001',
    professionalId: 'prof-001',
  },
}

const MOCK_TENANTS: { [key: string]: any } = {
  'tenant-001': {
    id: 'tenant-001',
    name: 'Meu Negócio',
    slug: 'meu-negocio',
    logo: null,
    ownerId: 'user-001',
  },
  'tenant-master': {
    id: 'tenant-master',
    name: 'AIGenda Master',
    slug: 'aigenda-master',
    logo: null,
    ownerId: 'user-master',
  },
}

const MOCK_PROFESSIONALS: { [key: string]: any } = {
  'prof-001': {
    id: 'prof-001',
    name: 'João Professional',
    tenantId: 'tenant-001',
    specialty: 'Corte de Cabelo',
    color: '#FF6B6B',
  },
}

// ============= ROUTES =============

export async function authMockRoutes(app: FastifyInstance) {
  
  // ============= LOGIN =============
  app.post('/login', async (request, reply) => {
    try {
      const { email, password } = loginSchema.parse(request.body)

      // Procurar usuário no mock
      const user = MOCK_USERS[email]
      if (!user) {
        return reply.status(401).send({ 
          error: 'Email ou senha inválidos',
          statusCode: 401,
        })
      }

      // Verificar senha (em mock, apenas comparamos string)
      if (user.password !== password) {
        return reply.status(401).send({ 
          error: 'Email ou senha inválidos',
          statusCode: 401,
        })
      }

      // Gerar token JWT
      const token = app.jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        { expiresIn: '7d' }
      )

      // Buscar tenant
      const tenant = user.tenantId ? MOCK_TENANTS[user.tenantId] : null

      // Buscar professional se for profissional
      let professional = null
      if (user.professionalId) {
        professional = MOCK_PROFESSIONALS[user.professionalId]
      }

      return reply.status(200).send({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        tenant: tenant ? {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          logo: tenant.logo,
        } : null,
        professional,
        token,
      })
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          error: 'Dados inválidos',
          details: error.errors,
          statusCode: 400,
        })
      }
      console.error('Login error:', error)
      return reply.status(500).send({ 
        error: 'Erro ao fazer login',
        message: error.message,
        statusCode: 500,
      })
    }
  })

  // ============= REGISTER (OWNER) =============
  app.post('/register', async (request, reply) => {
    try {
      const { name, email, password, tenantName, phone } = registerOwnerSchema.parse(request.body)

      // Verificar se email já existe no mock
      if (MOCK_USERS[email]) {
        return reply.status(400).send({ 
          error: 'Email já cadastrado',
          statusCode: 400,
        })
      }

      // Criar slug do tenant
      const slug = tenantName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Gerar IDs
      const userId = `user-${Date.now()}`
      const tenantId = `tenant-${Date.now()}`

      // Criar usuário e tenant no mock
      const newUser = {
        id: userId,
        name,
        email,
        password, // Em produção, seria hasheado
        role: 'OWNER',
        phone,
        tenantId,
      }

      const newTenant = {
        id: tenantId,
        name: tenantName,
        slug,
        logo: null,
        ownerId: userId,
      }

      MOCK_USERS[email] = newUser
      MOCK_TENANTS[tenantId] = newTenant

      // Gerar token JWT
      const token = app.jwt.sign(
        { userId: newUser.id, email: newUser.email, role: newUser.role },
        { expiresIn: '7d' }
      )

      return reply.status(201).send({
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        tenant: {
          id: newTenant.id,
          name: newTenant.name,
          slug: newTenant.slug,
        },
        token,
      })
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          error: 'Dados inválidos',
          details: error.errors,
          statusCode: 400,
        })
      }
      console.error('Register error:', error)
      return reply.status(500).send({ 
        error: 'Erro ao registrar',
        message: error.message,
        statusCode: 500,
      })
    }
  })

  // ============= CHECK AUTH (GET /me) =============
  app.get('/me', async (request, reply) => {
    try {
      // Verificar se há token
      const token = request.headers.authorization?.replace('Bearer ', '')
      if (!token) {
        return reply.status(401).send({ 
          error: 'Não autenticado',
          statusCode: 401,
        })
      }

      // Decodificar token (em mock, apenas verificamos se existe)
      try {
        const decoded = app.jwt.verify(token)
        const userId = (decoded as any).userId

        // Procurar usuário no mock
        const user = Object.values(MOCK_USERS).find(u => u.id === userId) as any
        if (!user) {
          return reply.status(401).send({ 
            error: 'Usuário não encontrado',
            statusCode: 401,
          })
        }

        // Buscar tenant
        const tenant = user.tenantId ? MOCK_TENANTS[user.tenantId] : null

        // Buscar professional se for profissional
        let professional = null
        if (user.professionalId) {
          professional = MOCK_PROFESSIONALS[user.professionalId]
        }

        return reply.status(200).send({
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          tenant: tenant ? {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            logo: tenant.logo,
          } : null,
          professional,
        })
      } catch (jwtError) {
        return reply.status(401).send({ 
          error: 'Token inválido',
          statusCode: 401,
        })
      }
    } catch (error: any) {
      console.error('Auth check error:', error)
      return reply.status(500).send({ 
        error: 'Erro ao verificar autenticação',
        message: error.message,
        statusCode: 500,
      })
    }
  })

  // ============= LOGOUT =============
  app.post('/logout', async (request, reply) => {
    // Em uma aplicação real, você poderia invalidar o token
    return reply.status(200).send({ 
      success: true,
      message: 'Logout realizado com sucesso',
    })
  })

  // ============= REFRESH TOKEN =============
  app.post('/refresh', async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '')
      if (!token) {
        return reply.status(401).send({ 
          error: 'Token não fornecido',
          statusCode: 401,
        })
      }

      try {
        const decoded = app.jwt.verify(token)
        const newToken = app.jwt.sign(decoded, { expiresIn: '7d' })
        
        return reply.status(200).send({
          success: true,
          token: newToken,
        })
      } catch (jwtError) {
        return reply.status(401).send({ 
          error: 'Token inválido',
          statusCode: 401,
        })
      }
    } catch (error: any) {
      console.error('Refresh token error:', error)
      return reply.status(500).send({ 
        error: 'Erro ao renovar token',
        message: error.message,
        statusCode: 500,
      })
    }
  })
}
