const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🌱 SEED: Criando tenant de teste com dados reais');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // ===== PASSO 1: CRIAR TENANT =====
    console.log('📌 PASSO 1: Criando Tenant...\n');

    let tenant = await prisma.tenant.findUnique({
      where: { slug: 'salao-da-maria' },
    });

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          slug: 'salao-da-maria',
          name: 'Salão da Maria',
          email: 'maria@salao.com',
          phone: '(11) 98765-4321',
          logo: null,
          banner: null,
          description: 'Salão de beleza e estética',
          website: 'https://salao-da-maria.com',
          address: 'Rua das Flores, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          country: 'Brasil',
          instagram: '@salao_da_maria',
          facebook: 'Salão da Maria',
        },
      });
      console.log('✅ Tenant criado com sucesso!');
    } else {
      console.log('✅ Tenant já existe');
    }

    console.log(`   ID: ${tenant.id}`);
    console.log(`   Nome: ${tenant.name}`);
    console.log(`   Slug: ${tenant.slug}\n`);

    // ===== PASSO 2: CRIAR USUÁRIO OWNER =====
    console.log('📌 PASSO 2: Criando Usuário OWNER...\n');

    let ownerUser = await prisma.user.findUnique({
      where: { email: 'maria@salao.com' },
    });

    if (!ownerUser) {
      const hashedPassword = await bcrypt.hash('Maria@123', 10);
      ownerUser = await prisma.user.create({
        data: {
          name: 'Maria Silva',
          email: 'maria@salao.com',
          password: hashedPassword,
          role: 'OWNER',
          tenantId: tenant.id,
          isActive: true,
        },
      });
      console.log('✅ Usuário OWNER criado com sucesso!');
    } else {
      console.log('✅ Usuário OWNER já existe');
    }

    console.log(`   Email: ${ownerUser.email}`);
    console.log(`   Nome: ${ownerUser.name}`);
    console.log(`   Senha: Maria@123 (use para login)\n`);

    // ===== PASSO 3: CRIAR MAPPING COM EVOLUTION =====
    console.log('📌 PASSO 3: Criando Mapping com Evolution API...\n');

    let mapping = await prisma.tenantEvolutionMapping.findUnique({
      where: { tenantId: tenant.id },
    });

    if (!mapping) {
      const evolution = await prisma.evolutionInstance.findFirst({
        where: { isActive: true },
      });

      if (evolution) {
        mapping = await prisma.tenantEvolutionMapping.create({
          data: {
            tenantId: tenant.id,
            evolutionInstanceId: evolution.id,
            isConnected: false,
          },
        });
        console.log('✅ Mapping criado com sucesso!');
        console.log(`   Tenant: ${tenant.id}`);
        console.log(`   Evolution: ${evolution.id}\n`);
      } else {
        console.log('❌ Erro: Nenhuma Evolution disponível');
        console.log('   Execute: node seed-evolution.js\n');
        process.exit(1);
      }
    } else {
      console.log('✅ Mapping já existe\n');
    }

    // ===== RESUMO =====
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ SEED CONCLUÍDO COM SUCESSO!\n');
    console.log('📋 Dados para teste:\n');
    console.log(`   Tenant ID: ${tenant.id}`);
    console.log(`   Tenant Name: ${tenant.name}`);
    console.log(`   Tenant Slug: ${tenant.slug}`);
    console.log(`   Email: ${ownerUser.email}`);
    console.log(`   Senha: Maria@123\n`);
    console.log('🚀 Próximo passo: Fazer login no frontend com essas credenciais');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
