# 🔀 MUDANÇA EXATA DO BACKEND - ANTES E DEPOIS

## 📄 Arquivo: `/apps/api/src/index.ts`

---

## ✅ AGORA (Development com Mock)

```typescript
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import * as fs from 'fs'
import * as path from 'path'
import { authMockRoutes } from './routes/auth-mock'          // ← MOCK
import { clientRoutes } from './routes/clients'
import { professionalRoutes } from './routes/professionals'
import { serviceRoutes } from './routes/services'
import { categoryRoutes } from './routes/categories'
import { appointmentRoutes } from './routes/appointments'
import { publicBookingRoutes } from './routes/public-bookings'
import { transactionRoutes } from './routes/transactions'
import { dashboardRoutes } from './routes/dashboard'
import { tenantRoutes, tenantPublicRoutes } from './routes/tenants'
import { whatsappRoutesMock } from './routes/whatsapp-mock'  // ← MOCK
import { isRedisAvailable } from './lib/redis'

const app = Fastify({
  logger: true,
  bodyLimit: 5 * 1024 * 1024,
})

// ... resto do código ...

// Routes
app.register(authMockRoutes, { prefix: '/api/auth' })       // ← MOCK
app.register(tenantPublicRoutes, { prefix: '/api/tenants' })
app.register(tenantRoutes, { prefix: '/api/tenants' })
app.register(clientRoutes, { prefix: '/api/clients' })
app.register(professionalRoutes, { prefix: '/api/professionals' })
app.register(serviceRoutes, { prefix: '/api/services' })
app.register(categoryRoutes, { prefix: '/api/categories' })
app.register(appointmentRoutes, { prefix: '/api/appointments' })
app.register(publicBookingRoutes, { prefix: '' })
app.register(transactionRoutes, { prefix: '/api/transactions' })
app.register(dashboardRoutes, { prefix: '/api/dashboard' })
app.register(whatsappRoutesMock, { prefix: '/api/whatsapp' }) // ← MOCK
```

---

## 🔄 DEPOIS (Production com Banco Real)

```typescript
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import * as fs from 'fs'
import * as path from 'path'
import { authRoutes } from './routes/auth'                   // ← REAL
import { clientRoutes } from './routes/clients'
import { professionalRoutes } from './routes/professionals'
import { serviceRoutes } from './routes/services'
import { categoryRoutes } from './routes/categories'
import { appointmentRoutes } from './routes/appointments'
import { publicBookingRoutes } from './routes/public-bookings'
import { transactionRoutes } from './routes/transactions'
import { dashboardRoutes } from './routes/dashboard'
import { tenantRoutes, tenantPublicRoutes } from './routes/tenants'
import { whatsappRoutes } from './routes/whatsapp'           // ← REAL
import { isRedisAvailable } from './lib/redis'

const app = Fastify({
  logger: true,
  bodyLimit: 5 * 1024 * 1024,
})

// ... resto do código ...

// Routes
app.register(authRoutes, { prefix: '/api/auth' })           // ← REAL
app.register(tenantPublicRoutes, { prefix: '/api/tenants' })
app.register(tenantRoutes, { prefix: '/api/tenants' })
app.register(clientRoutes, { prefix: '/api/clients' })
app.register(professionalRoutes, { prefix: '/api/professionals' })
app.register(serviceRoutes, { prefix: '/api/services' })
app.register(categoryRoutes, { prefix: '/api/categories' })
app.register(appointmentRoutes, { prefix: '/api/appointments' })
app.register(publicBookingRoutes, { prefix: '' })
app.register(transactionRoutes, { prefix: '/api/transactions' })
app.register(dashboardRoutes, { prefix: '/api/dashboard' })
app.register(whatsappRoutes, { prefix: '/api/whatsapp' })   // ← REAL
```

---

## 📊 Mudanças Exatas:

### Import 1:
```
❌ REMOVER: import { authMockRoutes } from './routes/auth-mock'
✅ ADICIONAR: import { authRoutes } from './routes/auth'
```

### Import 2:
```
❌ REMOVER: import { whatsappRoutesMock } from './routes/whatsapp-mock'
✅ ADICIONAR: import { whatsappRoutes } from './routes/whatsapp'
```

### Register 1:
```
❌ REMOVER: app.register(authMockRoutes, { prefix: '/api/auth' })
✅ ADICIONAR: app.register(authRoutes, { prefix: '/api/auth' })
```

### Register 2:
```
❌ REMOVER: app.register(whatsappRoutesMock, { prefix: '/api/whatsapp' })
✅ ADICIONAR: app.register(whatsappRoutes, { prefix: '/api/whatsapp' })
```

---

## 🎯 RESUMO:

**Total de linhas que mudam: 4**

| O quê | Antes | Depois |
|-------|-------|--------|
| Import Auth | `authMockRoutes` | `authRoutes` |
| Import WhatsApp | `whatsappRoutesMock` | `whatsappRoutes` |
| Register Auth | `authMockRoutes` | `authRoutes` |
| Register WhatsApp | `whatsappRoutesMock` | `whatsappRoutes` |

**Tudo o mais continua IGUAL!**

---

## 🚀 COMO FAZER:

### Opção 1: Manual (Editando arquivo)
```
1. Abra: /apps/api/src/index.ts
2. Linha 8: authMockRoutes → authRoutes
3. Linha 19: whatsappRoutesMock → whatsappRoutes
4. Linha ~110: authMockRoutes → authRoutes
5. Linha ~120: whatsappRoutesMock → whatsappRoutes
6. Salve arquivo
7. Reinicie servidor (Ctrl+C, pnpm dev)
```

### Opção 2: Via Script
```bash
# Dentro de /apps/api/src
sed -i '' 's/authMockRoutes/authRoutes/g' index.ts
sed -i '' 's/whatsappRoutesMock/whatsappRoutes/g' index.ts
```

---

## ✅ VERIFICAÇÃO:

Depois de trocar, procure por:
```bash
grep -n "authRoutes\|whatsappRoutes" /apps/api/src/index.ts
```

Deve mostrar:
```
8: import { authRoutes } from './routes/auth'
19: import { whatsappRoutes } from './routes/whatsapp'
110: app.register(authRoutes, { prefix: '/api/auth' })
120: app.register(whatsappRoutes, { prefix: '/api/whatsapp' })
```

---

## 🔍 O Que Diferencia os Arquivos:

### `/routes/auth-mock.ts` (Memória)
```typescript
const MOCK_USERS = { ... }  // Dados em memória

export async function authMockRoutes(app: FastifyInstance) {
  app.post('/login', async (request, reply) => {
    const user = MOCK_USERS[email]  // ← Procura em objeto JS
    // ...
  })
}
```

### `/routes/auth.ts` (Banco Real)
```typescript
import { prisma } from '../lib/prisma'  // Importa Prisma

export async function authRoutes(app: FastifyInstance) {
  app.post('/login', async (request, reply) => {
    const user = await prisma.user.findUnique(...)  // ← Busca no banco
    // ...
  })
}
```

**Mesma lógica, fonte de dados diferente!**

---

## 🎓 Por Que Funciona?

1. **Ambos os arquivos exportam a mesma função**
   ```typescript
   export async function authRoutes(...)
   export async function authMockRoutes(...)
   ```

2. **Ambos registram os mesmos endpoints**
   ```
   POST /api/auth/login
   POST /api/auth/register
   GET /api/auth/me
   etc...
   ```

3. **Ambos retornam o mesmo formato**
   ```json
   {
     "success": true,
     "user": { ... },
     "token": "..."
   }
   ```

4. **Frontend continua igual**
   ```typescript
   const response = await fetch('/api/auth/login', ...)
   // Funciona com ambas versões!
   ```

---

## 📋 Pré-Requisitos para Trocar:

Antes de trocar do mock para real:

- [ ] PostgreSQL instalado e rodando
- [ ] Schema Prisma migrado (`pnpm db:push`)
- [ ] Usuários criados no banco (`pnpm db:seed`)
- [ ] Evolution API credenciais (se usar WhatsApp real)

---

## ⚠️ Possíveis Erros:

Se trocar e der erro:

**Erro: "Can't reach database"**
```
Causa: PostgreSQL não está rodando
Solução: docker-compose up -d postgres
```

**Erro: "prisma.user.findUnique is not a function"**
```
Causa: Prisma não foi inicializado
Solução: pnpm db:push
```

**Erro: "No users found"**
```
Causa: Sem dados no banco
Solução: pnpm db:seed (criar dados padrão)
```

---

## 🎉 Depois de Trocar:

```bash
# 1. Pare o servidor (Ctrl+C)

# 2. Verifique PostgreSQL
docker-compose ps

# 3. Reinicie servidor
pnpm dev

# 4. Teste login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu-usuario@banco","password":"sua-senha"}'

# 5. Deve retornar token JWT
```

---

## 🎯 CONCLUSÃO:

**Você estava certo:**
- Frontend: Não muda
- Backend: SIM MUDA (4 linhas em 1 arquivo)

**A mudança é simples, planejada e reversível.**

Se precisar voltar para mock, é só trocar as 4 linhas de volta! ✅

---

*Pronto para fazer a mudança quando chegar o momento?*
