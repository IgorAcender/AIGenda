const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function check() {
  try {
    // Ver se há configs
    const configs = await prisma.tenantConfig.findMany()
    console.log('📋 TenantConfigs:', configs.length)
    if (configs[0]) {
      console.log('Exemplo:', JSON.stringify(configs[0], null, 2))
    }

    // Ver se há booking policies
    const policies = await prisma.bookingPolicy.findMany()
    console.log('\n📋 BookingPolicies:', policies.length)
    if (policies[0]) {
      console.log('Exemplo:', JSON.stringify(policies[0], null, 2))
    }

    // Ver se há profissionais
    const professionals = await prisma.professional.findMany({ take: 2 })
    console.log('\n👤 Profissionais:', professionals.length)

    // Ver se há availability rules
    const rules = await prisma.availabilityRule.findMany({ take: 5 })
    console.log('\n⏰ AvailabilityRules:', rules.length)
    if (rules[0]) {
      console.log('Exemplo:', JSON.stringify(rules[0], null, 2))
    }
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

check()
