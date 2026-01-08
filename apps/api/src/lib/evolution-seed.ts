import { prisma } from './prisma'

/**
 * Garante que as Evolution Instances estão seeded no banco
 * Executa apenas uma vez na inicialização
 */
export async function ensureEvolutionInstancesSeeded(): Promise<void> {
  try {
    const existingCount = await prisma.evolutionInstance.count()
    
    // Se já existem instâncias, não precisa fazer nada
    if (existingCount > 0) {
      console.log(`✅ Evolution instances já seeded (${existingCount} encontradas)`)
      return
    }

    console.log('🌱 Seeding Evolution Instances...')
    
    const isDev = process.env.NODE_ENV !== 'production'
    const EVOLUTION_COUNT = 10

    for (let i = 1; i <= EVOLUTION_COUNT; i++) {
      const name = `evolution-${i}`
      const port = 8000 + i
      const url = isDev
        ? `http://localhost:${port}`
        : `http://evolution-${i}:${port}`

      try {
        const instance = await prisma.evolutionInstance.create({
          data: {
            name,
            url,
            maxConnections: 100,
            tenantCount: 0,
            isActive: true,
          },
        })
        console.log(`✅ Evolution instance "${name}" criada (${url})`)
      } catch (error: any) {
        if (error.code === 'P2002') {
          // Unique constraint violated - já existe
          console.log(`⚠️  Evolution instance "${name}" já existe`)
        } else {
          throw error
        }
      }
    }

    console.log(
      `✨ Evolution instances inicializadas! Capacidade: ${EVOLUTION_COUNT * 100} tenants (${EVOLUTION_COUNT} × 100)`
    )
  } catch (error) {
    console.error('❌ Erro ao seed Evolution instances:', error)
    // Não faz fail - talvez o banco não esteja pronto ainda
  }
}
