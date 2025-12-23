# 🚀 Deploy AIGenda no EasyPanel - Começe Aqui

**Status:** ✅ Pronto para Deploy em Produção

---

## 📚 Documentação Criada

### 🎯 Para Começar
1. **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Guia rápido de 5 minutos
2. **[DEPLOY_EASYPANEL.md](./DEPLOY_EASYPANEL.md)** - Guia completo e detalhado

### ⚙️ Configuração
3. **[.env.easypanel.api](./.env.easypanel.api)** - Variáveis de ambiente da API
4. **[.env.easypanel.web](./.env.easypanel.web)** - Variáveis de ambiente do Frontend

### 🛠️ Ferramentas
5. **[verificar-deploy.sh](./verificar-deploy.sh)** - Script de verificação pré-deploy
6. **[COMANDOS_EASYPANEL.md](./COMANDOS_EASYPANEL.md)** - Comandos úteis para produção
7. **[ARQUIVOS_DEPLOY.md](./ARQUIVOS_DEPLOY.md)** - Resumo de tudo que foi criado

---

## ⚡ Quick Start (5 min)

```bash
# 1. Verificar se está tudo pronto
./verificar-deploy.sh

# 2. Fazer commit
git add .
git commit -m "deploy: ready for production"
git push origin main

# 3. Seguir o guia rápido
cat QUICK_DEPLOY.md
```

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────┐
│         EasyPanel Project           │
├─────────────────────────────────────┤
│                                     │
│  PostgreSQL 16  ←→  Redis 7         │
│       ↓                             │
│  API (Fastify + Prisma) :3001      │
│       ↓                             │
│  Web (Next.js) :3000               │
│                                     │
└─────────────────────────────────────┘
```

---

## 📋 Checklist Completo

### Pré-Deploy (Local)
- [x] Dockerfiles criados e testados
- [x] Next.js com `output: 'standalone'`
- [x] Prisma migrations prontas
- [x] Build local funcionando
- [x] Variáveis de ambiente documentadas
- [x] Git configurado e atualizado

### No EasyPanel
- [ ] PostgreSQL 16 instalado
- [ ] Redis 7 instalado
- [ ] API deployada (porta 3001)
- [ ] Frontend deployado (porta 3000)
- [ ] Variáveis de ambiente configuradas
- [ ] Migrations aplicadas
- [ ] Domínios configurados
- [ ] SSL/HTTPS ativo

---

## 🎯 Passos Resumidos

### 1. Banco de Dados (2 min)
```
EasyPanel → Add Service → PostgreSQL 16
Nome: aigenda-postgres
User: aigenda
Password: [gere uma senha forte]
```

### 2. Cache (1 min)
```
EasyPanel → Add Service → Redis 7
Nome: aigenda-redis
```

### 3. API Backend (3 min)
```
EasyPanel → Add App → From GitHub
Nome: aigenda-api
Build Path: apps/api
Port: 3001
```

**Environment Variables:** Use template de `.env.easypanel.api`

### 4. Frontend Web (2 min)
```
EasyPanel → Add App → From GitHub
Nome: aigenda-web
Build Path: apps/web
Port: 3000
```

**Environment Variables:** Use template de `.env.easypanel.web`

### 5. Verificar (2 min)
```bash
curl https://api.seu-dominio.com/health
open https://seu-dominio.com
```

---

## 🔐 Variáveis Importantes

### Gerar JWT Secret
```bash
openssl rand -base64 64
```

### DATABASE_URL (Exemplo)
```
postgresql://aigenda:SUA_SENHA@aigenda-postgres:5432/aigenda?schema=public
```

### REDIS_URL
```
redis://aigenda-redis:6379
```

---

## 📊 Após Deploy

### Aplicar Migrations
```bash
# No terminal da API no EasyPanel
npx prisma migrate deploy
```

### Health Check
```bash
curl https://api.seu-dominio.com/health
```

### Ver Logs
```
EasyPanel → aigenda-api → Logs
EasyPanel → aigenda-web → Logs
```

---

## 🐛 Problemas Comuns

| Problema | Solução |
|----------|---------|
| Build falha | Verifique logs no EasyPanel |
| API não conecta no banco | Verifique `DATABASE_URL` |
| Frontend erro 502 | Verifique `NEXT_PUBLIC_API_URL` |
| Migrations não aplicam | Execute `npx prisma migrate deploy` |

**Mais soluções:** [COMANDOS_EASYPANEL.md](./COMANDOS_EASYPANEL.md)

---

## 📞 Suporte

- **Guia Completo:** [DEPLOY_EASYPANEL.md](./DEPLOY_EASYPANEL.md)
- **Comandos Úteis:** [COMANDOS_EASYPANEL.md](./COMANDOS_EASYPANEL.md)
- **Verificação:** `./verificar-deploy.sh`

---

## ✅ Status Atual

```bash
$ ./verificar-deploy.sh

✓ Sucessos: 25
⚠ Avisos: 1 (commit pendente)
✗ Erros: 0

🎉 PRONTO PARA DEPLOY!
```

---

## 🎉 Pronto!

Seu AIGenda está 100% pronto para subir no EasyPanel!

**Tempo estimado:** 10-15 minutos
**Dificuldade:** ⭐⭐ (Fácil)

---

**Bora deployar! 🚀**
