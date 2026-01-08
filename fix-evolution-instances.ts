#!/usr/bin/env node
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔧 Corrigindo instâncias da Evolution...')

    // 1. Desativar instâncias offline (2, 3, 4, 5+)
    console.log('📝 Desativando instâncias offline...')
    const result = await prisma.evolutionInstance.updateMany({
      where: {
        id: {
          in: [2, 3, 4, 5, 6, 7, 8, 9, 10],
        },
      },
      data: {
        isActive: false,
      },
    })
    console.log(`✅ ${result.count} instâncias desativadas`)

    // 2. Manter apenas 8001 ativa
    console.log('📝 Ativando apenas Evolution 1 (porta 8001)...')
    await prisma.evolutionInstance.update({
      where: { id: 1 },
      data: {
        isActive: true,
        url: 'http://localhost:8001',
      },
    })
    console.log('✅ Evolution 1 ativada')

    // 3. Resetar contador de tenants
    console.log('📝 Resetando contador de tenants...')
    await prisma.evolutionInstance.updateMany({
      data: {
        tenantCount: 0,
      },
    })
    console.log('✅ Contadores resetados')

    // 4. Listar status final
    console.log('\n📊 Status final:')
    const instances = await prisma.evolutionInstance.findMany({
      orderBy: { id: 'asc' },
    })
    instances.forEach((inst) => {
      console.log(
        `  ${inst.id.toString().padStart(2, ' ')}: ${inst.name.padEnd(12, ' ')} | ${inst.url.padEnd(30, ' ')} | Active: ${inst.isActive ? '✅' : '❌'} | Tenants: ${inst.tenantCount}`
      )
    })

    console.log('\n✨ Correção concluída!')
  } catch (error) {
    console.error('❌ Erro:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
