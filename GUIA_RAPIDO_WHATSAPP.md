# ⚡ GUIA RÁPIDO - WHATSAPP MARKETING

## 🎯 ACESSO IMEDIATO:

```
http://localhost:3000/whatsapp-marketing
```

**OU**

```
http://localhost:3000/login
Email: test@example.com
Senha: password123
Depois: http://localhost:3000/marketing/whatsapp
```

---

## 🔧 SE NÃO CARREGAR:

### 1. Verifique se os servidores estão rodando:

```bash
# Terminal 1: Frontend
cd /Users/user/Desktop/Programação/AIGenda
pnpm dev

# Espere até ver: "▲ Next.js X.X"
```

```bash
# Terminal 2: API (já deve estar rodando)
# Verifique na porta 3001
curl http://localhost:3001/api/whatsapp/health
```

### 2. Se ainda não funcionar:

```bash
# Matar processos presos
pkill -f "next dev"
pkill -f "tsx watch"
pkill -f "fastify"
sleep 2

# Reiniciar
pnpm dev
```

### 3. Limpar cache do browser:

- Abra http://localhost:3000/whatsapp-marketing
- Pressione: **Ctrl+Shift+R** (ou Cmd+Shift+R no Mac)
- Abra console (F12) e procure por erros

---

## ✅ O QUE VOCÊ DEVE VER:

```
┌─────────────────────────────────────────┐
│     WhatsApp Marketing Integration      │
│                                         │
│  Status: 🔴 Desconectado                │
│                                         │
│  [Conectar WhatsApp] [Atualizar QR]    │
│  [Desconectar] [Verificar Status]      │
│                                         │
│  Evolution Instances                    │
│  ┌─────────────────────────────────────┐
│  │ Evolution Server 1    ████░░░░░ 45% │
│  │ Evolution Server 2    ██████░░░░ 62%│
│  │ Evolution Server 3    ███░░░░░░░ 38%│
│  │ ... (total 10)                      │
│  └─────────────────────────────────────┘
│                                         │
│  How It Works:                          │
│  1. Clique em Conectar WhatsApp        │
│  2. Escaneie o QR Code                 │
│  3. Confirme no seu telefone           │
│  4. Status muda para Conectado         │
│  5. Pronto para usar!                  │
│                                         │
│  Benefits:                              │
│  ✨ Automação, 💬 Tempo Real, etc      │
└─────────────────────────────────────────┘
```

---

## 🧪 TESTES RÁPIDOS:

### Teste 1: API está respondendo?
```bash
curl http://localhost:3001/api/whatsapp/health
```
**Deve retornar:** `{"success":true,"status":"online","message":"API WhatsApp funcionando","mode":"mock"}`

### Teste 2: Frontend está servindo?
```bash
curl http://localhost:3000/whatsapp-marketing | head -20
```
**Deve retornar:** HTML com `<title>WhatsApp - Marketing</title>`

### Teste 3: Login funciona?
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
**Deve retornar:** Token JWT

---

## 📱 FUNCIONALIDADES PARA TESTAR:

- [ ] Página carrega
- [ ] Vê status "Desconectado"
- [ ] Clica "Conectar WhatsApp"
- [ ] Modal abre com QR Code
- [ ] Clica "Atualizar QR"
- [ ] Clica "Desconectar"
- [ ] Status muda para "Conectado" (simulado)
- [ ] Vê lista de 10 instâncias
- [ ] Vê percentual de ocupação
- [ ] Seção "How It Works" aparece
- [ ] Grid de "Benefits" aparece
- [ ] Toast notification em ações
- [ ] Polling automático a cada 5s

---

## 🆘 ERROS COMUNS:

### "Página em branco com 404"
- [ ] Servidor web parou
- [ ] Caminho URL errado
- [ ] Solução: `pnpm dev`

### "Página com erro vermelho"
- [ ] Erro no componente
- [ ] Abra console (F12) para ver detalhes
- [ ] Solução: Verifique arquivo page.tsx

### "API retorna 401"
- [ ] Falta token JWT
- [ ] Solução: Use rota pública `/whatsapp-marketing`

### "Instâncias não carregam"
- [ ] API não respondendo
- [ ] Solução: `curl http://localhost:3001/api/whatsapp/instances`

### "Polling não atualiza"
- [ ] Normal! É simulado
- [ ] Clique em "Verificar Status" para forçar

---

## 🔐 LOGIN (se quiser usar com autenticação):

```
Email: test@example.com
Senha: password123
```

Depois acesse: `http://localhost:3000/marketing/whatsapp`

---

## 📊 PORTS:

- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001
- **PostgreSQL:** localhost:5432 (não precisa para teste)

---

## 🚀 ESTÁ TUDO OK?

Se tudo está funcionando:
✅ Página carrega
✅ Vê componentes
✅ Clica em botões
✅ Vê toasts

**PARABÉNS! 🎉 Tudo está pronto!**

---

*Questões? Veja os logs do terminal ou abra F12 no browser.*
