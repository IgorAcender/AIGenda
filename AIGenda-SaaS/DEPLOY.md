# 🚀 Guia de Deploy no Easy Panel

## ✅ Pré-requisitos

- [ ] Conta no Easy Panel
- [ ] Repositório GitHub criado e sincronizado
- [ ] SSH configurado para clonar repositório

---

## 📋 PASSO 1: Preparar o Repositório GitHub

### 1.1 Inicializar Git localmente

```bash
cd /Users/user/Desktop/Programação/AIGenda-SaaS

# Inicializar repositório
git init

# Adicionar arquivo .gitignore
git add .gitignore

# Adicionar todos os arquivos
git add .

# Commit inicial
git commit -m "Initial commit: AIGenda SaaS structure"

# Adicionar remote (substitua seu-usuario/seu-repo)
git remote add origin https://github.com/seu-usuario/AIGenda-SaaS.git

# Push para GitHub
git branch -M main
git push -u origin main
```

### 1.2 Garantir que .gitignore está correto

Já temos um `.gitignore` na raiz. Verifique se contém:

```
node_modules/
dist/
build/
.env
.env.local
.env.*.local
.DS_Store
*.log
.next/
out/
.turbo/
.vercel/
coverage/
```

---

## 🖥️ PASSO 2: Instalar Dependências no Easy Panel

### 2.1 Via SSH

1. **Acesse o Easy Panel**
2. **Crie um novo servidor** ou use um existente
3. **Copie o comando SSH** para acessar o servidor
4. **Execute via terminal:**

```bash
ssh root@seu-ip-do-servidor
```

### 2.2 Execute o script de instalação

```bash
# Download do script (ou copie o conteúdo de install-easy-panel.sh)
curl -O https://raw.githubusercontent.com/seu-usuario/AIGenda-SaaS/main/install-easy-panel.sh

# Dê permissão de execução
chmod +x install-easy-panel.sh

# Execute
./install-easy-panel.sh
```

**Ou execute manualmente:**

```bash
# Atualizar sistema
apt-get update && apt-get upgrade -y

# Instalar Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Instalar PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Instalar Redis
apt-get install -y redis-server

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar PM2
npm install -g pm2
```

---

## 📁 PASSO 3: Clonar o Repositório

```bash
# Criar diretório para aplicação
mkdir -p /var/www/aigenda-saas
cd /var/www/aigenda-saas

# Clonar repositório
git clone https://github.com/seu-usuario/AIGenda-SaaS.git .

# Ou se usar SSH (recomendado)
git clone git@github.com:seu-usuario/AIGenda-SaaS.git .
```

---

## 🔧 PASSO 4: Configurar Ambiente

### 4.1 Backend (.env)

```bash
cd /var/www/aigenda-saas/apps/api

# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env
nano .env
```

**Substituir valores:**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/aigenda_prod"
JWT_SECRET="gerar-uma-chave-aleatoria-super-segura"
NODE_ENV="production"
PORT=3001
CORS_ORIGIN="https://seu-dominio.com"

# Stripe (adicionar depois)
STRIPE_SECRET_KEY="sk_live_xxxxx"
```

### 4.2 Frontend (.env)

```bash
cd /var/www/aigenda-saas/apps/web

cp .env.example .env

nano .env
```

**Substituir:**

```env
NEXT_PUBLIC_API_URL="https://api.seu-dominio.com"
```

---

## 🗄️ PASSO 5: Configurar Banco de Dados

### 5.1 Criar usuário PostgreSQL

```bash
sudo -u postgres psql

-- No prompt do PostgreSQL
CREATE USER aigenda_user WITH PASSWORD 'sua-senha-segura';
CREATE DATABASE aigenda_prod OWNER aigenda_user;
GRANT ALL PRIVILEGES ON DATABASE aigenda_prod TO aigenda_user;
\q
```

### 5.2 Atualizar DATABASE_URL no .env

```env
DATABASE_URL="postgresql://aigenda_user:sua-senha-segura@localhost:5432/aigenda_prod"
```

---

## 📦 PASSO 6: Instalar Dependências

```bash
cd /var/www/aigenda-saas

# Instalar dependências da raiz
npm install

# Instalar dependências do backend
npm install --workspace=apps/api

# Instalar dependências do frontend
npm install --workspace=apps/web

# Gerar Prisma Client
npm run generate --workspace=apps/api
```

---

## 🔄 PASSO 7: Executar Migrações

```bash
npm run migrate --workspace=apps/api

# Ou se precisar resetar:
# npm run migrate:reset --workspace=apps/api
```

---

## 🏗️ PASSO 8: Build da Aplicação

```bash
cd /var/www/aigenda-saas

# Build do frontend
npm run build --workspace=apps/web

# Build do backend (se necessário)
npm run build --workspace=apps/api
```

---

## 🚀 PASSO 9: Iniciar com PM2

### 9.1 Criar arquivo de configuração PM2

```bash
nano /var/www/aigenda-saas/ecosystem.config.js
```

**Cole o seguinte conteúdo:**

```javascript
module.exports = {
  apps: [
    {
      name: 'aigenda-api',
      script: './apps/api/dist/index.js',
      cwd: '/var/www/aigenda-saas',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'aigenda-web',
      script: 'npm',
      args: 'start --workspace=apps/web',
      cwd: '/var/www/aigenda-saas',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/web-error.log',
      out_file: './logs/web.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
```

### 9.2 Criar diretório de logs

```bash
mkdir -p /var/www/aigenda-saas/logs
```

### 9.3 Iniciar com PM2

```bash
cd /var/www/aigenda-saas

# Iniciar aplicação
pm2 start ecosystem.config.js

# Configurar PM2 para iniciar no boot
pm2 startup
pm2 save

# Monitorar
pm2 monit
```

---

## 🌐 PASSO 10: Configurar Nginx como Reverse Proxy

### 10.1 Instalar Nginx

```bash
apt-get install -y nginx
```

### 10.2 Criar configuração

```bash
nano /etc/nginx/sites-available/aigenda
```

**Cole:**

```nginx
upstream aigenda_api {
    server 127.0.0.1:3001;
}

upstream aigenda_web {
    server 127.0.0.1:3000;
}

# Redirecionar HTTP para HTTPS
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS para Frontend
server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    # Melhorias de segurança SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 100M;

    location / {
        proxy_pass http://aigenda_web;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTPS para API
server {
    listen 443 ssl http2;
    server_name api.seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 100M;

    location / {
        proxy_pass http://aigenda_api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 10.3 Habilitar site

```bash
ln -s /etc/nginx/sites-available/aigenda /etc/nginx/sites-enabled/

# Testar configuração
nginx -t

# Recarregar Nginx
systemctl reload nginx
```

---

## 🔒 PASSO 11: SSL com Let's Encrypt

```bash
# Instalar Certbot
apt-get install -y certbot python3-certbot-nginx

# Gerar certificado (substitua seu domínio)
certbot certonly --nginx -d seu-dominio.com -d www.seu-dominio.com -d api.seu-dominio.com

# Renovação automática já está ativada
```

---

## 🔄 PASSO 12: Sincronizar com GitHub (Atualizações)

Crie um script de atualização:

```bash
nano /var/www/aigenda-saas/deploy.sh
```

**Cole:**

```bash
#!/bin/bash

echo "🔄 Atualizando AIGenda SaaS..."

cd /var/www/aigenda-saas

# Pull do GitHub
git pull origin main

# Instalar novas dependências
npm install
npm install --workspace=apps/api
npm install --workspace=apps/web

# Executar migrações (se houver)
npm run migrate --workspace=apps/api

# Build
npm run build --workspace=apps/web
npm run build --workspace=apps/api

# Reiniciar com PM2
pm2 restart ecosystem.config.js

echo "✅ Atualização concluída!"
```

```bash
chmod +x /var/www/aigenda-saas/deploy.sh
```

---

## 📊 PASSO 13: Monitoramento e Logs

```bash
# Ver status das aplicações
pm2 status

# Ver logs em tempo real
pm2 logs

# Ver logs de uma aplicação específica
pm2 logs aigenda-api
pm2 logs aigenda-web

# Parar/Reiniciar
pm2 stop aigenda-api
pm2 restart aigenda-api
```

---

## 🧪 PASSO 14: Testar a Aplicação

```bash
# Testar API
curl https://api.seu-dominio.com/health

# Resposta esperada:
# {"status":"ok","timestamp":"2025-12-17T..."}
```

---

## 📋 Checklist Final

- [ ] Git configurado e repositório no GitHub
- [ ] Dependências instaladas no servidor
- [ ] PostgreSQL e Redis rodando
- [ ] Variáveis de ambiente (.env) configuradas
- [ ] Migrações do banco executadas
- [ ] Build realizado (npm run build)
- [ ] PM2 iniciado e configurado no boot
- [ ] Nginx configurado como reverse proxy
- [ ] SSL/TLS com Let's Encrypt
- [ ] DNS apontando para o servidor
- [ ] Firewall configurado
- [ ] Teste de acesso funcional

---

## 🆘 Troubleshooting

### Erro: "Cannot find module"

```bash
cd /var/www/aigenda-saas
rm -rf node_modules apps/*/node_modules
npm install
npm install --workspace=apps/api
npm install --workspace=apps/web
```

### Erro: "Database connection refused"

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Reiniciar se necessário
sudo systemctl restart postgresql
```

### Erro: "Port already in use"

```bash
# Procurar processo usando a porta
lsof -i :3000
lsof -i :3001

# Matar processo
kill -9 <PID>
```

### Erro: PM2 não inicia automaticamente

```bash
pm2 startup systemd -u root --hp /root
pm2 save
```

---

## 🎉 Parabéns!

Seu SaaS está em produção no Easy Panel! 🚀

Próximos passos:
- Monitorar logs regularmente
- Configurar backups automáticos
- Adicionar CI/CD no GitHub Actions
- Implementar alertas

---

## 📚 Links Úteis

- [Easy Panel Docs](https://easypanel.io/docs)
- [PM2 Docs](https://pm2.keymetrics.io/docs)
- [Nginx Docs](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
