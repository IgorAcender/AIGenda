# 🚀 MOCK EM DEV vs PRODUÇÃO - GUIA PRÁTICO

## 🤔 SUA PERGUNTA:

> "Como vou usar DEV com mock? E quando for pra produção?"

**Resposta:** É bem simples! Você vai usar:
- **DEV:** Mock (agora, tudo funciona)
- **PRODUÇÃO:** Dados reais (quando estiver pronto)

---

## 🎯 EXPLICAÇÃO COM EXEMPLOS:

### CENÁRIO 1: AGORA (DEV com Mock)

**Você está aqui! ⬅️**

```bash
# Comando para rodar:
pnpm dev

# O que acontece:
- Servidor inicia em http://localhost:3000 (Frontend)
- Servidor inicia em http://localhost:3001 (API)
- API usa MOCK DATA (tudo em memória)
- Funciona 100% sem nada instalado
```

**Código ativo (`/apps/api/src/index.ts`):**
```typescript
import { authMockRoutes } from './routes/auth-mock'
import { whatsappRoutesMock } from './routes/whatsapp-mock'

app.register(authMockRoutes, { prefix: '/api/auth' })
app.register(whatsappRoutesMock, { prefix: '/api/whatsapp' })
// ✅ Usa mock, não usa banco de dados
```

**Resultado:**
- ✅ Página carrega
- ✅ Login funciona (email: test@example.com)
- ✅ WhatsApp Marketing funciona
- ✅ Instâncias mostram (simuladas)
- ✅ QR Code aparece (simulado)
- ✅ Sem precisar de PostgreSQL
- ✅ Sem precisar de Evolution API

---

### CENÁRIO 2: PRODUÇÃO (Depois, com dados reais)

**Quando você decidir lançar:**

```bash
# 1️⃣ Primeiro, iniciar banco real:
docker-compose up -d postgres

# 2️⃣ Depois, rodar:
pnpm dev

# O que muda no código:
```

**Código que você vai MUDAR (`/apps/api/src/index.ts`):**

```typescript
// ❌ REMOVER ESSAS LINHAS:
- import { authMockRoutes } from './routes/auth-mock'
- import { whatsappRoutesMock } from './routes/whatsapp-mock'

// ✅ ADICIONAR ESSAS LINHAS:
+ import { authRoutes } from './routes/auth'
+ import { whatsappRoutes } from './routes/whatsapp'

// ❌ REMOVER ESSAS LINHAS:
- app.register(authMockRoutes, { prefix: '/api/auth' })
- app.register(whatsappRoutesMock, { prefix: '/api/whatsapp' })

// ✅ ADICIONAR ESSAS LINHAS:
+ app.register(authRoutes, { prefix: '/api/auth' })
+ app.register(whatsappRoutes, { prefix: '/api/whatsapp' })
```

**Resultado:**
- ✅ Dados salvos no PostgreSQL
- ✅ Evolution API real conectada
- ✅ Usuários autênticos
- ✅ WhatsApp funcionando de verdade
- ✅ Pronto para produção

---

## 📊 VISUALIZAÇÃO:

```
┌─────────────────────────────────────────────────────────┐
│                    DESENVOLVIMENTO (Agora)               │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Frontend (Next.js)  ←→  API (Fastify)                  │
│  :3000                   :3001                           │
│                            │                              │
│                            └─→ MOCK DATA (em memória)   │
│                                │                          │
│                                ├─ Usuários simulados     │
│                                ├─ Instâncias simuladas   │
│                                ├─ QR Code simulado       │
│                                └─ Status simulado        │
│                                                           │
│  ✅ Funciona agora (zero dependências)                   │
│  ✅ Sem banco de dados                                   │
│  ✅ Sem Evolution API                                    │
│                                                           │
└─────────────────────────────────────────────────────────┘

                            ↓ (Quando estiver pronto)

┌─────────────────────────────────────────────────────────┐
│                   PRODUÇÃO (Depois)                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Frontend (Next.js)  ←→  API (Fastify)                  │
│  :3000                   :3001                           │
│                            │                              │
│                    ┌───────┼───────┐                      │
│                    ↓               ↓                      │
│              PostgreSQL      Evolution API               │
│              (Dados reais)   (WhatsApp real)            │
│                                                           │
│  ✅ Dados persistentes                                   │
│  ✅ Múltiplos usuários                                   │
│  ✅ WhatsApp autêntico                                   │
│  ✅ Pronto para clientes                                 │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUXO PASSO A PASSO:

### HOJE (Desenvolvimento):

```
1. Você escreve código
   ↓
2. Roda: pnpm dev
   ↓
3. Abre: http://localhost:3000/whatsapp-marketing
   ↓
4. Testa com MOCK DATA
   ✅ Botões funcionam
   ✅ Modal abre
   ✅ Dados aparecem
   ✅ Tudo simula corretamente
   ↓
5. Continua desenvolvendo, refinando UI/UX
   ↓
6. Quando componente está 100% pronto → commit
```

### DEPOIS (Produção):

```
1. Você instala PostgreSQL real
   ↓
2. Instala credenciais Evolution API
   ↓
3. Muda 4 linhas no código (authMockRoutes → authRoutes)
   ↓
4. Roda: pnpm dev
   ↓
5. Agora API usa dados REAIS
   ✅ Login autêntico
   ✅ QR Code real
   ✅ WhatsApp funciona
   ✅ Dados salvam no banco
   ↓
6. Deploy em produção
```

---

## 💻 EXEMPLO PRÁTICO:

### AGORA (Mock):

```bash
$ curl http://localhost:3001/api/whatsapp/instances
```

**Resposta Mock (em memória):**
```json
{
  "success": true,
  "instances": [
    {
      "id": 1,
      "name": "Evolution Server 1",
      "occupancyPercent": 45,
      "isActive": true
    },
    {
      "id": 2,
      "name": "Evolution Server 2",
      "occupancyPercent": 62,
      "isActive": true
    },
    // ... 8 mais (tudo simulado)
  ]
}
```

### DEPOIS (Real):

```bash
$ curl http://localhost:3001/api/whatsapp/instances
```

**Resposta Real (do Evolution API):**
```json
{
  "success": true,
  "instances": [
    {
      "id": "instance-uuid-real-1",
      "name": "Seu Negócio - WhatsApp 1",
      "occupancyPercent": 23,  // Real, de usuários autênticos
      "isActive": true,
      "connectedAt": "2026-01-07T10:30:00Z"
    },
    {
      "id": "instance-uuid-real-2",
      "name": "Seu Negócio - WhatsApp 2",
      "occupancyPercent": 67,  // Real
      "isActive": true,
      "connectedAt": "2026-01-07T11:15:00Z"
    },
    // ... dados reais da Evolution API
  ]
}
```

---

## 📋 CHECKLIST:

### ✅ HOJE (Development com Mock):

- [x] Página carrega
- [x] Clica em botões
- [x] Modal abre
- [x] Vê dados simulados
- [x] Notificações aparecem
- [x] Polling funciona
- [x] Zero dependências externas
- [x] Rápido de desenvolver

### ⏳ DEPOIS (Production com Real):

- [ ] PostgreSQL rodando
- [ ] Evolution API credenciais obtidas
- [ ] Usuários reais criados no banco
- [ ] Instâncias Evolution conectadas
- [ ] Dados salvando no banco
- [ ] QR Code gerado de verdade
- [ ] WhatsApp autêntico funcionando
- [ ] Deploy em servidor

---

## 🎯 ANALOGIA:

**Mock é como:**
```
┌─────────────────────────────────────────┐
│    Protótipo em Papelão de Carro       │
├─────────────────────────────────────────┤
│                                         │
│ ✅ Mostra como será o design           │
│ ✅ Testa usabilidade                   │
│ ✅ Apresenta ao cliente                │
│ ❌ Não funciona na prática (não é real)│
│                                         │
│ Depois → Fábrica constrói carro real   │
│         (mesma estrutura, dados reais)  │
│                                         │
└─────────────────────────────────────────┘
```

**Seu código é assim:**
```
Mock (agora):        Código de UI/UX completo
                     + Dados simulados
                     = Prototipagem rápida

Real (depois):       Mesmo código de UI/UX
                     + Dados do banco real
                     + Evolution API real
                     = Produção
```

---

## 🚀 RESUMINDO:

### Como funciona DEV com Mock?

```
1. Você clona o projeto
2. Roda: cd AIGenda && pnpm dev
3. Abre: http://localhost:3000/whatsapp-marketing
4. Tudo funciona com dados em memória
5. Desenvolve/testa sem dependências externas
```

### Como muda para Produção?

```
1. Instala PostgreSQL
2. Muda 4 linhas no código (auth-mock → auth)
3. Muda 2 linhas no código (whatsapp-mock → whatsapp)
4. Roda: pnpm dev
5. Agora usa banco real + Evolution API real
6. Deploy!
```

### A Magia:

**A interface da API é IDÊNTICA!**

```typescript
// MOCK:
import { authMockRoutes } from './routes/auth-mock'
app.register(authMockRoutes)

// Endpoints:
POST /api/auth/login
POST /api/auth/register
GET /api/auth/me
// ↓
// REAL:
import { authRoutes } from './routes/auth'
app.register(authRoutes)

// Mesmos endpoints!
POST /api/auth/login
POST /api/auth/register
GET /api/auth/me

// Frontend não muda NADA! ✅
// Só o backend muda (mock ↔ real)
```

---

## 💡 BENEFÍCIO:

```
Sem Mock:
- Espera PostgreSQL + Evolution API
- Não consegue testar UI agora
- Desperdiça tempo em setup
- Bloqueia outras pessoas

Com Mock:
- Testa UI agora
- Continua desenvolvendo
- Outros podem usar/testar
- Quando pronto, troca por real
- Zero tempo perdido ✅
```

---

## ❓ DÚVIDAS COMUNS:

### P: "Preciso deletar o mock depois?"
**R:** Não! Deixa lá. Pode ser útil para:
- Testes automatizados
- Demonstrações offline
- Backup se API cair

### P: "Mock salva dados?"
**R:** Não, são em memória. Quando reinicia, volta ao padrão.
(Por isso precisa do banco real depois)

### P: "Clientes vão ver o mock?"
**R:** Não! Mock é só em DEV.
Em PRODUÇÃO usa dados reais.

### P: "É difícil trocar?"
**R:** Não! Apenas 4 linhas mudam no código.

---

## 📝 CONCLUSÃO:

**AGORA:** Mock permite desenvolver/testar SEM esperar por nada

**DEPOIS:** Troca Mock por Real (mesma interface) → Produção

**Você ganha:** Prototipagem rápida + Código pronto para real

---

*Quer que eu configure PostgreSQL e Evolution API real agora? 
Ou prefere continuar com mock por enquanto?*
