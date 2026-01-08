# 🐛 BUG ENCONTRADO E CORRIGIDO: localStorage vs sessionStorage

## ❌ O Problema

O erro "Tenant não encontrado" acontecia porque havia uma **desincronização** no armazenamento de dados:

### Como funcionava (ERRADO):
1. **Login** → Backend retorna `tenant` no response
2. **API salva** em `localStorage`: 
   ```javascript
   localStorage.setItem('token', response.data.token)
   localStorage.setItem('user', JSON.stringify(response.data.user))
   // ❌ Não estava salvando tenant!
   ```
3. **useAuth.ts tenta ler** de `sessionStorage`:
   ```typescript
   user = JSON.parse(sessionStorage.getItem('user') || 'null')      // ← Vazio!
   tenant = JSON.parse(sessionStorage.getItem('tenant') || 'null')  // ← Vazio!
   ```
4. **Resultado**: `user = null`, `tenant = null`
5. **WhatsApp vê** `tenant?.id = undefined` → Erro "Tenant não encontrado"

---

## ✅ Solução Aplicada

### 1. Sincronizar armazenamento (localStorage)

**ANTES:**
```typescript
// apps/web/src/hooks/useAuth.ts
user = JSON.parse(sessionStorage.getItem('user') || 'null')
tenant = JSON.parse(sessionStorage.getItem('tenant') || 'null')
```

**DEPOIS:**
```typescript
user = JSON.parse(localStorage.getItem('user') || 'null')
tenant = JSON.parse(localStorage.getItem('tenant') || 'null')
```

### 2. Salvar tenant no login

**ANTES:**
```typescript
// apps/web/src/lib/api.ts
login: async (data) => {
  const response = await api.post('/auth/login', data)
  localStorage.setItem('token', response.data.token)
  localStorage.setItem('user', JSON.stringify(response.data.user))
  // ❌ Tenant não era salvo!
}
```

**DEPOIS:**
```typescript
login: async (data) => {
  const response = await api.post('/auth/login', data)
  localStorage.setItem('token', response.data.token)
  localStorage.setItem('user', JSON.stringify(response.data.user))
  // ✅ NOVO: Salvar tenant também
  if (response.data.tenant) {
    localStorage.setItem('tenant', JSON.stringify(response.data.tenant))
  }
}
```

### 3. Remover tenant no logout

**ANTES:**
```typescript
logout: async () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  // ❌ Tenant não era removido!
}
```

**DEPOIS:**
```typescript
logout: async () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('tenant')  // ✅ NOVO
}
```

---

## 🔄 Fluxo Agora (Corrigido)

```
1. Usuário faz login
   Email: maria@salao.com
   Senha: Maria@123
   ↓
2. Backend retorna:
   {
     "token": "jwt...",
     "user": { id, name, email, role },
     "tenant": { id: "cmk5k5iur...", name: "Salão da Maria", ... }
   }
   ↓
3. Frontend salva em localStorage:
   ✅ token
   ✅ user
   ✅ tenant  (AGORA SIM!)
   ↓
4. useAuth.ts lê de localStorage:
   user = { ... }     ✅
   tenant = { ... }   ✅
   ↓
5. WhatsApp acessa:
   tenant?.id = "cmk5k5iur..."  ✅
   ↓
6. API recebe tenant ID real
   ↓
7. WhatsApp funciona! 🚀
```

---

## 📝 Arquivos Modificados

```
✅ apps/web/src/hooks/useAuth.ts
   - Mudado: sessionStorage → localStorage
   - Adicionado: localStorage.removeItem('token') no logout

✅ apps/web/src/lib/api.ts
   - Adicionado: localStorage.setItem('tenant') no login
   - Adicionado: localStorage.removeItem('tenant') no logout
```

---

## 🧪 Como Testar

### Passo 1: Limpar localStorage (ou simplesmente fazer logout e login novamente)

```bash
# Abra DevTools (F12) → Console
localStorage.clear()
```

### Passo 2: Fazer login

```
Email: maria@salao.com
Senha: Maria@123
```

### Passo 3: Verificar localStorage

```bash
# DevTools → Application → Local Storage → localhost:3000
localStorage.getItem('tenant')
# Deve retornar:
# {"id":"cmk5k5iur0000mu98ev59y5t0","name":"Salão da Maria","slug":"salao-da-maria",...}
```

### Passo 4: Acessar WhatsApp Marketing

```
Marketing → WhatsApp Marketing
```

✅ Agora deve aparecer:
- ✅ Sem erro "Tenant não encontrado"
- ✅ Status: "Desconectado"
- ✅ Botão "Atualizar QR Code" funcionando

---

## 🎉 Conclusão

O problema era simples: **localStorage vs sessionStorage desincronizados** + **tenant não era salvo no login**.

Agora tudo está sincronizado e funcionando corretamente! ✨
