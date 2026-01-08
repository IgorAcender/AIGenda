import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
(async () => {
  const m = await prisma.tenantEvolutionMapping.findUnique({
    where: { tenantId: 'cmk5s01ek0000m1y6uun4hm2y' }
  });
  console.log('Mapping:', JSON.stringify(m, null, 2));
  await prisma.$disconnect();
})();
