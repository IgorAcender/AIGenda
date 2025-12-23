# 🚀 Quick Start - Deploy EasyPanel

Guia rápido de 5 minutos para deploy no EasyPanel.

---

## 📋 Checklist Rápido

```bash
# 1. Verificar se está tudo pronto
chmod +x verificar-deploy.sh
./verificar-deploy.sh

# 2. Commit e push
git add .
git commit -m "deploy: production ready"
git push origin main
```

---

## ⚡ Deploy em 5 Passos

### 1️⃣ PostgreSQL (2 min)
```
Add Service → PostgreSQL 16
Nome: aigenda-postgres
User: aigenda
Password: [gere senha forte]
Database: aigenda
```

**Copie a URL:** `postgresql://aigenda:PASSWORD@aigenda-postgres:5432/aigenda`

---

### 2️⃣ Redis (1 min)
```
Add Service → Redis 7
Nome: aigenda-redis
Max Memory: 256MB
```

**URL:** `redis://aigenda-redis:6379`

---

### 3️⃣ API Backend (3 min)
```
Add App → From GitHub
Nome: aigenda-api
Repo: seu-usuario/AIGenda
Branch: main
Build Path: apps/api
Dockerfile: apps/api/Dockerfile
Port: 3001
```

**Environment Variables:**
```bash
DATABASE_URL=postgresql://aigenda:SUA_SENHA@aigenda-postgres:5432/aigenda?schema=public
REDIS_URL=redis://aigenda-redis:6379
API_PORT=3001
API_HOST=0.0.0.0
NODE_ENV=production
JWT_SECRET=sua-chave-secreta-forte-aqui
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://seu-dominio.com
```

**Domínio:** `api.seu-dominio.com`

---

### 4️⃣ Web Frontend (2 min)
```
Add App → From GitHub
Nome: aigenda-web
Repo: seu-usuario/AIGenda
Branch: main
Build Path: apps/web
Dockerfile: apps/web/Dockerfile
Port: 3000
```

**Environment Variables:**
```bash
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=production
```

**Domínio:** `seu-dominio.com`

---

### 5️⃣ Verificar (1 min)
```bash
# Health check
curl https://api.seu-dominio.com/health

# Acessar aplicação
open https://seu-dominio.com
```

---

## 🎯 URLs Finais

- 🌐 **Frontend:** `https://seu-dominio.com`
- 🔌 **API:** `https://api.seu-dominio.com`
- ✅ **Health:** `https://api.seu-dominio.com/health`

---

## 🔐 Gerar JWT Secret

```bash
# macOS/Linux
openssl rand -base64 64

# Ou use
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

---

## 🐛 Problemas Comuns

| Erro | Solução |
|------|---------|
| `Cannot connect to database` | Verifique DATABASE_URL no .env |
| `API not reachable` | Verifique NEXT_PUBLIC_API_URL |
| `Migrations not applied` | Execute no terminal da API: `npx prisma migrate deploy` |
| `Build failed` | Verifique logs no EasyPanel |

---

## 📚 Documentação Completa

Para guia detalhado, veja: **[DEPLOY_EASYPANEL.md](./DEPLOY_EASYPANEL.md)**

---

## ✅ Deploy Completo!

Após seguir estes passos, seu AIGenda estará rodando em produção! 🎉

**Webhook para CI/CD:**
Configure no GitHub → Settings → Webhooks para deploy automático a cada push.

---

**Tempo total:** ~10 minutos
**Dificuldade:** ⭐⭐ (Fácil)
