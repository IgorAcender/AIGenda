import { prisma } from './src/lib/prisma'

async function check() {
  try {
    // Ver se há configs
    const configs = await prisma.tenantConfig.findMany()
    console.log('📋 TenantConfigs:', configs.length)
    if (configs[0]) {
      console.log('workStartTime:', configs[0].workStartTime)
      console.log('workEndTime:', configs[0].workEndTime)
      console.log('workDays:', configs[0].workDays)
    }

    // Ver se há booking policies
    const policies = await prisma.bookingPolicy.findMany()
    console.log('\n📋 BookingPolicies:', policies.length)
    if (policies[0]) {
      console.log('slotDurationMinutes:', policies[0].slotDurationMinutes)
      console.log('minAdvanceBookingHours:', policies[0].minAdvanceBookingHours)
      console.log('maxAdvanceBookingDays:', policies[0].maxAdvanceBookingDays)
    }

    // Ver se há profissionais
    const professionals = await prisma.professional.findMany({ take: 2 })
    console.log('\n👤 Profissionais:', professionals.length)

    // Ver se há availability rules
    const rules = await prisma.availabilityRule.findMany({ take: 5 })
    console.log('\n⏰ AvailabilityRules:', rules.length)
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

check()
