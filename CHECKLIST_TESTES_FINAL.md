# ✅ CHECKLIST FINAL - TESTAR AGORA

## 🎯 OBJETIVO
Validar que o QR Code aparece ao conectar WhatsApp

## 📋 PASSOS

### ✅ 1. Verificar que API está rodando
```bash
# Terminal: Verifique se está em http://0.0.0.0:3001
curl http://localhost:3001/api/health 2>/dev/null || echo "API não responde"
```

**Esperado:** Sem erro, significa API respondendo

---

### ✅ 2. Abrir navegador e fazer login
```
http://localhost:3000/login
```

**Login:**
- Email: `maria@salao.com`
- Senha: `Maria@123`

**Esperado:** Redireciona para `/dashboard`

---

### ✅ 3. Navegar para WhatsApp Marketing
```
http://localhost:3000/marketing/whatsapp
```

**Esperado:**
- ❌ SEM erro "Tenant não encontrado"
- ✅ Página carrega normalmente
- ✅ Botão "Conectar WhatsApp" aparece

---

### ✅ 4. TESTE CRÍTICO: Clique em "Conectar WhatsApp"

**Observar:**
1. Mensagem carregando: "Gerando QR Code..."
2. **DENTRO DE 2 SEGUNDOS:** QR Code aparece
3. Modal exibe:
   - Imagem do QR code (preto e branco)
   - Instruções "Escaneie com seu WhatsApp"
   - Botão "Atualizar QR Code"

**Esperado:** ✅ QR Code visível

---

### ✅ 5. Se QR Code aparece, testar scan
1. Pega celular
2. Abre WhatsApp
3. Escaneia QR Code
4. Confirma conexão

**Esperado:** ✅ WhatsApp conecta

---

## ⚠️ SE ALGO DER ERRADO

### ❌ Erro "Tenant não encontrado"
**Solução:**
```bash
# Verifique que localStorage foi salvo:
# DevTools > Application > localStorage
# Deve ter: user, tenant, token

# Se não tiver, fazer login novamente
```

### ❌ QR Code não aparece (branco)
**Solução:**
```bash
# Aumentar delay no código:
# apps/api/src/lib/evolution.service.ts
# Linha ~159: setTimeout(resolve, 1000)
# Mudar para: setTimeout(resolve, 2000)
```

### ❌ Erro ao conectar ("Conexão recusada")
**Solução:**
```bash
# Verificar que API está em http://localhost:3001:
lsof -i :3001

# Se vazio, reiniciar:
cd /Users/user/Desktop/Programação/AIGenda/apps/api
npm run dev
```

---

## 📊 DADOS DE TESTE PRONTOS

| Campo | Valor |
|-------|-------|
| Email | maria@salao.com |
| Senha | Maria@123 |
| Tenant ID | cmk5k5iur0000mu98ev59y5t0 |
| Tenant | Salão da Maria |
| API | http://localhost:3001 |
| Web | http://localhost:3000 |

---

## 📱 EXPECTED FLOW

```
🔐 Login (maria@salao.com)
   ↓ ✅ Zustand salva user + tenant no localStorage
   ↓
📊 Dashboard abre
   ↓ ✅ useAuth() lê localStorage
   ↓
💬 Clica "WhatsApp Marketing"
   ↓ ✅ Página carrega sem erros
   ↓
📱 Clica "Conectar WhatsApp"
   ↓ ✅ POST /api/whatsapp/setup
   ↓ ✅ GET /instance/connect/{name}
   ↓
🎫 QR Code aparece em < 2 segundos
   ↓
📹 Escaneia com celular
   ↓
✅ WhatsApp conecta!
```

---

## 🎯 SUCCESS CRITERIA

- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] WhatsApp Marketing abre SEM erro
- [ ] QR Code aparece em < 2 segundos
- [ ] QR Code tem imagem legível
- [ ] Consegue scannear com celular
- [ ] WhatsApp conecta com sucesso

---

## 🚀 QUANDO ESTÁ 100%

Todos os checkboxes acima ✅

**Parabéns!** O AIGenda WhatsApp está pronto para uso! 🎉

---

## 📞 DÚVIDAS?

- **QR não aparece?** → Aumentar delay para 2000ms
- **Erro de tenant?** → Verifique localStorage (DevTools)
- **API não responde?** → Reiniciar: `npm run dev` em `/apps/api`
- **Login errado?** → Usar: maria@salao.com / Maria@123

---

**SUCESSO!** 🚀🚀🚀
