# 🚀 Deploy AIGenda no EasyPanel

Guia completo para fazer deploy do AIGenda (Sistema de Agendamento SaaS) no EasyPanel.

---

## 📋 Pré-requisitos

1. ✅ Conta no EasyPanel
2. ✅ Repositório Git (GitHub/GitLab)
3. ✅ Domínio configurado (opcional, mas recomendado)

---

## 🏗️ Arquitetura do Deploy

```
┌─────────────────────────────────────────┐
│         EasyPanel Project               │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │PostgreSQL│  │  Redis   │            │
│  │   DB     │  │  Cache   │            │
│  └────┬─────┘  └────┬─────┘            │
│       │             │                   │
│  ┌────▼─────────────▼─────┐            │
│  │   API Backend          │            │
│  │   (Fastify + Prisma)   │            │
│  │   Port: 3001           │            │
│  └────┬───────────────────┘            │
│       │                                 │
│  ┌────▼───────────────────┐            │
│  │   Web Frontend         │            │
│  │   (Next.js)            │            │
│  │   Port: 3000           │            │
│  └────────────────────────┘            │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔧 Passo 1: Criar Banco de Dados PostgreSQL

1. No EasyPanel, clique em **"Add Service"**
2. Selecione **"PostgreSQL"**
3. Configure:
   ```
   Nome: aigenda-postgres
   Versão: 16
   Username: aigenda
   Password: [gere uma senha forte]
   Database: aigenda
   ```
4. Anote a **URL de conexão interna**: `postgresql://aigenda:PASSWORD@aigenda-postgres:5432/aigenda`

---

## 🔧 Passo 2: Criar Redis

1. Clique em **"Add Service"**
2. Selecione **"Redis"**
3. Configure:
   ```
   Nome: aigenda-redis
   Versão: 7
   Max Memory: 256MB
   ```
4. Anote a **URL de conexão**: `redis://aigenda-redis:6379`

---

## 🔧 Passo 3: Deploy da API Backend

1. Clique em **"Add App"**
2. Selecione **"From GitHub"**
3. Configure:

### General
```
Nome: aigenda-api
Repository: seu-usuario/AIGenda
Branch: main
Build Path: apps/api
```

### Build Settings
```
Build Type: Dockerfile
Dockerfile Path: apps/api/Dockerfile
```

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://aigenda:SUA_SENHA@aigenda-postgres:5432/aigenda?schema=public

# Redis
REDIS_URL=redis://aigenda-redis:6379

# API Config
API_PORT=3001
API_HOST=0.0.0.0
NODE_ENV=production

# JWT (GERE UM SECRET FORTE!)
JWT_SECRET=sua-chave-secreta-super-segura-aqui
JWT_EXPIRES_IN=7d

# CORS (adicione seu domínio)
CORS_ORIGIN=https://seu-dominio.com,https://api.seu-dominio.com

# Email (configure seu SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-app
EMAIL_FROM=noreply@seu-dominio.com
```

### Network
```
Port: 3001
Domain: api.seu-dominio.com (ou use o domínio do EasyPanel)
```

4. Clique em **"Deploy"**

---

## 🔧 Passo 4: Deploy do Frontend Web

1. Clique em **"Add App"**
2. Selecione **"From GitHub"**
3. Configure:

### General
```
Nome: aigenda-web
Repository: seu-usuario/AIGenda
Branch: main
Build Path: apps/web
```

### Build Settings
```
Build Type: Dockerfile
Dockerfile Path: apps/web/Dockerfile
```

### Environment Variables
```bash
# API URL (use a URL interna ou pública da API)
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com

# Telemetry
NEXT_TELEMETRY_DISABLED=1

# Node
NODE_ENV=production
```

### Network
```
Port: 3000
Domain: seu-dominio.com (ou app.seu-dominio.com)
```

4. Clique em **"Deploy"**

---

## 🗄️ Passo 5: Executar Migrations

Após o deploy da API, você precisa rodar as migrations do Prisma:

### Opção 1: Via Terminal do EasyPanel (RECOMENDADO)

1. Acesse o serviço **aigenda-api**
2. Clique em **"Terminal"** ou **"Console"**
3. Execute:

```bash
npx prisma migrate deploy
```

### Opção 2: Via Script Automático

O Dockerfile já está configurado para rodar as migrations automaticamente no startup!

Verifique os logs do container para confirmar:
```bash
# Você deve ver:
✓ Migrations applied successfully
✓ Starting server on port 3001
```

---

## ✅ Passo 6: Verificar Funcionamento

### 1. Health Check da API
```bash
curl https://api.seu-dominio.com/health

# Resposta esperada:
{
  "status": "ok",
  "timestamp": "2024-12-23T...",
  "database": "connected",
  "redis": "connected"
}
```

### 2. Acessar Frontend
```
https://seu-dominio.com
```

### 3. Verificar Logs

No EasyPanel:
- **aigenda-api** → Logs → Verificar se não há erros
- **aigenda-web** → Logs → Verificar compilação Next.js

---

## 🔐 Passo 7: Configurações de Segurança

### SSL/HTTPS
O EasyPanel configura automaticamente SSL via Let's Encrypt.

### Firewall
Configure no EasyPanel:
- Permita apenas portas 80 (HTTP) e 443 (HTTPS)
- Bloqueie acesso direto ao PostgreSQL e Redis

### Rate Limiting
Já configurado no código da API:
```typescript
// apps/api/src/index.ts
await app.register(rateLimit, {
  max: 100, // 100 requests
  timeWindow: '15 minutes'
})
```

---

## 📊 Passo 8: Monitoramento

### Logs Centralizados
No EasyPanel, acesse:
- **aigenda-api** → Logs
- **aigenda-web** → Logs

### Métricas
- CPU e Memória visíveis no dashboard do EasyPanel
- Redis: máximo 256MB configurado
- PostgreSQL: monitore conexões ativas

---

## 🚀 Passo 9: Configuração de Domínio Personalizado

### No EasyPanel
1. Acesse **aigenda-web** → Settings → Domains
2. Adicione seu domínio: `seu-dominio.com`
3. Adicione subdomínio da API: `api.seu-dominio.com`

### No seu DNS Provider
Adicione os registros:

```dns
# Frontend
CNAME  @     seu-projeto.easypanel.host
CNAME  www   seu-projeto.easypanel.host

# API
CNAME  api   seu-projeto.easypanel.host
```

Aguarde propagação DNS (5-60 minutos).

---

## 🔄 Passo 10: CI/CD Automático

O EasyPanel detecta automaticamente mudanças no repositório Git!

### Configurar Webhook (Recomendado)

1. No EasyPanel, copie o **Webhook URL** do projeto
2. No GitHub:
   - Settings → Webhooks → Add webhook
   - Cole a URL
   - Selecione evento: **Push**
3. Agora cada `git push` fará deploy automático! 🎉

---

## 🎯 Checklist Final

Antes de marcar como concluído:

```bash
✅ PostgreSQL criado e funcionando
✅ Redis criado e funcionando
✅ API deployada e respondendo /health
✅ Frontend deployado e acessível
✅ Migrations aplicadas com sucesso
✅ Variáveis de ambiente configuradas
✅ SSL/HTTPS ativo
✅ Domínio personalizado funcionando (opcional)
✅ Webhook configurado para CI/CD (opcional)
✅ Logs sem erros críticos
```

---

## 🐛 Troubleshooting

### API não conecta no banco
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Deve ser algo como:
postgresql://aigenda:PASSWORD@aigenda-postgres:5432/aigenda?schema=public
```

### Frontend não encontra API
```bash
# Verificar NEXT_PUBLIC_API_URL
echo $NEXT_PUBLIC_API_URL

# Deve ser:
https://api.seu-dominio.com
```

### Migrations não aplicadas
```bash
# No terminal da API
npx prisma migrate deploy
npx prisma db push  # força sincronização
```

### Redis não conecta
```bash
# Verificar REDIS_URL
echo $REDIS_URL

# Testar conexão
redis-cli -u $REDIS_URL ping
# Resposta esperada: PONG
```

### Build do Next.js falha

Certifique-se de que o `next.config.js` tem:
```javascript
output: 'standalone'
```

---

## 📚 Recursos Adicionais

- [Documentação EasyPanel](https://easypanel.io/docs)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Next.js Standalone](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [Fastify Production](https://www.fastify.io/docs/latest/Guides/Getting-Started/)

---

## 🎉 Pronto!

Seu sistema AIGenda está no ar! 🚀

**URLs finais:**
- Frontend: `https://seu-dominio.com`
- API: `https://api.seu-dominio.com`
- Health: `https://api.seu-dominio.com/health`

---

**Problemas?** Verifique os logs no EasyPanel ou abra uma issue no repositório.
