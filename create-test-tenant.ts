import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔧 Criando tenant de teste...')

    // Criar tenant
    const tenant = await prisma.tenant.create({
      data: {
        email: 'eu@example.com',
        name: 'Test Tenant',
      },
    })

    console.log(`✅ Tenant criado: ${tenant.id}`)
    console.log(`   Email: ${tenant.email}`)
    console.log(`   Nome: ${tenant.name}`)
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log('⚠️ Tenant já existe')
      const existing = await prisma.tenant.findFirst({
        where: { email: 'eu@example.com' },
      })
      console.log(`   ID: ${existing?.id}`)
    } else {
      throw error
    }
  } finally {
    await prisma.$disconnect()
  }
}

main()
