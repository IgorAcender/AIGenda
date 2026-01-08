# ✅ INSTRUÇÕES DE TESTE - BUG CORRIGIDO

## 🚀 Como Testar Agora

### 1️⃣ Abra DevTools e Limpe localStorage

```bash
# Pressione: F12 (ou Cmd+Option+I no Mac)
# Vá para: Console
# Cole:
localStorage.clear()
```

**Ou simplesmente faça logout e login novamente.**

### 2️⃣ Faça Login

**URL:** http://localhost:3000/login

**Credenciais:**
- Email: `maria@salao.com`
- Senha: `Maria@123`

### 3️⃣ Verifique se o tenant foi salvo

**Abra DevTools novamente:**

```bash
# DevTools → Application → Local Storage → localhost:3000
# Você deve ver essas chaves:
# - token
# - user  
# - tenant  ← NOVO! Antes não existia

# Clique em 'tenant' para ver o conteúdo:
{
  "id": "cmk5k5iur0000mu98ev59y5t0",
  "name": "Salão da Maria",
  "slug": "salao-da-maria",
  "email": "maria@salao.com",
  "phone": "(11) 98765-4321"
}
```

### 4️⃣ Acesse WhatsApp Marketing

**URL:** http://localhost:3000/marketing/whatsapp

**Você deve ver:**
- ✅ Sem alerta vermelho "Tenant não encontrado"
- ✅ Status: "Desconectado"
- ✅ Botões funcionando: "Atualizar QR Code", "Desconectar"

### 5️⃣ Teste o Botão "Atualizar QR Code"

Clique em **"Atualizar QR Code"**

**Resultado esperado:**
```
✅ Modal abre com:
   - QR Code (imagem 2D)
   - Instruções para escanear
   - Tempo de expiração
```

**Se não funcionar, verifique:**

```bash
# DevTools → Console
# Cole:
localStorage.getItem('tenant')
```

Se retornar `null` → Faça login novamente

---

## 🔍 Se Ainda Vir Erro

### Erro: "Tenant não encontrado"

**Passo 1:** Verificar localStorage
```bash
localStorage.getItem('user')
localStorage.getItem('tenant')
```

Se ambos são `null` → **Fazer login novamente**

### Erro: HTTP 403 ao gerar QR Code

**Passo 1:** Verificar se Evolution está rodando
```bash
curl -X GET http://localhost:8002/instance/list \
  -H "apikey: evolution_api_key_dev"
```

**Passo 2:** Verificar seed
```bash
cd /Users/user/Desktop/Programação/AIGenda/apps/api
node seed-test-tenant.js
```

---

## 📊 Checklist de Sucesso

- [ ] Login realizado com maria@salao.com / Maria@123
- [ ] localStorage contém: token, user, **tenant**
- [ ] Página /marketing/whatsapp carrega sem erros
- [ ] Sem alerta vermelho "Tenant não encontrado"
- [ ] Botão "Atualizar QR Code" funciona
- [ ] QR Code é exibido no modal

---

## 🎯 Resumo da Mudança

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Armazenamento | sessionStorage | **localStorage** |
| Tenant salvo no login | ❌ Não | **✅ Sim** |
| Tenant salvo no logout | ❌ Não | **✅ Sim** |
| WhatsApp vê tenant | ❌ Não | **✅ Sim** |
| Erro "Tenant não encontrado" | ❌ Sim | **✅ Não** |

---

## 💡 Dica: Força Refresh

Se não ver mudanças após fazer login novamente:

```bash
# Pressione: Ctrl+Shift+R (ou Cmd+Shift+R no Mac)
# Isso faz refresh forçado limpando cache do navegador
```

Teste agora! 🚀
