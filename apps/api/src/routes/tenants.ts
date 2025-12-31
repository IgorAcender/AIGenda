import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

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
  themeTemplate: z.enum(['light', 'dark', 'custom']).optional(),
  backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  textColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  buttonColorPrimary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  buttonTextColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  heroImage: z.string().optional().nullable(),
  sectionsConfig: z.string().optional().nullable(),
  
  // Informações da empresa (Tenant)
  name: z.string().min(2).optional(),
  about: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().optional(),
  
  // Landing page fields
  paymentMethods: z.string().optional(),
  amenities: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  
  // Redes sociais
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  
  // Horários de funcionamento
  businessHours: z.object({
    monday: z.string().optional(),
    tuesday: z.string().optional(),
    wednesday: z.string().optional(),
    thursday: z.string().optional(),
    friday: z.string().optional(),
    saturday: z.string().optional(),
    sunday: z.string().optional(),
  }).optional(),
})

export async function tenantRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate)

  // Buscar dados do tenant atual
  app.get('/me', async (request: any) => {
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
      city: tenant?.city,
      state: tenant?.state,
      zipCode: tenant?.zipCode,
      phone: tenant?.phone,
      whatsapp: tenant?.whatsapp,
      email: tenant?.email,
      instagram: tenant?.instagram,
      facebook: tenant?.facebook,
      twitter: tenant?.twitter,
      paymentMethods: tenant?.paymentMethods,
      amenities: tenant?.amenities,
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

      if (role !== 'ADMIN') {
        return reply.status(403).send({ error: 'Apenas administradores podem atualizar branding' })
      }

      const data = brandingSchema.parse(request.body)

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
        city,
        state,
        zipCode,
        phone,
        whatsapp,
        email,
        instagram,
        facebook,
        twitter,
        ...configData
      } = data

      // Atualizar Configuration (cores, tema, etc)
      const config = await prisma.configuration.upsert({
        where: { tenantId },
        update: configData,
        create: {
          ...configData,
          tenantId,
        },
      })

      // Atualizar Tenant com TODOS os campos
      let tenantData: any = {}
      if (name !== undefined) tenantData.name = name
      if (about !== undefined) tenantData.about = about
      if (description !== undefined) tenantData.description = description
      if (address !== undefined) tenantData.address = address
      if (city !== undefined) tenantData.city = city
      if (state !== undefined) tenantData.state = state
      if (zipCode !== undefined) tenantData.zipCode = zipCode
      if (phone !== undefined) tenantData.phone = phone
      if (whatsapp !== undefined) tenantData.whatsapp = whatsapp
      if (email !== undefined) tenantData.email = email
      if (instagram !== undefined) tenantData.instagram = instagram
      if (facebook !== undefined) tenantData.facebook = facebook
      if (twitter !== undefined) tenantData.twitter = twitter
      if (paymentMethods !== undefined) tenantData.paymentMethods = paymentMethods
      if (amenities !== undefined) tenantData.amenities = amenities
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
            const isClosed = hours.toLowerCase() === 'fechado'
            let openTime = null
            let closeTime = null
            let interval = null

            if (!isClosed) {
              // Parse "08:00 - 17:00" ou "08:00 - 17:00 (Intervalo: 12:00-14:00)"
              const match = hours.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})(?:\s*\(Intervalo:\s*([^\)]+)\))?/)
              if (match) {
                openTime = match[1]
                closeTime = match[2]
                interval = match[3] || null
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
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      throw error
    }
  })
}
