# 🚀 Deploy no EasyPanel

## Arquitetura Recomendada

```
┌─────────────────────────────────────────────────────────────┐
│                        EasyPanel                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  PostgreSQL │  │    Redis    │  │      AIGenda        │ │
│  │   (App)     │  │   (App)     │  │  ┌───────┬───────┐  │ │
│  │             │  │             │  │  │  API  │  Web  │  │ │
│  │  Port 5432  │  │  Port 6379  │  │  │ :3001 │ :3000 │  │ │
│  └─────────────┘  └─────────────┘  │  └───────┴───────┘  │ │
│        │                │          │         │           │ │
│        └────────────────┴──────────┴─────────┘           │ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Passo 1: Criar PostgreSQL

1. No EasyPanel, clique em **"Create App"**
2. Busque por **"PostgreSQL"** nos templates
3. Configure:
   - **Name:** `aigenda-db`
   - **Database:** `aigenda`
   - **Username:** `aigenda`
   - **Password:** (gere uma senha forte)
4. Anote a **connection string** que será gerada

## Passo 2: Criar Redis

1. Clique em **"Create App"**
2. Busque por **"Redis"** nos templates
3. Configure:
   - **Name:** `aigenda-redis`
   - **Max Memory:** 256mb (ou mais se precisar)
4. Anote a **connection URL** (geralmente `redis://aigenda-redis:6379`)

## Passo 3: Deploy da Aplicação

### Opção A: Via GitHub (Recomendado)

1. Clique em **"Create App"** → **"From GitHub"**
2. Conecte seu repositório: `IgorAcender/AIGenda`
3. Configure:
   - **Name:** `aigenda`
   - **Branch:** `main`
   - **Build Command:** (deixe vazio, usa Dockerfile)
   - **Dockerfile Path:** `docker-compose.prod.yml`

### Opção B: Via Docker Compose

1. Faça upload do `docker-compose.prod.yml`
2. Configure as variáveis de ambiente

## Passo 4: Variáveis de Ambiente

No EasyPanel, configure as seguintes variáveis para o app `aigenda`:

```env
# Database (use a connection string do PostgreSQL criado)
DATABASE_URL=postgresql://aigenda:SENHA@aigenda-db:5432/aigenda?schema=public

# Redis (use a URL do Redis criado)
REDIS_URL=redis://aigenda-redis:6379

# API
API_PORT=3001
API_HOST=0.0.0.0

# JWT (GERE UMA CHAVE SEGURA!)
JWT_SECRET=sua-chave-super-secreta-com-pelo-menos-32-caracteres
JWT_EXPIRES_IN=7d

# Frontend
NEXT_PUBLIC_API_URL=https://api.seudominio.com
```

### Gerar JWT_SECRET seguro:
```bash
openssl rand -base64 32
```

## Passo 5: Domínios

Configure os domínios no EasyPanel:

| Serviço | Domínio Sugerido |
|---------|------------------|
| Web (Frontend) | `app.seudominio.com` |
| API (Backend) | `api.seudominio.com` |

## Passo 6: Rodar Migrations

Após o primeiro deploy, acesse o terminal do container da API e rode:

```bash
npx prisma db push
```

Ou, para usar migrations:
```bash
npx prisma migrate deploy
```

## Passo 7: Criar Primeiro Usuário Admin

Via terminal do container:

```bash
npx tsx prisma/seed.ts
```

---

## 🔧 Troubleshooting

### API não conecta no PostgreSQL
- Verifique se o nome do host está correto (geralmente é o nome do app: `aigenda-db`)
- Confirme usuário/senha
- Verifique se a porta 5432 está acessível internamente

### API não conecta no Redis
- Verifique se a URL está correta: `redis://aigenda-redis:6379`
- Confirme que o Redis está rodando

### Frontend não conecta na API
- Verifique `NEXT_PUBLIC_API_URL` está apontando para URL correta
- Para produção, use HTTPS: `https://api.seudominio.com`

### Erro de CORS
- Verifique se o domínio do frontend está permitido no CORS da API

---

## 📊 Monitoramento

O EasyPanel já oferece:
- ✅ Logs em tempo real
- ✅ Métricas de CPU/RAM
- ✅ Restart automático
- ✅ SSL automático (Let's Encrypt)

---

## 🔄 Updates

Para atualizar a aplicação:

1. Faça push para o branch `main` no GitHub
2. No EasyPanel, clique em **"Rebuild"** no app
3. Aguarde o deploy automático

---

## 💾 Backups

### PostgreSQL
Configure backup automático no EasyPanel ou use:
```bash
pg_dump -U aigenda aigenda > backup_$(date +%Y%m%d).sql
```

### Redis
O Redis com `appendonly yes` já persiste dados automaticamente.
Para backup manual:
```bash
redis-cli BGSAVE
```
