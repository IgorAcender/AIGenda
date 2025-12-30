import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Começando seed de landing page...\n')

  // Buscar todos os tenants
  const tenants = await prisma.tenant.findMany()

  for (const tenant of tenants) {
    console.log(`📍 Processando tenant: ${tenant.name}`)

    // Verificar se já tem horários de funcionamento
    const existingHours = await prisma.businessHours.findFirst({
      where: { tenantId: tenant.id },
    })

    if (!existingHours) {
      // Criar horários padrão
      const defaultHours = [
        { day: 0, open: '08:00', close: '17:00', interval: '12:00-14:00' }, // Segunda
        { day: 1, open: '08:00', close: '21:00', interval: null }, // Terça
        { day: 2, open: '08:00', close: '21:00', interval: null }, // Quarta
        { day: 3, open: '08:00', close: '21:00', interval: null }, // Quinta
        { day: 4, open: '08:00', close: '18:00', interval: null }, // Sexta
        { day: 5, open: '08:00', close: '14:00', interval: null }, // Sábado
        { day: 6, open: null, close: null, interval: null }, // Domingo (Fechado)
      ]

      for (const hour of defaultHours) {
        await prisma.businessHours.create({
          data: {
            tenantId: tenant.id,
            dayOfWeek: hour.day,
            isClosed: hour.open === null,
            openTime: hour.open,
            closeTime: hour.close,
            interval: hour.interval,
          },
        })
      }
      console.log(`  ✅ Horários de funcionamento criados`)
    } else {
      console.log(`  ℹ️  Horários de funcionamento já existem`)
    }

    // Atualizar tenant com dados de landing page
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        banner: tenant.banner || undefined,
        latitude: tenant.latitude || -19.8267,
        longitude: tenant.longitude || -43.9945,
        paymentMethods: tenant.paymentMethods || JSON.stringify(['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro']),
        amenities: tenant.amenities || JSON.stringify(['WiFi', 'Acessibilidade', 'Estacionamento']),
      },
    })
    console.log(`  ✅ Dados de landing page atualizados`)
  }

  console.log('\n✨ Seed finalizado com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
