#!/bin/bash

# Start script for Easy Panel deployment
# This script handles starting both frontend and backend with PM2

set -e

echo "🚀 Iniciando AIGenda SaaS..."

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
  echo "📦 Instalando PM2 globalmente..."
  npm install -g pm2
fi

# Verificar variáveis de ambiente
if [ ! -f "apps/api/.env" ]; then
  echo "⚠️  Criando .env do backend baseado em .env.example..."
  cp apps/api/.env.example apps/api/.env
fi

if [ ! -f "apps/web/.env.local" ]; then
  echo "⚠️  Criando .env do frontend baseado em .env.example..."
  cp apps/web/.env.example apps/web/.env.local
fi

# Iniciar com PM2
echo "✅ Iniciando aplicações com PM2..."
pm2 start ecosystem.config.js --no-autorestart

echo "📊 Status das aplicações:"
pm2 status

echo ""
echo "🎉 AIGenda SaaS iniciado com sucesso!"
echo "📝 Logs: pm2 logs"
echo "⚙️  Parar: pm2 stop all"
echo "🔄 Reiniciar: pm2 restart all"
