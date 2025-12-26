import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Criando configurações de agendamento...')

  // Buscar todos os tenants
  const tenants = await prisma.tenant.findMany()

  for (const tenant of tenants) {
    console.log(`\n📋 Configurando tenant: ${tenant.name}`)

    // 1. Criar TenantConfig se não existir
    let config = await prisma.tenantConfig.findUnique({
      where: { tenantId: tenant.id },
    })

    if (!config) {
      config = await prisma.tenantConfig.create({
        data: {
          tenantId: tenant.id,
          workStartTime: '08:00',
          workEndTime: '18:00',
          workDays: '1,2,3,4,5', // Segunda a Sexta
          slotDuration: 30,
          bufferTime: 0,
          maxAdvanceBooking: 60, // 60 dias
        },
      })
      console.log('  ✅ TenantConfig criado')
    } else {
      console.log('  ℹ️  TenantConfig já existe')
    }

    // 2. Criar BookingPolicy se não existir
    let policy = await prisma.bookingPolicy.findUnique({
      where: { tenantId: tenant.id },
    })

    if (!policy) {
      policy = await prisma.bookingPolicy.create({
        data: {
          tenantId: tenant.id,
          slotDurationMinutes: 30,
          bufferBetweenSlots: 0,
          maxConcurrentBookings: 1,
          requiresApproval: false,
          allowCancellation: true,
          cancellationDeadlineHours: 24,
          minAdvanceBookingHours: 1,
          maxAdvanceBookingDays: 90,
        },
      })
      console.log('  ✅ BookingPolicy criado')
    } else {
      console.log('  ℹ️  BookingPolicy já existe')
    }

    console.log(`  ⏰ Horário de funcionamento: ${config.workStartTime} - ${config.workEndTime}`)
    console.log(`  📅 Dias de trabalho: ${config.workDays}`)
    console.log(`  ⌛ Duração do slot: ${policy.slotDurationMinutes} minutos`)
  }

  console.log('\n✅ Seed concluído!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erro:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
