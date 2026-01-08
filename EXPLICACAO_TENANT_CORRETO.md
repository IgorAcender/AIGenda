# 🏢 Estrutura de Tenant na Aplicação

## 📋 Resumo Executivo

Você estava **100% correto**! O tenant está diferente no WhatsApp. A estrutura correta é:

```
Tenant (Modelo do Banco):
├── id: string        // ID único gerado automaticamente (CUID)
├── name: string      // Nome do salão (ex: "Minha Empresa", "Salão da Maria")
├── slug: string      // Versão URL-amigável (ex: "minha-empresa")
├── logo: string?     // Logo da empresa
├── email: string     // Email da empresa
└── phone: string?    // Telefone da empresa
```

---

## 🔴 O PROBLEMA ENCONTRADO

### Na WhatsApp Marketing Page (ERRADO):

```typescript
// apps/web/src/components/marketing/WhatsAppMarketingPage.tsx
const { user, tenant } = useAuth()
const tenantId = tenant?.id  // ← Certo, usa o ID

// Mas o hook useAuth() tem um mock hardcoded:
// apps/web/src/hooks/useAuth.ts
if (!tenant) {
  tenant = {
    id: 't1',                // ← Hardcoded como string simples
    name: 'Minha Empresa',
    slug: 'minha-empresa',
  }
}
```

### No resto da aplicação (CORRETO):

```typescript
// apps/web/src/stores/auth.ts
export interface Tenant {
  id: string        // ← ID único (CUID)
  name: string      // ← Nome do salão
  slug: string      // ← Slug amigável
  logo?: string
}

// Backend login retorna assim:
// apps/api/src/routes/auth.ts
response.tenant = {
  id: user.tenant.id,        // ID real do banco
  name: user.tenant.name,    // Nome do salão
  slug: user.tenant.slug,
  logo: user.tenant.logo,
}
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabela `Tenant`:
```sql
id          VARCHAR PRIMARY KEY (CUID)   -- "clrf1z5n90000qz8f8j6k5k5a"
name        VARCHAR NOT NULL             -- "Salão da Maria"
slug        VARCHAR UNIQUE NOT NULL      -- "salao-da-maria"
logo        VARCHAR NULL
email       VARCHAR UNIQUE NOT NULL      -- "maria@salao.com"
phone       VARCHAR NULL
whatsapp    VARCHAR NULL
-- ... mais campos
```

### Usuário exemplo:
```sql
id          CUID
email       "teste@email.com"
name        "João"
role        "OWNER"
tenantId    "clrf1z5n90000qz8f8j6k5k5a"  -- ← Vinculado ao tenant
```

---

## ✅ FLUXO CORRETO (Frontend → Backend → Banco)

### 1️⃣ Login do Usuário
```typescript
// Frontend faz POST
POST /auth/login
{
  "email": "teste@email.com",
  "password": "senha123"
}
```

### 2️⃣ Backend busca usuário com tenant
```typescript
// apps/api/src/routes/auth.ts:130-140
const user = await prisma.user.findUnique({
  where: { email },
  include: { 
    tenant: true,  // ← Inclui dados do tenant
    professional: true,
  },
})

// Retorna para o frontend:
{
  "user": { id, name, email, role, avatar },
  "token": "jwt_token",
  "tenant": {
    "id": "clrf1z5n90000qz8f8j6k5k5a",  // ← ID REAL do banco
    "name": "Minha Empresa",            // ← Nome do salão
    "slug": "minha-empresa",
    "logo": "url_logo"
  }
}
```

### 3️⃣ Frontend salva em sessionStorage
```typescript
// apps/web/src/hooks/useAuth.ts
if (typeof window !== 'undefined') {
  user = JSON.parse(sessionStorage.getItem('user') || 'null')
  tenant = JSON.parse(sessionStorage.getItem('tenant') || 'null')
  
  // Se houver tenant no sessionStorage, usa. Senão usa mock
  if (!tenant) {
    // ← AQUI está o problema: mock com 't1'
    tenant = {
      id: 't1',  // ← Deveria ser ID real
      name: 'Minha Empresa',
      slug: 'minha-empresa',
    }
  }
}
```

### 4️⃣ WhatsApp usa o tenant
```typescript
// apps/web/src/components/marketing/WhatsAppMarketingPage.tsx:65
const tenantId = tenant?.id  // ← Usa 't1' do mock

// Chama API
POST /api/whatsapp/setup
{
  "tenantId": "t1"  // ← Problema: espera ID real no banco
}
```

### 5️⃣ Backend tenta buscar tenant com 't1'
```typescript
// apps/api/src/routes/whatsapp.ts
const tenantMapping = await prisma.tenantEvolutionMapping.findUnique({
  where: { tenantId },
  include: { evolutionInstance: true },
})
// ← Falha porque 't1' não existe como CUID no banco!
```

---

## 🛠️ COMO CORRIGIR

### Opção 1: Usar dados reais do banco (RECOMENDADO)

**Passo 1:** Verificar qual tenant existe no banco
```bash
cd /Users/user/Desktop/Programação/AIGenda/apps/api
npx prisma studio
# Abra na UI e veja a tabela Tenant
# Anote o ID real (será um CUID como "clrf1z5n90000qz8f8j6k5k5a")
```

**Passo 2:** Atualizar o seed para usar dados reais
```bash
node seed-test-tenant.js
```

**Passo 3:** Remover o mock do useAuth.ts
```typescript
// apps/web/src/hooks/useAuth.ts - REMOVER ISTO:
if (!tenant) {
  tenant = {
    id: 't1',
    name: 'Minha Empresa',
    slug: 'minha-empresa',
  }
}

// Deixar assim:
if (!tenant) {
  tenant = null  // Forçar o usuário a fazer login
}
```

### Opção 2: Criar seed com dados completos (MAIS SIMPLES AGORA)

**Usar o script que já existe:**
```bash
cd /Users/user/Desktop/Programação/AIGenda/apps/api
node seed-test-tenant.js
```

Este script faz tudo automaticamente:
1. ✅ Cria tenant com name e slug corretos
2. ✅ Cria usuário vinculado ao tenant
3. ✅ Cria mapping com Evolution API
4. ✅ Mostra o ID real criado no banco

---

## 📝 Estrutura Real vs Mock

| Aspecto | No Banco (Real) | No useAuth Hook (Mock) | Correto? |
|---------|-----------------|------------------------|----------|
| Tenant ID | CUID (ex: clrf1z5n9) | String 't1' | ❌ Diferente |
| Tenant Name | "Salão da Maria" | "Minha Empresa" | ⚠️ Pode variar |
| Tenant Slug | "salao-da-maria" | "minha-empresa" | ⚠️ Pode variar |
| Source | Database (Prisma) | localStorage mock | ⚠️ Desincronizado |

---

## 🎯 Resumo da Solução

1. **O tenant ID no WhatsApp deve ser o ID real do banco** (um CUID)
2. **Não use strings hardcoded como 't1'** - isso não existe no banco
3. **O nome é o nome do salão**, não um identificador técnico
4. **Execute o seed-test-tenant.js** para criar dados de teste corretos
5. **Remova o mock do useAuth.ts** para forçar autenticação real

Isso vai resolver o erro HTTP 403 do WhatsApp porque o backend encontrará o tenant no banco! 🚀
