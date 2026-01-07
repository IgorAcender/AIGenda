import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import * as fs from 'fs'
import * as path from 'path'
import { pipeline } from 'stream/promises'

const tenantUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  logo: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
})

const configSchema = z.object({
  businessHours: z.boolean().optional(),
  weekStartDay: z.number().min(0).max(6).optional(),
  appointmentDuration: z.number().min(5).optional(),
  bufferBetweenAppts: z.number().min(0).optional(),
  autoConfirmAppointments: z.boolean().optional(),
  allowCancellation: z.boolean().optional(),
  cancellationDeadline: z.number().min(0).optional(),
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  whatsappNotifications: z.boolean().optional(),
})

const brandingSchema = z.object({
  // Tema e cores
  themeTemplate: z.enum(['light', 'dark', 'ocean', 'sunset', 'royal', 'rose', 'sunshine', 'custom']).optional(),
  backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional().nullable(),
  textColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional().nullable(),
  buttonColorPrimary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional().nullable(),
  buttonTextColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional().nullable(),
  heroImage: z.string().optional().nullable(),
  sectionsConfig: z.string().optional().nullable(),
  
  // Informações da empresa (Tenant)
  name: z.string().min(2).optional().nullable(),
  about: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  
  // Landing page fields
  paymentMethods: z.string().optional().nullable(),
  amenities: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  
  // Redes sociais
  instagram: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  twitter: z.string().optional().nullable(),
  
  // Horários de funcionamento - aceita qualquer formato
  businessHours: z.record(z.any()).optional(),
})

// ========== ROTAS PÚBLICAS (sem autenticação) ==========
export async function tenantPublicRoutes(app: FastifyInstance) {
  // Obter configuração de blocos da landing page (PUBLICO - sem autenticação)
  app.get('/landing-blocks/:tenantSlug', async (request: any, reply: any) => {
    try {
      const { tenantSlug } = request.params

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { 
          id: true,
          landingBlocks: true 
        } as any,
      })

      if (!tenant) {
        return reply.status(404).send({ error: 'Tenant não encontrado' })
      }

      if (!tenant.landingBlocks) {
        // Retornar configuração padrão se não existir
        const defaultBlocks = [
          { id: 'sobre-nos', name: 'sobre-nos', label: 'Sobre Nós', enabled: true, order: 1 },
          { id: 'equipe', name: 'equipe', label: 'Profissionais', enabled: true, order: 2 },
          { id: 'contato', name: 'contato', label: 'Horário & Contato', enabled: true, order: 3 },
        ]
        return { blocks: defaultBlocks }
      }

      const blocks = typeof tenant.landingBlocks === 'string' 
        ? JSON.parse(tenant.landingBlocks)
        : tenant.landingBlocks

      return { blocks }
    } catch (error) {
      console.error('Erro ao buscar blocos da landing page:', error)
      return reply.status(500).send({ error: 'Erro ao buscar configuração de blocos' })
    }
  })
}

// ========== ROTAS AUTENTICADAS ==========
export async function tenantRoutes(app: FastifyInstance) {
  // Hook de autenticação para TODAS as rotas deste plugin
  app.addHook('preHandler', app.authenticate)

  // Obter blocos por autenticação (GET /landing-blocks sem slug)
  app.get('/landing-blocks', async (request: any, reply: any) => {
    try {
      // Verificar autenticação manualmente
      try {
        await request.jwtVerify()
      } catch {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const { tenantId } = request.user

      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { landingBlocks: true } as any,
      })

      if (!tenant) {
        return reply.status(404).send({ error: 'Tenant não encontrado' })
      }

      if (!tenant.landingBlocks) {
        const defaultBlocks = [
          { id: 'sobre-nos', name: 'sobre-nos', label: 'Sobre Nós', enabled: true, order: 1 },
          { id: 'equipe', name: 'equipe', label: 'Profissionais', enabled: true, order: 2 },
          { id: 'contato', name: 'contato', label: 'Horário & Contato', enabled: true, order: 3 },
        ]
        return { blocks: defaultBlocks }
      }

      const blocks = typeof tenant.landingBlocks === 'string' 
        ? JSON.parse(tenant.landingBlocks)
        : tenant.landingBlocks

      return { blocks }
    } catch (error) {
      console.error('Erro ao buscar blocos (autenticado):', error)
      return reply.status(500).send({ error: 'Erro ao buscar configuração de blocos' })
    }
  })

  // Buscar dados do tenant atual
  app.get('/me', async (request: any, reply: any) => {
    try {
      await request.jwtVerify()
    } catch {
      return reply.status(401).send({ error: 'Não autorizado' })
    }

    const { tenantId } = request.user

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        configs: true,
        subscriptions: true,
        _count: {
          select: {
            clients: true,
            professionals: true,
            services: true,
          },
        },
      },
    })

    return tenant
  })

  // Atualizar dados do tenant
  app.put('/me', async (request: any, reply: any) => {
    try {
      const { tenantId, role } = request.user
      
      if (role !== 'ADMIN') {
        return reply.status(403).send({ error: 'Apenas administradores podem atualizar dados da empresa' })
      }

      const data = tenantUpdateSchema.parse(request.body)

      const tenant = await prisma.tenant.update({
        where: { id: tenantId },
        data,
      })

      return tenant
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      throw error
    }
  })

  // Buscar configurações
  app.get('/config', async (request: any) => {
    const { tenantId } = request.user

    const config = await prisma.configuration.findUnique({
      where: { tenantId },
    })

    return config
  })

  // Atualizar configurações
  app.put('/config', async (request: any, reply: any) => {
    try {
      const { tenantId, role } = request.user
      
      if (role !== 'ADMIN') {
        return reply.status(403).send({ error: 'Apenas administradores podem atualizar configurações' })
      }

      const data = configSchema.parse(request.body)

      const config = await prisma.configuration.upsert({
        where: { tenantId },
        update: data,
        create: {
          ...data,
          tenantId,
        },
      })

      return config
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      throw error
    }
  })

  // Listar usuários do tenant
  app.get('/users', async (request: any) => {
    const { tenantId } = request.user

    const users = await prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        avatar: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    })

    return { data: users }
  })

  // ========== BRANDING ENDPOINTS ==========

  // Buscar configurações de branding
  app.get('/branding', async (request: any) => {
    const { tenantId } = request.user

    const [config, tenant] = await Promise.all([
      prisma.configuration.findUnique({
        where: { tenantId },
      }),
      prisma.tenant.findUnique({
        where: { id: tenantId },
        include: {
          businessHours: {
            orderBy: { dayOfWeek: 'asc' },
          },
        },
      }),
    ])

    // Transformar businessHours em objeto
    const businessHoursMap: { [key: string]: string } = {}
    if (tenant?.businessHours) {
      const daysMap = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      tenant.businessHours.forEach((bh: any) => {
        const dayName = daysMap[bh.dayOfWeek]
        if (bh.isClosed) {
          businessHoursMap[dayName] = 'Fechado'
        } else {
          let time = `${bh.openTime} - ${bh.closeTime}`
          if (bh.interval) {
            time += ` (Intervalo: ${bh.interval})`
          }
          businessHoursMap[dayName] = time
        }
      })
    }

    return config ? {
      // Configuration (cores, tema)
      themeTemplate: config.themeTemplate,
      backgroundColor: config.backgroundColor,
      textColor: config.textColor,
      buttonColorPrimary: config.buttonColorPrimary,
      buttonTextColor: config.buttonTextColor,
      heroImage: config.heroImage,
      sectionsConfig: config.sectionsConfig,
      
      // Tenant data (informações da empresa)
      name: tenant?.name,
      about: tenant?.about,
      description: tenant?.description,
      address: tenant?.address,
      district: tenant?.district,
      city: tenant?.city,
      state: tenant?.state,
      zipCode: tenant?.zipCode,
      phone: tenant?.phone,
      whatsapp: tenant?.whatsapp,
      email: tenant?.email,
      instagram: tenant?.instagram,
      facebook: tenant?.facebook,
      twitter: tenant?.twitter,
      paymentMethods: tenant?.paymentMethods ? 
        (typeof tenant.paymentMethods === 'string' && tenant.paymentMethods.startsWith('[')
          ? tenant.paymentMethods
          : JSON.stringify(tenant.paymentMethods.split('\n').filter(m => m.trim())))
        : null,
      amenities: tenant?.amenities ?
        (typeof tenant.amenities === 'string' && tenant.amenities.startsWith('[')
          ? tenant.amenities
          : JSON.stringify(tenant.amenities.split('\n').filter(a => a.trim())))
        : null,
      latitude: tenant?.latitude,
      longitude: tenant?.longitude,
      businessHours: businessHoursMap,
    } : {
      // Default values
      themeTemplate: 'light',
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      buttonColorPrimary: '#505afb',
      buttonTextColor: '#FFFFFF',
      heroImage: null,
      sectionsConfig: null,
      name: null,
      about: null,
      description: null,
      address: null,
      district: null,
      city: null,
      state: null,
      zipCode: null,
      phone: null,
      whatsapp: null,
      email: null,
      instagram: null,
      facebook: null,
      twitter: null,
      paymentMethods: null,
      amenities: null,
      latitude: null,
      longitude: null,
      businessHours: {},
    }
  })

  // Atualizar configurações de branding
  app.put('/branding', async (request: any, reply: any) => {
    try {
      const { tenantId, role } = request.user

      // Qualquer usuário do tenant pode atualizar (OWNER, PROFESSIONAL)
      // Apenas MASTER não pode (ele não tem tenantId)
      if (!tenantId) {
        return reply.status(403).send({ error: 'Você não tem permissão para atualizar branding' })
      }

      console.log('🎨 PUT /branding - Request body recebido:', JSON.stringify(request.body, null, 2))

      let data
      try {
        data = brandingSchema.parse(request.body)
        console.log('✅ Dados validados com sucesso:', JSON.stringify(data, null, 2))
      } catch (zodError: any) {
        console.error('❌ Erro de validação Zod:', zodError.errors)
        return reply.status(400).send({ 
          error: 'Erro de validação', 
          details: zodError.errors 
        })
      }

      // Separar dados de Tenant dos dados de Configuration
      const {
        paymentMethods,
        amenities,
        latitude,
        longitude,
        businessHours,
        name,
        about,
        description,
        address,
        district,
        city,
        state,
        zipCode,
        phone,
        whatsapp,
        email,
        instagram,
        facebook,
        twitter,
        heroImage, // Extrair heroImage separadamente para salvar também no Tenant.banner
        ...configData
      } = data

      // Limpar valores null do configData e adicionar heroImage
      const cleanConfigData = Object.fromEntries(
        Object.entries({ ...configData, heroImage }).filter(([, v]) => v !== null && v !== undefined)
      )

      // Atualizar Configuration (cores, tema, etc)
      const config = await prisma.configuration.upsert({
        where: { tenantId },
        update: cleanConfigData,
        create: {
          ...cleanConfigData,
          tenantId,
        },
      })

      // Atualizar Tenant com TODOS os campos
      let tenantData: any = {}
      if (name !== undefined) tenantData.name = name
      if (about !== undefined) tenantData.about = about
      if (description !== undefined) tenantData.description = description
      if (address !== undefined) tenantData.address = address
      if (district !== undefined) tenantData.district = district
      if (city !== undefined) tenantData.city = city
      if (state !== undefined) tenantData.state = state
      if (zipCode !== undefined) tenantData.zipCode = zipCode
      if (phone !== undefined) tenantData.phone = phone
      if (whatsapp !== undefined) tenantData.whatsapp = whatsapp
      if (email !== undefined) tenantData.email = email
      if (instagram !== undefined) tenantData.instagram = instagram
      if (facebook !== undefined) tenantData.facebook = facebook
      if (twitter !== undefined) tenantData.twitter = twitter
      // Salvar heroImage também como banner no Tenant para uso na landing page pública
      if (heroImage !== undefined) tenantData.banner = heroImage
      // Converter para JSON se for string com quebras de linha
      if (paymentMethods !== undefined) {
        tenantData.paymentMethods = Array.isArray(paymentMethods) 
          ? JSON.stringify(paymentMethods)
          : typeof paymentMethods === 'string' && paymentMethods.includes('\n')
            ? JSON.stringify(paymentMethods.split('\n').filter(m => m.trim()))
            : paymentMethods
      }
      if (amenities !== undefined) {
        tenantData.amenities = Array.isArray(amenities)
          ? JSON.stringify(amenities)
          : typeof amenities === 'string' && amenities.includes('\n')
            ? JSON.stringify(amenities.split('\n').filter(a => a.trim()))
            : amenities
      }
      if (latitude !== undefined) tenantData.latitude = latitude
      if (longitude !== undefined) tenantData.longitude = longitude

      if (Object.keys(tenantData).length > 0) {
        await prisma.tenant.update({
          where: { id: tenantId },
          data: tenantData,
        })
      }

      // Atualizar BusinessHours se fornecido
      if (businessHours) {
        const daysMap = {
          monday: 0,
          tuesday: 1,
          wednesday: 2,
          thursday: 3,
          friday: 4,
          saturday: 5,
          sunday: 6,
        }

        for (const [day, hours] of Object.entries(businessHours)) {
          const dayOfWeek = daysMap[day as keyof typeof daysMap]
          if (hours) {
            let isClosed = false
            let openTime = null
            let closeTime = null
            let interval = null

            // Se é um objeto com campos separados
            if (typeof hours === 'object' && hours !== null) {
              const hourObj = hours as any
              isClosed = hourObj.isClosed ?? false
              openTime = hourObj.openTime ?? null
              closeTime = hourObj.closeTime ?? null
              interval = hourObj.interval ?? null
            } else if (typeof hours === 'string') {
              // Se é uma string no formato antigo
              isClosed = hours.toLowerCase() === 'fechado'

              if (!isClosed) {
                // Parse "08:00 - 17:00" ou "08:00 - 17:00 (Intervalo: 12:00-14:00)"
                const match = hours.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})(?:\s*\(Intervalo:\s*([^\)]+)\))?/)
                if (match) {
                  openTime = match[1]
                  closeTime = match[2]
                  interval = match[3] || null
                }
              }
            }

            await prisma.businessHours.upsert({
              where: {
                tenantId_dayOfWeek: {
                  tenantId,
                  dayOfWeek,
                },
              },
              update: {
                isClosed,
                openTime,
                closeTime,
                interval,
              },
              create: {
                tenantId,
                dayOfWeek,
                isClosed,
                openTime,
                closeTime,
                interval,
              },
            })
          }
        }
      }

      return config
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Erro de validação de branding:', error.errors)
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      console.error('Erro ao atualizar branding:', error)
      throw error
    }
  })

  // Salvar configuração de blocos da landing page
  app.put('/landing-blocks', async (request: any, reply: any) => {
    try {
      const { tenantId, role } = request.user

      if (role !== 'ADMIN' && role !== 'OWNER') {
        return reply.status(403).send({ error: 'Apenas administradores podem atualizar blocos da landing page' })
      }

      const { blocks } = request.body

      if (!Array.isArray(blocks)) {
        return reply.status(400).send({ error: 'Blocos deve ser um array' })
      }

      // Validar estrutura de cada bloco
      blocks.forEach((block: any, index: number) => {
        if (!block.id || !block.name || !block.label || typeof block.enabled !== 'boolean' || typeof block.order !== 'number') {
          throw new Error(`Bloco ${index} tem estrutura inválida`)
        }
      })

      // Salvar configuração no tenant
      const tenant: any = await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          landingBlocks: JSON.stringify(blocks),
        } as any,
        select: { landingBlocks: true } as any,
      })

      const updatedBlocks = typeof tenant.landingBlocks === 'string'
        ? JSON.parse(tenant.landingBlocks)
        : tenant.landingBlocks

      return { 
        blocks: updatedBlocks,
        message: 'Configuração de blocos atualizada com sucesso'
      }
    } catch (error) {
      console.error('Erro ao salvar blocos da landing page:', error)
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message })
      }
      return reply.status(500).send({ error: 'Erro ao salvar configuração de blocos' })
    }
  })

  // Upload de imagem
  app.post('/upload', async (request: any, reply) => {
    const { tenantId } = request.user

    try {
      const data = await request.file()
      
      if (!data) {
        return reply.status(400).send({ error: 'Nenhum arquivo enviado' })
      }

      // Validar tipo de arquivo
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedMimeTypes.includes(data.mimetype)) {
        return reply.status(400).send({ error: 'Tipo de arquivo não permitido. Use: JPG, PNG, GIF ou WebP' })
      }

      // Criar diretório de uploads se não existir
      const uploadsDir = path.join(process.cwd(), 'uploads', tenantId)
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }

      // Gerar nome único para o arquivo
      const ext = path.extname(data.filename) || '.jpg'
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`
      const filePath = path.join(uploadsDir, uniqueName)

      // Salvar arquivo
      await pipeline(data.file, fs.createWriteStream(filePath))

      // URL pública do arquivo
      const fileUrl = `/uploads/${tenantId}/${uniqueName}`

      return { 
        url: fileUrl,
        filename: uniqueName,
        message: 'Upload realizado com sucesso' 
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      return reply.status(500).send({ error: 'Erro ao fazer upload do arquivo' })
    }
  })
}
