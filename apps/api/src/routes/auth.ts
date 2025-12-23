import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { AuthUser } from '../lib/auth'

// ============= SCHEMAS =============

const registerOwnerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  tenantName: z.string().min(2),
  phone: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const createProfessionalLoginSchema = z.object({
  professionalId: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
})

// ============= ROUTES =============

export async function authRoutes(app: FastifyInstance) {
  
  // ============= REGISTRO DE NOVO SALÃO (OWNER) =============
  app.post('/register', async (request, reply) => {
    try {
      const { name, email, password, tenantName, phone } = registerOwnerSchema.parse(request.body)

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

      // Criar tenant e usuário OWNER
      const tenant = await prisma.tenant.create({
        data: {
          name: tenantName,
          slug,
          email,
          phone,
          users: {
            create: {
              name,
              email,
              password: hashedPassword,
              phone,
              role: 'OWNER', // Dono do salão
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
      
      const tokenPayload: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: 'OWNER',
        tenantId: tenant.id,
        professionalId: null,
      }
      
      const token = app.jwt.sign(tokenPayload)

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

  // ============= LOGIN UNIVERSAL =============
  // Funciona para MASTER, OWNER e PROFESSIONAL
  app.post('/login', async (request, reply) => {
    try {
      const { email, password } = loginSchema.parse(request.body)

      const user = await prisma.user.findUnique({
        where: { email },
        include: { 
          tenant: true,
          professional: true,
        },
      })

      if (!user || !user.isActive) {
        return reply.status(401).send({ error: 'Credenciais inválidas' })
      }

      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) {
        return reply.status(401).send({ error: 'Credenciais inválidas' })
      }

      // Payload do token baseado no role
      const tokenPayload: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as AuthUser['role'],
        tenantId: user.tenantId,
        professionalId: user.professionalId,
      }

      const token = app.jwt.sign(tokenPayload)

      // Resposta baseada no role
      const response: any = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      }

      // MASTER não tem tenant
      if (user.role !== 'MASTER' && user.tenant) {
        response.tenant = {
          id: user.tenant.id,
          name: user.tenant.name,
          slug: user.tenant.slug,
          logo: user.tenant.logo,
        }
      }

      // PROFESSIONAL tem dados do profissional
      if (user.role === 'PROFESSIONAL' && user.professional) {
        response.professional = {
          id: user.professional.id,
          name: user.professional.name,
          specialty: user.professional.specialty,
          avatar: user.professional.avatar,
        }
      }

      return response
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      throw error
    }
  })

  // ============= ME - DADOS DO USUÁRIO LOGADO =============
  app.get('/me', { preHandler: [(app as any).authenticate] }, async (request: any, reply) => {
    const user = request.user as AuthUser

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { 
        tenant: true,
        professional: true,
      },
    })

    if (!fullUser) {
      return reply.status(404).send({ error: 'Usuário não encontrado' })
    }

    const response: any = {
      user: {
        id: fullUser.id,
        name: fullUser.name,
        email: fullUser.email,
        role: fullUser.role,
        avatar: fullUser.avatar,
        phone: fullUser.phone,
      },
    }

    if (fullUser.role !== 'MASTER' && fullUser.tenant) {
      response.tenant = {
        id: fullUser.tenant.id,
        name: fullUser.tenant.name,
        slug: fullUser.tenant.slug,
        logo: fullUser.tenant.logo,
      }
    }

    if (fullUser.role === 'PROFESSIONAL' && fullUser.professional) {
      response.professional = {
        id: fullUser.professional.id,
        name: fullUser.professional.name,
        specialty: fullUser.professional.specialty,
        color: fullUser.professional.color,
      }
    }

    // Para MASTER, retorna estatísticas globais
    if (fullUser.role === 'MASTER') {
      const [totalTenants, totalUsers, totalAppointments] = await Promise.all([
        prisma.tenant.count(),
        prisma.user.count(),
        prisma.appointment.count(),
      ])
      response.stats = { totalTenants, totalUsers, totalAppointments }
    }

    return response
  })

  // ============= LOGOUT =============
  app.post('/logout', { preHandler: [(app as any).authenticate] }, async () => {
    // Com JWT stateless, o logout é feito no frontend removendo o token
    // Se quiser invalidar tokens, use Redis blacklist
    return { message: 'Logout realizado com sucesso' }
  })

  // ============= CRIAR LOGIN PARA PROFISSIONAL (OWNER only) =============
  app.post('/create-professional-login', { preHandler: [(app as any).authenticate] }, async (request: any, reply) => {
    const user = request.user as AuthUser
    
    // Apenas OWNER pode criar login para profissional
    if (user.role !== 'OWNER' && user.role !== 'MASTER') {
      return reply.status(403).send({ error: 'Apenas donos de salão podem criar login para profissionais' })
    }

    try {
      const { professionalId, email, password } = createProfessionalLoginSchema.parse(request.body)

      // Verificar se profissional existe e pertence ao tenant
      const professional = await prisma.professional.findFirst({
        where: { 
          id: professionalId,
          ...(user.role === 'OWNER' ? { tenantId: user.tenantId! } : {}),
        },
      })

      if (!professional) {
        return reply.status(404).send({ error: 'Profissional não encontrado' })
      }

      // Verificar se já tem login
      const existingLogin = await prisma.user.findFirst({
        where: { professionalId },
      })

      if (existingLogin) {
        return reply.status(400).send({ error: 'Este profissional já possui login' })
      }

      // Verificar se email já existe
      const existingEmail = await prisma.user.findUnique({ where: { email } })
      if (existingEmail) {
        return reply.status(400).send({ error: 'Email já cadastrado' })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: professional.name,
          role: 'PROFESSIONAL',
          tenantId: professional.tenantId,
          professionalId: professional.id,
          phone: professional.phone,
        },
      })

      return {
        message: 'Login criado com sucesso',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      throw error
    }
  })

  // ============= ALTERAR SENHA =============
  app.post('/change-password', { preHandler: [(app as any).authenticate] }, async (request: any, reply) => {
    const authUser = request.user as AuthUser
    
    const schema = z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(6),
    })

    try {
      const { currentPassword, newPassword } = schema.parse(request.body)

      const user = await prisma.user.findUnique({ where: { id: authUser.id } })
      if (!user) {
        return reply.status(404).send({ error: 'Usuário não encontrado' })
      }

      const validPassword = await bcrypt.compare(currentPassword, user.password)
      if (!validPassword) {
        return reply.status(400).send({ error: 'Senha atual incorreta' })
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      })

      return { message: 'Senha alterada com sucesso' }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      throw error
    }
  })
}
