# 💾 COMO API FUNCIONA SEM BANCO? - EXPLICAÇÃO TÉCNICA

## 🤔 SUA PERGUNTA:

> "Como uma API vai dar certo sem um banco de dados?"

**Resposta:** Os dados ficam na **MEMÓRIA do servidor** em vez de em um arquivo.

---

## 🎯 ENTENDER A DIFERENÇA:

### ❌ COM BANCO DE DADOS (Normal):

```
Cliente (Frontend)
    ↓
    Requisição HTTP
    ↓
API (Backend)
    ↓
    SELECT * FROM users WHERE email = 'test@example.com'
    ↓
PostgreSQL (Disco)
    ↓
    Retorna dados do arquivo no disco
    ↓
API envia resposta
    ↓
Cliente mostra dados
```

**Problema aqui:**
- Precisa PostgreSQL instalado e rodando
- Precisa disco para armazenar
- Mais lento (busca em disco)

---

### ✅ COM MOCK (Como é agora):

```
Cliente (Frontend)
    ↓
    Requisição HTTP
    ↓
API (Backend)
    ↓
    Procura em array JavaScript em memória:
    const MOCK_USERS = {
      'test@example.com': {
        id: 'user-001',
        name: 'Teste User',
        email: 'test@example.com',
        password: 'password123'
      }
    }
    ↓
    Encontrou! Retorna dados
    ↓
API envia resposta
    ↓
Cliente mostra dados
```

**Vantagem:**
- Dados em memória RAM (super rápido!)
- Zero dependências externas
- Não precisa arquivo/disco
- Funciona AGORA!

---

## 💡 EXEMPLO PRÁTICO:

### REQUISIÇÃO: Login

```bash
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}
```

### SEM MOCK (Com Banco):

```typescript
// Arquivo: /apps/api/src/routes/auth.ts

export async function authRoutes(app: FastifyInstance) {
  app.post('/login', async (request, reply) => {
    const { email, password } = request.body
    
    // ❌ Tenta buscar no banco
    const user = await prisma.user.findUnique({ 
      where: { email } 
    })
    // ^ Isso FALHA se PostgreSQL não estiver rodando!
    
    if (!user) {
      return reply.status(401).send({ error: 'Inválido' })
    }
    
    // Continua...
  })
}
```

**Resultado se banco estiver parado:**
```
❌ Error: Can't reach database server at localhost:5432
❌ API retorna erro 500
❌ Página não carrega
```

---

### COM MOCK (Sem Banco):

```typescript
// Arquivo: /apps/api/src/routes/auth-mock.ts

// Dados em memória (criado quando API inicia):
const MOCK_USERS: { [key: string]: any } = {
  'test@example.com': {
    id: 'user-001',
    name: 'Teste User',
    email: 'test@example.com',
    password: 'password123',
    role: 'OWNER',
    tenantId: 'tenant-001',
  },
  'master@example.com': {
    id: 'user-master',
    name: 'Master User',
    email: 'master@example.com',
    password: 'master123',
    role: 'MASTER',
  },
  // ... mais usuários
}

export async function authMockRoutes(app: FastifyInstance) {
  app.post('/login', async (request, reply) => {
    const { email, password } = request.body
    
    // ✅ Procura no objeto JavaScript
    const user = MOCK_USERS[email]
    
    if (!user) {
      return reply.status(401).send({ error: 'Inválido' })
    }
    
    if (user.password !== password) {
      return reply.status(401).send({ error: 'Inválido' })
    }
    
    // ✅ Gera token e retorna
    const token = app.jwt.sign(...)
    
    return reply.send({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
      token: token
    })
  })
}
```

**Resultado:**
```
✅ Encontrou usuário em memória
✅ Validou senha
✅ Gerou token JWT
✅ Retornou resposta
✅ Sem precisar de banco!
```

---

## 📊 COMPARAÇÃO VISUAL:

```
┌────────────────────────────────────────────────────────┐
│              COM BANCO DE DADOS                         │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend        API         PostgreSQL                │
│    ↓             ↓               ↓                      │
│  "Quem é        Query        Lê arquivo               │
│   usuario       SELECT       no disco                 │
│   123?"         FROM         e retorna               │
│                 users         dados                   │
│                              ↓                         │
│                              Resposta                 │
│                                ↓                      │
│                              API recebe               │
│                                ↓                      │
│                              Frontend                 │
│                                                         │
│  ✅ Dados persistem (salva em arquivo)                │
│  ❌ Mais lento (busca em disco)                        │
│  ❌ Precisa PostgreSQL rodando                         │
│  ❌ Precisa configurar conexão                         │
│                                                         │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                  COM MOCK (SEM BANCO)                   │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend        API (em memória)                      │
│    ↓             ↓                                      │
│  "Quem é        const USERS = {                       │
│   usuario         123: { name: 'João' }               │
│   123?"         }                                       │
│                                                         │
│                 Procura em array                       │
│                 JavaScript                             │
│                   ↓                                     │
│                 Encontrou!                             │
│                   ↓                                     │
│                 Frontend                               │
│                                                         │
│  ✅ Super rápido (em RAM)                             │
│  ✅ Zero dependências                                 │
│  ✅ Funciona AGORA                                    │
│  ❌ Dados não persistem (reseta ao reiniciar)        │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

## 🔍 ESTRUTURA DO MOCK:

### Usuários:

```typescript
const MOCK_USERS = {
  'test@example.com': {
    id: 'user-001',
    name: 'Teste User',
    email: 'test@example.com',
    password: 'password123',
    role: 'OWNER',
  },
  'professional@example.com': {
    id: 'user-pro-001',
    name: 'Professional User',
    email: 'professional@example.com',
    password: 'pro123',
    role: 'PROFESSIONAL',
  },
}
```

### Tenants:

```typescript
const MOCK_TENANTS = {
  'tenant-001': {
    id: 'tenant-001',
    name: 'Meu Negócio',
    slug: 'meu-negocio',
    ownerId: 'user-001',
  },
}
```

### Instâncias Evolution:

```typescript
const MOCK_INSTANCES = [
  {
    id: 1,
    name: 'Evolution Server 1',
    url: 'https://evolution1.example.com',
    occupancyPercent: 45,
    isActive: true,
  },
  {
    id: 2,
    name: 'Evolution Server 2',
    url: 'https://evolution2.example.com',
    occupancyPercent: 62,
    isActive: true,
  },
  // ... 10 servidores total
]
```

### Status de Conexão:

```typescript
const MOCK_STATUSES = {
  'test-tenant-demo-001': {
    status: 'disconnected',
    message: 'Não conectado',
    lastUpdate: new Date(),
  },
}
```

**Tudo isso é JavaScript puro em memória!**

---

## 🚀 COMO FUNCIONA O FLUXO:

### 1️⃣ API inicia:

```typescript
// Quando server.js roda:
const app = Fastify()

// Carrega dados mock em memória:
const MOCK_USERS = { ... }
const MOCK_TENANTS = { ... }
const MOCK_INSTANCES = [ ... ]
const MOCK_STATUSES = { ... }

// Registra rotas:
app.register(authMockRoutes)
app.register(whatsappRoutesMock)

// Inicia servidor:
app.listen({ port: 3001 })
// ✅ Pronto! Em memória, sem disco
```

### 2️⃣ Cliente faz requisição:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3️⃣ API processa:

```typescript
app.post('/login', async (request, reply) => {
  const { email, password } = request.body
  
  // Procura em MOCK_USERS (em memória, super rápido!)
  const user = MOCK_USERS[email]
  
  if (!user || user.password !== password) {
    return reply.status(401).send({ error: 'Inválido' })
  }
  
  // Gera JWT
  const token = app.jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    { expiresIn: '7d' }
  )
  
  // Retorna resposta
  return reply.send({
    success: true,
    user: { id: user.id, name: user.name, email: user.email },
    tenant: MOCK_TENANTS[user.tenantId],
    token: token
  })
})
```

### 4️⃣ Cliente recebe resposta:

```json
{
  "success": true,
  "user": {
    "id": "user-001",
    "name": "Teste User",
    "email": "test@example.com"
  },
  "tenant": {
    "id": "tenant-001",
    "name": "Meu Negócio",
    "slug": "meu-negocio"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## ❓ PERGUNTAS COMUNS:

### P: "Dados desaparecem ao reiniciar?"
**R:** Sim! Mas é só DEV. Em PROD usa banco real que persiste.

### P: "Quantos usuários posso ter?"
**R:** Os que definir no array. Para teste: 3 usuários é suficiente.

### P: "Performance é igual ao banco?"
**R:** **Melhor!** Array em RAM é mais rápido que disco.

### P: "E se mudar dados em memória?"
**R:** Muda só enquanto API está rodando. Ao reiniciar, volta ao original.

### P: "Isso é "gambiarra"?"
**R:** Não! É padrão de desenvolvimento. Chamamos "In-Memory Database" ou "Test Doubles".

---

## 📈 CICLO DE VIDA DO MOCK:

```
1. Você roda: pnpm dev
   ↓
2. Node.js inicia servidor Fastify
   ↓
3. Carrega MOCK_USERS, MOCK_TENANTS, etc em RAM
   ↓
4. API aguarda requisições
   ↓
5. Frontend conecta e faz requisições
   ↓
6. API processa usando dados em RAM (super rápido!)
   ↓
7. Frontend mostra resultados
   ↓
8. Você fecha: Ctrl+C
   ↓
9. Dados em RAM são descartados
   ↓
10. Próxima vez que roda, volta aos dados originais
```

---

## 🔄 QUANDO MUDA PARA REAL:

```typescript
// HOJE (Mock):
const MOCK_USERS = { ... }
const user = MOCK_USERS[email]

        ↓ (quando tiver banco)

// AMANHÃ (Real):
const user = await prisma.user.findUnique({ 
  where: { email } 
})
// ^ Busca no PostgreSQL em vez de memória
```

**A interface permanece igual!** 

```typescript
// Mesmo código:
if (!user) return error()
const token = jwt.sign(...)
return { success: true, token }

// Funciona com mock E com banco real
```

---

## 🎯 CONCLUSÃO:

**Como API funciona sem banco?**

```
Dados → Em vez de arquivo no disco (PostgreSQL)
      → Ficam em array JavaScript na RAM

Quando procura:
      → Em vez de SQL query no banco
      → Procura em objeto JavaScript

Resultado:
      → Mesma resposta API
      → Sem precisar de banco
      → Mais rápido (RAM vs Disco)
      → Perfeito para desenvolvimento
```

---

## 🚀 PRÓXIMO PASSO:

Quando quiser dados reais:

```bash
# 1. Inicia PostgreSQL:
docker-compose up -d postgres

# 2. Muda 2 imports no /apps/api/src/index.ts:
- import { authMockRoutes } from './routes/auth-mock'
+ import { authRoutes } from './routes/auth'

# 3. Roda novamente:
pnpm dev

# ✅ Agora usa banco real em vez de mock!
```

---

*Entendido? Quer que eu configure PostgreSQL agora ou continua com mock?*
