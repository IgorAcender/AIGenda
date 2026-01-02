import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { cacheGet, cacheSet, cacheDeletePattern } from '../lib/redis'

// Helper para normalizar dados
function normalizeData(data: any) {
  // Converter isActive para active se necessário
  if ('isActive' in data && !('active' in data)) {
    data.active = data.isActive
  }
  delete data.isActive
  return data
}

const professionalSchema = z.object({
  name: z.string().min(2),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  password: z.string().optional().nullable(), // Para criar/atualizar usuário
  cpf: z.string().optional().nullable(),
  rg: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
  profession: z.string().optional().nullable(),
  specialty: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  
  // Endereço
  address: z.string().optional().nullable(),
  addressNumber: z.string().optional().nullable(),
  addressComplement: z.string().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  
  // Assinatura
  signature: z.string().optional().nullable(),
  
  // Configurações
  availableOnline: z.boolean().optional(),
  generateSchedule: z.boolean().optional(),
  receivesCommission: z.boolean().optional(),
  partnershipContract: z.boolean().optional(),
  
  // Financeiro
  commissionRate: z.number().min(0).max(100).default(0),
  
  notes: z.string().optional().nullable(),
  active: z.boolean().optional(),
  isActive: z.boolean().optional(), // Alias para active
})

export async function professionalRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate)

  // Listar profissionais
  app.get('/', async (request: any) => {
    const { tenantId } = request.user
    const { search, active } = request.query as any

    // Tentar cache primeiro (só se não tiver busca)
    const cacheKey = `professionals:${tenantId}:${active || 'all'}`
    if (!search) {
      const cached = await cacheGet<any>(cacheKey)
      if (cached) return cached
    }

    const where: any = { tenantId }
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }
    
    if (active !== undefined) {
      where.isActive = active === 'true'
    }

    const professionals = await prisma.professional.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        user: {
          select: { id: true, email: true, avatar: true },
        },
        services: {
          include: { service: true },
        },
        _count: {
          select: { appointments: true },
        },
      },
    })

    const result = { data: professionals }

    // Salvar no cache (5 minutos)
    if (!search) {
      await cacheSet(cacheKey, result, 300)
    }

    return result
  })

  // Buscar profissional por ID
  app.get('/:id', async (request: any, reply: any) => {
    const { tenantId } = request.user
    const { id } = request.params

    const professional = await prisma.professional.findFirst({
      where: { id, tenantId },
      include: {
        user: {
          select: { id: true, email: true, avatar: true, phone: true },
        },
        services: {
          include: { service: true },
        },
        appointments: {
          where: { status: 'SCHEDULED' },
          orderBy: { startTime: 'asc' },
          take: 10,
        },
      },
    })

    if (!professional) {
      return reply.status(404).send({ error: 'Profissional não encontrado' })
    }

    return professional
  })

  // Criar profissional
  app.post('/', async (request: any, reply: any) => {
    try {
      const { tenantId } = request.user
      let data = professionalSchema.parse(request.body)
      
      // Extrair senha do payload (não vai para o Prisma.professional)
      const { password, ...professionalData } = data
      
      // Normalizar dados
      const normalized = normalizeData(professionalData)

      // Se houver email e senha, criar usuário
      let userId = null
      if (data.email && password) {
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
          data: {
            email: data.email,
            password: hashedPassword,
            name: data.name,
            role: 'PROFESSIONAL',
            tenantId,
          },
        })
        userId = user.id
      }

      const professional = await prisma.professional.create({
        data: {
          ...normalized,
          tenantId,
          ...(userId && { userId }), // Vincular usuário se criado
        },
        include: {
          user: {
            select: { id: true, email: true, avatar: true },
          },
          services: {
            include: { service: true },
          },
          _count: {
            select: { appointments: true },
          },
        },
      })

      // Limpar cache de profissionais
      try {
        await cacheDeletePattern(`professionals:${tenantId}:*`)
      } catch (cacheError) {
        console.warn('Cache cleanup failed:', cacheError)
      }

      return reply.status(201).send(professional)
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return reply.status(409).send({ error: 'Email já cadastrado no sistema' })
      }
      console.error('Erro ao criar profissional:', error)
      throw error
    }
  })

  // Atualizar profissional
  app.put('/:id', async (request: any, reply: any) => {
    try {
      const { tenantId } = request.user
      const { id } = request.params
      let data: any = request.body
      // Validar apenas os campos enviados
      const schema = z.object({
        name: z.string().min(2).optional(),
        firstName: z.string().optional().nullable(),
        lastName: z.string().optional().nullable(),
        phone: z.string().optional().nullable(),
        email: z.string().email().optional().nullable(),
        password: z.string().optional().nullable(), // Para atualizar senha
        cpf: z.string().optional().nullable(),
        rg: z.string().optional().nullable(),
        birthDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
        profession: z.string().optional().nullable(),
        specialty: z.string().optional().nullable(),
        bio: z.string().optional().nullable(),
        avatar: z.string().optional().nullable(),
        color: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        addressNumber: z.string().optional().nullable(),
        addressComplement: z.string().optional().nullable(),
        neighborhood: z.string().optional().nullable(),
        city: z.string().optional().nullable(),
        state: z.string().optional().nullable(),
        zipCode: z.string().optional().nullable(),
        signature: z.string().optional().nullable(),
        availableOnline: z.boolean().optional(),
        generateSchedule: z.boolean().optional(),
        receivesCommission: z.boolean().optional(),
        partnershipContract: z.boolean().optional(),
        commissionRate: z.number().min(0).max(100).optional(),
        notes: z.string().optional().nullable(),
        active: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }).parse(data)
      
      // Extrair senha e email do payload (não vão para o Prisma.professional)
      const { password, email, ...professionalData } = schema
      
      // Normalizar dados
      const normalized = normalizeData(professionalData)

      const existing = await prisma.professional.findFirst({
        where: { id, tenantId },
        include: { user: true },
      })

      if (!existing) {
        return reply.status(404).send({ error: 'Profissional não encontrado' })
      }

      // Se houver email e/ou senha, atualizar usuário
      if ((email || password) && existing.user) {
        const updateUserData: any = {}
        if (email) updateUserData.email = email
        if (password) updateUserData.password = await bcrypt.hash(password, 10)
        if (Object.keys(updateUserData).length > 0) {
          await prisma.user.update({
            where: { id: existing.user.id },
            data: updateUserData,
          })
        }
      } else if (email && password && !existing.user) {
        // Se não há usuário vinculado mas enviou email + senha, criar novo usuário
        // Verificar se email já existe
        const existingUser = await prisma.user.findUnique({
          where: { email },
        })
        
        if (existingUser) {
          // Email já existe, vincular ao invés de criar novo
          // Atualizar password se fornecida
          const hashedPassword = await bcrypt.hash(password, 10)
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              password: hashedPassword,
              professionalId: id,
            },
          })
        } else {
          // Email não existe, criar novo usuário
          const hashedPassword = await bcrypt.hash(password, 10)
          await prisma.user.create({
            data: {
              email,
              password: hashedPassword,
              name: existing.name,
              role: 'PROFESSIONAL',
              tenantId,
              professionalId: id,
            },
          })
        }
      } else if (email && !existing.user) {
        // Apenas email sem senha (não criar usuário sem senha)
        // Deixa vazio
      }

      const professional = await prisma.professional.update({
        where: { id },
        data: normalized,
        include: {
          user: {
            select: { id: true, email: true, avatar: true },
          },
          services: {
            include: { service: true },
          },
          _count: {
            select: { appointments: true },
          },
        },
      })

      // Limpar cache de profissionais
      try {
        await cacheDeletePattern(`professionals:${tenantId}:*`)
      } catch (cacheError) {
        console.warn('Cache cleanup failed:', cacheError)
      }

      return professional
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.error('❌ Zod validation error:', JSON.stringify(error.errors, null, 2))
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      console.error('❌ Erro ao atualizar profissional:', error)
      throw error
    }
  })

  // Deletar (desativar) profissional
  app.delete('/:id', async (request: any, reply: any) => {
    try {
      const user = request.user as { id?: string; tenantId?: string } | undefined
      
      if (!user?.tenantId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const { tenantId } = user
      const { id } = request.params

      if (!id) {
        return reply.status(400).send({ error: 'ID do profissional é obrigatório' })
      }

      const existing = await prisma.professional.findFirst({
        where: { id, tenantId },
        include: { appointments: true },
      })

      if (!existing) {
        return reply.status(404).send({ error: 'Profissional não encontrado' })
      }

      // Se houver agendamentos, desativar em vez de deletar
      if (existing.appointments && existing.appointments.length > 0) {
        await prisma.professional.update({
          where: { id },
          data: { isActive: false },
        })
        
        // Limpar cache
        try {
          await cacheDeletePattern(`professionals:${tenantId}:*`)
        } catch (e) {
          console.warn('Erro ao limpar cache:', e)
        }
        
        console.log(`⚠️ Profissional ${id} desativado (havia ${existing.appointments.length} agendamentos)`)
        return reply.status(200).send({ 
          message: 'Profissional desativado com sucesso (havia agendamentos vinculados)',
          deactivated: true,
        })
      }

      // Sem agendamentos, pode deletar de verdade
      // Primeiro remove os vínculos com serviços
      await prisma.professionalService.deleteMany({
        where: { professionalId: id },
      })

      // Depois deleta o profissional
      await prisma.professional.delete({
        where: { id },
      })

      // Limpa cache
      try {
        await cacheDeletePattern(`professional:${tenantId}:*`)
        await cacheDeletePattern(`professionals:${tenantId}:*`)
      } catch (e) {
        console.warn('Erro ao limpar cache:', e)
      }

      console.log(`✅ Profissional ${id} excluído com sucesso`)
      return reply.status(200).send({ 
        message: 'Profissional excluído com sucesso',
        deleted: true,
      })
    } catch (error: any) {
      console.error('❌ Erro ao deletar profissional:', error)
      
      // Mensagens de erro mais específicas
      let errorMessage = 'Erro ao deletar profissional'
      let statusCode = 500

      if (error.code === 'P2014') {
        errorMessage = 'Não é possível deletar este profissional pois existem dados vinculados'
        statusCode = 409
      } else if (error.code === 'P2025') {
        errorMessage = 'Profissional não encontrado'
        statusCode = 404
      } else if (error.code === 'P2003') {
        errorMessage = 'Não é possível deletar profissional com agendamentos vinculados'
        statusCode = 409
      }

      return reply.status(statusCode).send({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      })
    }
  })

  // Vincular serviços ao profissional
  app.post('/:id/services', async (request: any, reply: any) => {
    const { tenantId } = request.user
    const { id } = request.params
    const { serviceIds } = request.body as { serviceIds: string[] }

    const professional = await prisma.professional.findFirst({
      where: { id, tenantId },
    })

    if (!professional) {
      return reply.status(404).send({ error: 'Profissional não encontrado' })
    }

    // Remove vínculos existentes e cria novos
    await prisma.professionalService.deleteMany({
      where: { professionalId: id },
    })

    if (serviceIds?.length > 0) {
      await prisma.professionalService.createMany({
        data: serviceIds.map((serviceId) => ({
          professionalId: id,
          serviceId,
        })),
      })
    }

    return { message: 'Serviços vinculados com sucesso' }
  })

  // GET /professionals/:id/schedule - Obter horário do profissional + horário padrão da barbearia
  app.get('/:id/schedule', async (request: any, reply: any) => {
    try {
      const { tenantId } = request.user
      const { id } = request.params

      // Obter profissional
      const professional = await prisma.professional.findFirst({
        where: { id, tenantId },
      })

      if (!professional) {
        return reply.status(404).send({ error: 'Profissional não encontrado' })
      }

      // Obter horário padrão da barbearia
      const businessHours = await prisma.businessHours.findMany({
        where: { tenantId },
        orderBy: { dayOfWeek: 'asc' },
      })

      // Obter horário personalizado do profissional
      const professionalSchedule = await prisma.professionalSchedule.findMany({
        where: { professionalId: id },
        orderBy: { dayOfWeek: 'asc' },
      })

      // Mapear dias da semana
      const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

      // Preparar resposta com dias da semana
      const schedule = daysOfWeek.map((day, index) => {
        const businessHour = businessHours.find(bh => bh.dayOfWeek === index)
        const profSchedule = professionalSchedule.find(ps => ps.dayOfWeek === index)

        return {
          dayOfWeek: index,
          day,
          // Horário padrão da barbearia
          businessHours: {
            isClosed: businessHour?.isClosed ?? false,
            openTime: businessHour?.openTime || null,
            closeTime: businessHour?.closeTime || null,
            interval: businessHour?.interval || null,
          },
          // Horário personalizado do profissional (se houver)
          professional: profSchedule ? {
            id: profSchedule.id,
            startTime: profSchedule.startTime,
            endTime: profSchedule.endTime,
            isActive: profSchedule.isActive,
          } : null,
        }
      })

      return { schedule }
    } catch (error: any) {
      console.error('❌ Erro ao buscar schedule:', error)
      throw error
    }
  })

  // PUT /professionals/:id/schedule - Atualizar horário personalizado do profissional
  app.put('/:id/schedule', async (request: any, reply: any) => {
    try {
      const { tenantId } = request.user
      const { id } = request.params
      const { schedule } = request.body

      // Validar profissional
      const professional = await prisma.professional.findFirst({
        where: { id, tenantId },
      })

      if (!professional) {
        return reply.status(404).send({ error: 'Profissional não encontrado' })
      }

      // Schema para validação
      const scheduleSchema = z.array(
        z.object({
          dayOfWeek: z.number().min(0).max(6),
          startTime: z.string().regex(/^\d{2}:\d{2}$/),
          endTime: z.string().regex(/^\d{2}:\d{2}$/),
          isActive: z.boolean(),
        })
      )

      const validatedSchedule = scheduleSchema.parse(schedule)

      // Deletar schedules antigos
      await prisma.professionalSchedule.deleteMany({
        where: { professionalId: id },
      })

      // Criar novos schedules
      const created = await prisma.professionalSchedule.createMany({
        data: validatedSchedule.map(s => ({
          professionalId: id,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          isActive: s.isActive,
        })),
      })

      // Limpar cache
      try {
        await cacheDeletePattern(`professionals:${tenantId}:*`)
      } catch (cacheError) {
        console.warn('Cache cleanup failed:', cacheError)
      }

      return { message: 'Horário atualizado com sucesso', count: created.count }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.error('❌ Zod validation error:', error.errors)
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      console.error('❌ Erro ao atualizar schedule:', error)
      throw error
    }
  })
}
