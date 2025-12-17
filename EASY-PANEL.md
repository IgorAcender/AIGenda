# ⚙️ O QUE INSTALAR NO EASY PANEL

## 📋 RESUMO EXECUTIVO

Para rodar o AIGenda SaaS no Easy Panel, você precisa instalar:

```
✅ Node.js 20 LTS (Runtime)
✅ PostgreSQL 16 (Banco de Dados)
✅ Redis 7 (Cache)
✅ Nginx (Reverse Proxy)
✅ PM2 (Gerenciador de Processos)
✅ SSL/TLS Let's Encrypt (Certificado)
```

---

## 📦 INSTALAÇÕES DETALHADAS

### 1️⃣ Node.js 20 LTS

**Por que:** Para executar Next.js e Express

```bash
# Adicionar repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Instalar Node.js
apt-get install -y nodejs

# Verificar
node -v    # v20.x.x
npm -v     # 10.x.x

# Atualizar npm
npm install -g npm@latest
```

**Recursos:**
- Runtime JavaScript/TypeScript
- npm para gerenciar dependências

---

### 2️⃣ PostgreSQL 16

**Por que:** Banco de dados para toda a aplicação

```bash
# Instalar PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Iniciar serviço
systemctl start postgresql
systemctl enable postgresql

# Verificar
sudo -u postgres psql --version
```

**Configuração no Easy Panel:**
- Usuário: `aigenda_user`
- Senha: (gerar forte)
- Database: `aigenda_prod`
- Host: `localhost` ou `127.0.0.1`
- Port: `5432`

**Criar banco:**
```bash
sudo -u postgres psql

CREATE USER aigenda_user WITH PASSWORD 'sua-senha-forte';
CREATE DATABASE aigenda_prod OWNER aigenda_user;
GRANT ALL PRIVILEGES ON DATABASE aigenda_prod TO aigenda_user;
\q
```

---

### 3️⃣ Redis 7

**Por que:** Cache e sessões

```bash
# Instalar Redis
apt-get install -y redis-server

# Iniciar serviço
systemctl start redis-server
systemctl enable redis-server

# Verificar
redis-cli ping
# Resposta: PONG
```

**Configuração:**
- Host: `127.0.0.1`
- Port: `6379`
- Sem autenticação (interno) ou adicionar senha em `/etc/redis/redis.conf`

---

### 4️⃣ Nginx

**Por que:** Reverse proxy para rotear requisições

```bash
# Instalar Nginx
apt-get install -y nginx

# Iniciar
systemctl start nginx
systemctl enable nginx

# Verificar
nginx -v
```

**Configuração:** (veja arquivo `nginx.conf` no DEPLOY.md)

---

### 5️⃣ PM2

**Por que:** Gerenciar processos Node.js em produção

```bash
# Instalar globalmente
npm install -g pm2

# Verificar
pm2 -v

# Configurar inicialização automática
pm2 startup systemd -u root --hp /root
pm2 save
```

**Recursos:**
- Mantém aplicação rodando 24/7
- Reinicia se travar
- Monitoramento
- Load balancing (múltiplas instâncias)

---

### 6️⃣ Let's Encrypt (SSL/TLS)

**Por que:** HTTPS (segurança)

```bash
# Instalar Certbot
apt-get install -y certbot python3-certbot-nginx

# Gerar certificado
certbot certonly --nginx \
  -d seu-dominio.com \
  -d www.seu-dominio.com \
  -d api.seu-dominio.com

# Renovação automática (já está ativa)
```

---

## 🔌 PORTAS A LIBERAR

```bash
# Firewall
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw allow 3000/tcp    # Frontend (se direto)
ufw allow 3001/tcp    # API (se direto)
ufw allow 5432/tcp    # PostgreSQL (interno)
ufw allow 6379/tcp    # Redis (interno)
ufw enable
```

---

## 🌐 ARQUITETURA NO EASY PANEL

```
Internet
    ↓
Nginx (Reverse Proxy)
    ├─→ Frontend (Next.js - :3000) via PM2
    └─→ Backend (Express - :3001) via PM2
         ├─→ PostgreSQL (localhost:5432)
         └─→ Redis (localhost:6379)
```

---

## 📊 ESTRUTURA DE PASTAS RECOMENDADA

```
/var/www/aigenda-saas/          ← Aplicação
├── apps/web/                   ← Frontend
├── apps/api/                   ← Backend
├── packages/shared/            ← Tipos compartilhados
├── ecosystem.config.js         ← PM2 Config
├── DEPLOY.md
├── package.json
└── logs/                        ← Logs do PM2
    ├── api.log
    ├── api-error.log
    ├── web.log
    └── web-error.log

/var/www/aigenda-backups/       ← Backups do banco
/etc/nginx/sites-available/     ← Config Nginx
/etc/letsencrypt/live/          ← Certificados SSL
```

---

## 🚀 RESUMO DE INSTALAÇÃO RÁPIDA

```bash
# 1. SSH no servidor Easy Panel
ssh root@seu-ip

# 2. Atualizar sistema
apt-get update && apt-get upgrade -y

# 3. Executar script completo
curl -O https://raw.githubusercontent.com/seu-usuario/AIGenda-SaaS/main/install-easy-panel.sh
chmod +x install-easy-panel.sh
./install-easy-panel.sh

# 4. Clonar repositório
cd /var/www
git clone https://github.com/seu-usuario/AIGenda-SaaS.git aigenda-saas
cd aigenda-saas

# 5. Configurar ambiente
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
nano apps/api/.env      # Editar com dados do banco

# 6. Instalar dependências
npm install

# 7. Migrações do banco
npm run migrate --workspace=apps/api

# 8. Build
npm run build --workspace=apps/web
npm run build --workspace=apps/api

# 9. Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save

# 10. Configurar Nginx
# (Veja DEPLOY.md para configuração completa)

# 11. SSL com Let's Encrypt
certbot certonly --nginx -d seu-dominio.com

# 12. Recarregar Nginx
systemctl reload nginx

echo "✅ AIGenda SaaS instalado com sucesso!"
```

---

## 📈 REQUISITOS DE SERVIDOR MÍNIMOS

Para desenvolvimento/pequeno volume:
- **CPU:** 1-2 vCores
- **RAM:** 2-4 GB
- **Disk:** 20 GB SSD
- **Banda:** Ilimitada

Para produção (recomendado):
- **CPU:** 2-4 vCores
- **RAM:** 4-8 GB
- **Disk:** 50+ GB SSD
- **Banda:** Ilimitada

---

## ✨ VERIFICAÇÃO PÓS-INSTALAÇÃO

```bash
# Node.js
node -v

# npm
npm -v

# PostgreSQL
sudo systemctl status postgresql

# Redis
redis-cli ping

# Nginx
nginx -t

# PM2
pm2 status

# Testar API
curl http://localhost:3001/health

# Testar Frontend
curl http://localhost:3000/
```

---

## 🆘 COMUM NO EASY PANEL

### Usar Docker (Alternativa)

Se Easy Panel suporta Docker:

```bash
# Docker Compose local
docker-compose up -d

# Ou criar containers individuais
docker run -d --name aigenda-postgres \
  -e POSTGRES_PASSWORD=senha \
  -p 5432:5432 \
  postgres:16

docker run -d --name aigenda-redis \
  -p 6379:6379 \
  redis:7
```

### Usar Banco em Nuvem (Alternativa)

Se preferir não instalar PostgreSQL localmente:

```env
# .env
DATABASE_URL="postgresql://user:pass@db.provider.com:5432/aigenda_prod"
```

Opções:
- AWS RDS PostgreSQL
- Digital Ocean Managed Database
- Render.com PostgreSQL
- Heroku PostgreSQL

---

## 🎓 PRÓXIMAS ETAPAS

1. ✅ Instalar dependências (este guia)
2. ✅ Clonar repositório do GitHub
3. ✅ Configurar .env
4. ✅ Executar migrações
5. ✅ Build e iniciar com PM2
6. ✅ Configurar Nginx e SSL
7. ⬜ Configurar domínio (DNS)
8. ⬜ Backups automáticos
9. ⬜ Monitoramento e alertas
10. ⬜ CI/CD (GitHub Actions)

---

## 📚 REFERÊNCIAS

- [Easy Panel](https://easypanel.io)
- [Node.js Docs](https://nodejs.org/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Redis Docs](https://redis.io/documentation)
- [Nginx Docs](https://nginx.org/en/docs/)
- [PM2 Docs](https://pm2.keymetrics.io/docs/usage/quick-start/)
