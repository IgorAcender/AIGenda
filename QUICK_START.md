# ⚡ QUICK START - TESTE AGORA (5 MINUTOS)

## 🎯 OBJETIVO
Validar que QR Code aparece ao conectar WhatsApp

## ⏱️ TEMPO ESTIMADO
5 minutos

---

## 1️⃣ VERIFICAR API (30 segundos)

```bash
# Terminal
curl http://localhost:3001/api/health 2>/dev/null && echo "✅ OK" || echo "❌ Parada"
```

**Se disser "❌ Parada":**
```bash
cd /Users/user/Desktop/Programação/AIGenda/apps/api
npm run dev
# Aguarde 5 segundos
```

---

## 2️⃣ ABRIR LOGIN (30 segundos)

```
http://localhost:3000/login
```

---

## 3️⃣ FAZER LOGIN (1 minuto)

```
Email: maria@salao.com
Senha: Maria@123
```

**Esperado:** Vai para `/dashboard`

---

## 4️⃣ ABRIR WHATSAPP (1 minuto)

```
http://localhost:3000/marketing/whatsapp
```

**Esperado:** 
- ✅ Página abre
- ❌ SEM erro "Tenant não encontrado"

---

## 5️⃣ CONECTAR WHATSAPP (2 minutos)

1. Clique em **"Conectar WhatsApp"**
2. Veja mensagem: "Gerando QR Code..."
3. **AGUARDE 2 SEGUNDOS**
4. **QR Code deve aparecer**

**Se apareceu:** ✅ SUCESSO!

**Se não apareceu:** 
- Aguarde mais 2 segundos
- Se ainda não, aumentar delay (ver troubleshooting)

---

## 🧪 TESTE COM CELULAR (Opcional)

1. Celular com WhatsApp aberto
2. Clique em **escanear QR Code**
3. Aponte para tela
4. Confirme conexão

**Esperado:** WhatsApp conecta ✅

---

## ⚠️ TROUBLESHOOTING RÁPIDO

### ❌ "API não responde"
```bash
lsof -i :3001 | awk 'NR>1 {print $2}' | xargs kill -9
cd /Users/user/Desktop/Programação/AIGenda/apps/api
npm run dev
```

### ❌ "Tenant não encontrado"
```bash
# Abrir DevTools (F12)
# Ir em: Application > localStorage
# Verificar se existe: user, tenant, token
# Se vazio: fazer login novamente
```

### ❌ "QR Code não aparece"
```bash
# Editar: apps/api/src/lib/evolution.service.ts
# Linha ~159: setTimeout(resolve, 1000)
# Mudar para: setTimeout(resolve, 2000)
# Salvar e API reinicia automaticamente
# Tentar novamente
```

---

## ✅ SUCESSO CONFIRMADO

```
[ ] Login funciona
[ ] Dashboard abre
[ ] WhatsApp page abre SEM erro
[ ] QR Code aparece em < 2 segundos
[ ] QR Code é legível
[ ] Consegue scannear
```

Todos checkados? **✨ Parabéns!** ✨

---

## 📞 PRECISA DE AJUDA?

| Problema | Solução |
|----------|---------|
| API parada | `npm run dev` em `/apps/api` |
| Tenant não encontrado | Fazer login novamente |
| QR não aparece | Aumentar delay para 2000ms |
| Erro na web | Reiniciar: `pnpm dev` |

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Testar QR Code
2. ✅ Testar scan com celular
3. ✅ Testar envio de mensagens
4. ✅ Deploy em produção

---

**Boa sorte! 🎯**
