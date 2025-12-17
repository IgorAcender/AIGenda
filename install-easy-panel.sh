#!/bin/bash

# AIGenda SaaS - Easy Panel Deployment Script

echo "🚀 Iniciando instalação do AIGenda SaaS no Easy Panel..."

# 1. Atualizar sistema
echo "📦 Atualizando pacotes do sistema..."
apt-get update
apt-get upgrade -y

# 2. Instalar Node.js (LTS)
echo "📦 Instalando Node.js LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 3. Instalar npm globalmente
echo "📦 Atualizando npm..."
npm install -g npm@latest

# 4. Instalar PostgreSQL
echo "📦 Instalando PostgreSQL..."
apt-get install -y postgresql postgresql-contrib

# 5. Instalar Redis
echo "📦 Instalando Redis..."
apt-get install -y redis-server

# 6. Instalar Docker (se não estiver instalado)
echo "📦 Instalando Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker root

# 7. Instalar Docker Compose
echo "📦 Instalando Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 8. Instalar PM2 (gerenciador de processos)
echo "📦 Instalando PM2..."
npm install -g pm2

# 9. Iniciar serviços
echo "🔧 Iniciando serviços..."
systemctl start postgresql
systemctl enable postgresql
systemctl start redis-server
systemctl enable redis-server

# 10. Configurar firewall
echo "🔒 Configurando firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw allow 3001/tcp
ufw allow 5432/tcp
ufw allow 6379/tcp
ufw enable

echo "✅ Instalação de dependências concluída!"
echo ""
echo "Próximos passos:"
echo "1. Clone o repositório do GitHub"
echo "2. Configure as variáveis de ambiente"
echo "3. Execute: npm install"
echo "4. Execute: npm run migrate --workspace=apps/api"
echo "5. Execute: npm run build"
echo "6. Inicie com PM2 (veja DEPLOY.md)"
