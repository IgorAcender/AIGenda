const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Evolution Instances...');

  const isDev = process.env.NODE_ENV !== 'production';

  for (let i = 1; i <= 10; i++) {
    const name = `evolution-${i}`;
    const port = 8000 + i;
    const url = isDev
      ? `http://localhost:${port}`
      : `http://evolution-${i}:${port}`;

    try {
      const existingInstance = await prisma.evolutionInstance.findUnique({
        where: { name },
      });

      if (!existingInstance) {
        const instance = await prisma.evolutionInstance.create({
          data: {
            name,
            url,
            maxConnections: 100,
            tenantCount: 0,
            isActive: true,
          },
        });
        console.log(`✅ Evolution instance "${name}" created (${url})`);
      } else {
        console.log(`⚠️  Evolution instance "${name}" already exists`);
      }
    } catch (error) {
      console.error(`❌ Error creating ${name}:`, error.message);
    }
  }

  console.log(
    '✨ Evolution instances seeded! Capacity: 1.000 tenants (10 × 100)'
  );
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
