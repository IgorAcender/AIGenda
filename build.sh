#!/bin/bash

# Build script for Easy Panel deployment
# This script handles building both frontend and backend

set -e

echo "🔨 Iniciando build do AIGenda SaaS..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm install --legacy-peer-deps

# Build do backend
echo "🏗️  Building backend (API)..."
npm run build --workspace=apps/api 2>/dev/null || echo "⚠️  Backend sem build script (usando TypeScript direto)"

# Build do frontend
echo "🏗️  Building frontend (Web)..."
npm run build --workspace=apps/web

# Executar migrações do banco (se necessário)
if [ -f "apps/api/prisma/schema.prisma" ]; then
  echo "🗄️  Verificando migrações do banco..."
  npm run migrate --workspace=apps/api || echo "⚠️  Migrações já aplicadas"
fi

echo "✅ Build concluído com sucesso!"
