import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // ============= CRIAR USUÁRIO MASTER =============
  const masterEmail = 'igor@aigenda.com'
  const masterPassword = 'Master@123' // MUDE DEPOIS!
  
  const existingMaster = await prisma.user.findUnique({
    where: { email: masterEmail }
  })

  if (!existingMaster) {
    const hashedPassword = await bcrypt.hash(masterPassword, 10)
    
    const master = await prisma.user.create({
      data: {
        email: masterEmail,
        password: hashedPassword,
        name: 'Igor - Master',
        role: 'MASTER',
        // MASTER não tem tenant
        tenantId: null,
        professionalId: null,
      }
    })
    
    console.log('✅ Usuário MASTER criado:')
    console.log(`   Email: ${masterEmail}`)
    console.log(`   Senha: ${masterPassword}`)
    console.log(`   ID: ${master.id}`)
  } else {
    console.log('⚠️  Usuário MASTER já existe')
  }

  // ============= CRIAR TENANT DE EXEMPLO =============
  const exampleTenantSlug = 'barbearia-exemplo'
  
  const existingTenant = await prisma.tenant.findUnique({
    where: { slug: exampleTenantSlug }
  })

  if (!existingTenant) {
    const ownerPassword = 'Dono@123' // MUDE DEPOIS!
    const hashedOwnerPassword = await bcrypt.hash(ownerPassword, 10)

    const tenant = await prisma.tenant.create({
      data: {
        name: 'Barbearia Exemplo',
        slug: exampleTenantSlug,
        email: 'contato@barbearia-exemplo.com',
        phone: '(11) 99999-9999',
        address: 'Rua Exemplo, 123',
        city: 'São Paulo',
        state: 'SP',
        users: {
          create: {
            email: 'dono@barbearia-exemplo.com',
            password: hashedOwnerPassword,
            name: 'João Silva',
            role: 'OWNER',
            phone: '(11) 99999-9999',
          }
        },
        configs: {
          create: {
            businessName: 'Barbearia Exemplo',
            businessPhone: '(11) 99999-9999',
            workStartTime: '09:00',
            workEndTime: '19:00',
            slotDuration: 30,
          }
        },
        categories: {
          create: [
            { name: 'Cortes', color: '#3B82F6' },
            { name: 'Barba', color: '#10B981' },
            { name: 'Tratamentos', color: '#8B5CF6' },
          ]
        },
      },
      include: {
        users: true,
        categories: true,
      }
    })

    console.log('✅ Tenant de exemplo criado:')
    console.log(`   Nome: ${tenant.name}`)
    console.log(`   Slug: ${tenant.slug}`)
    console.log(`   Owner Email: dono@barbearia-exemplo.com`)
    console.log(`   Owner Senha: ${ownerPassword}`)

    // Criar serviços de exemplo
    const corteCategory = tenant.categories.find((c: { name: string }) => c.name === 'Cortes')
    const barbaCategory = tenant.categories.find((c: { name: string }) => c.name === 'Barba')

    await prisma.service.createMany({
      data: [
        { 
          name: 'Corte Masculino', 
          price: 45, 
          duration: 30, 
          categoryId: corteCategory?.id,
          tenantId: tenant.id,
          color: '#3B82F6',
        },
        { 
          name: 'Corte + Barba', 
          price: 70, 
          duration: 45, 
          categoryId: corteCategory?.id,
          tenantId: tenant.id,
          color: '#6366F1',
        },
        { 
          name: 'Barba Completa', 
          price: 35, 
          duration: 30, 
          categoryId: barbaCategory?.id,
          tenantId: tenant.id,
          color: '#10B981',
        },
        { 
          name: 'Barba Desenho', 
          price: 45, 
          duration: 40, 
          categoryId: barbaCategory?.id,
          tenantId: tenant.id,
          color: '#059669',
        },
      ]
    })

    console.log('✅ Serviços de exemplo criados')

    // Criar profissional de exemplo
    const professional = await prisma.professional.create({
      data: {
        name: 'Carlos Barbeiro',
        email: 'carlos@barbearia-exemplo.com',
        phone: '(11) 98888-8888',
        specialty: 'Cortes e Barbas',
        color: '#EF4444',
        commission: 40,
        tenantId: tenant.id,
        schedules: {
          create: [
            { dayOfWeek: 1, startTime: '09:00', endTime: '19:00' }, // Segunda
            { dayOfWeek: 2, startTime: '09:00', endTime: '19:00' }, // Terça
            { dayOfWeek: 3, startTime: '09:00', endTime: '19:00' }, // Quarta
            { dayOfWeek: 4, startTime: '09:00', endTime: '19:00' }, // Quinta
            { dayOfWeek: 5, startTime: '09:00', endTime: '19:00' }, // Sexta
            { dayOfWeek: 6, startTime: '09:00', endTime: '14:00' }, // Sábado
          ]
        }
      }
    })

    // Criar login para o profissional
    const professionalPassword = 'Barbeiro@123'
    const hashedProfessionalPassword = await bcrypt.hash(professionalPassword, 10)

    await prisma.user.create({
      data: {
        email: 'carlos@barbearia-exemplo.com',
        password: hashedProfessionalPassword,
        name: 'Carlos Barbeiro',
        role: 'PROFESSIONAL',
        tenantId: tenant.id,
        professionalId: professional.id,
      }
    })

    console.log('✅ Profissional de exemplo criado:')
    console.log(`   Nome: ${professional.name}`)
    console.log(`   Email: carlos@barbearia-exemplo.com`)
    console.log(`   Senha: ${professionalPassword}`)

    // Criar alguns clientes de exemplo
    await prisma.client.createMany({
      data: [
        { 
          name: 'Pedro Santos', 
          email: 'pedro@email.com', 
          phone: '(11) 97777-7777',
          tenantId: tenant.id,
        },
        { 
          name: 'Lucas Oliveira', 
          email: 'lucas@email.com', 
          phone: '(11) 96666-6666',
          tenantId: tenant.id,
        },
        { 
          name: 'Marcos Silva', 
          email: 'marcos@email.com', 
          phone: '(11) 95555-5555',
          tenantId: tenant.id,
        },
      ]
    })

    console.log('✅ Clientes de exemplo criados')

  } else {
    console.log('⚠️  Tenant de exemplo já existe')
  }

  // ============= CRIAR POLÍTICAS DE AGENDAMENTO =============
  console.log('📋 Criando políticas de agendamento...')

  const tenantsToUpdatePolicy = await prisma.tenant.findMany()

  for (const tenant of tenantsToUpdatePolicy) {
    const existingPolicy = await prisma.bookingPolicy.findUnique({
      where: { tenantId: tenant.id }
    })

    if (!existingPolicy) {
      await prisma.bookingPolicy.create({
        data: {
          tenantId: tenant.id,
          allowCancellation: true,
          minCancellationHours: 24,
          maxCancellationsPerMonth: 3,
          allowRescheduling: true,
          minReschedulingHours: 24,
          maxReschedulings: 2,
          minAdvanceBookingHours: 2,
          maxAdvanceBookingDays: 30,
          slotDurationMinutes: 30,
        }
      })
      console.log(`✅ Política de agendamento criada para tenant: ${tenant.slug}`)
    }
  }

  // ============= CRIAR REGRAS DE DISPONIBILIDADE =============
  console.log('🕒 Criando regras de disponibilidade...')

  const professionals = await prisma.professional.findMany()

  for (const professional of professionals) {
    // Verificar se já tem regras
    const existingRules = await prisma.availabilityRule.findMany({
      where: { professionalId: professional.id }
    })

    if (existingRules.length === 0) {
      // Criar regras para Segunda a Sexta (0 = domingo, 1 = segunda, etc)
      const workingDays = [1, 2, 3, 4, 5] // Segunda a Sexta

      for (const dayOfWeek of workingDays) {
        await prisma.availabilityRule.create({
          data: {
            professionalId: professional.id,
            dayOfWeek,
            startTime: '09:00',
            endTime: '18:00',
            isActive: true,
          }
        })
      }
      console.log(`✅ Regras de disponibilidade criadas para: ${professional.name}`)
    }
  }

  console.log('')
  console.log('🎉 Seed concluído!')
  console.log('')
  console.log('📋 Logins disponíveis:')
  console.log('┌─────────────────────────────────────────────────────────────┐')
  console.log('│ MASTER (Você - Admin do SaaS)                               │')
  console.log('│ Email: igor@aigenda.com                                     │')
  console.log('│ Senha: Master@123                                           │')
  console.log('├─────────────────────────────────────────────────────────────┤')
  console.log('│ OWNER (Dono da Barbearia Exemplo)                           │')
  console.log('│ Email: dono@barbearia-exemplo.com                           │')
  console.log('│ Senha: Dono@123                                             │')
  console.log('├─────────────────────────────────────────────────────────────┤')
  console.log('│ PROFESSIONAL (Barbeiro)                                     │')
  console.log('│ Email: carlos@barbearia-exemplo.com                         │')
  console.log('│ Senha: Barbeiro@123                                         │')
  console.log('└─────────────────────────────────────────────────────────────┘')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
