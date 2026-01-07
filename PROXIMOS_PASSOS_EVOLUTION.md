# 🚀 Próximos Passos - Evolution API

## ⚡ Ação Imediata (Hoje)

### 1. Atualizar Banco de Dados
```bash
cd /Users/user/Desktop/Programação/AIGenda/apps/api

# Aplicar schema Prisma (cria tabelas EvolutionInstance e TenantEvolutionMapping)
pnpm db:push

# Criar as 10 Evolution instances no banco de dados
pnpm db:seed
```

**Resultado esperado:**
```
✅ Evolution instance "evolution-1" criada
✅ Evolution instance "evolution-2" criada
... (até evolution-10)
✨ Evolution instances inicializadas! Capacidade: 1.000 tenants
```

### 2. Verificar Erros de Tipos TypeScript
Os serviços foram criados mas o Prisma ainda não gerou os tipos. Isso é normal.
Após executar `pnpm db:push`, o Prisma gerará os tipos automaticamente.

```bash
# Gerar tipos do Prisma manualmente se necessário
pnpm prisma generate
```

---

## 🧪 Testes Locais (Hoje à Noite)

### 1. Iniciar Ambiente Docker
```bash
cd /Users/user/Desktop/Programação/AIGenda

# Iniciar todos os serviços (web, api, 3 Evolutions, bancos de dados)
docker-compose -f docker-compose.dev.yml up -d

# Aguardar 30 segundos para todos os serviços inicializarem
sleep 30

# Verificar status
docker-compose -f docker-compose.dev.yml ps
```

**Esperado:**
```
✅ web (frontend) - running
✅ api (backend) - running
✅ postgres-app - running
✅ redis-app - running
✅ postgres-evolution - running
✅ redis-evolution - running
✅ evolution-1 - running
✅ evolution-2 - running
✅ evolution-3 - running
```

### 2. Testar Health Check
```bash
# API está rodando?
curl http://localhost:3001/health

# Esperado:
# {"status":"ok","timestamp":"2024-01-15T10:30:00.000Z","redis":"connected"}
```

### 3. Testar Endpoints de Evolution
```bash
# Ver todas as 10 Evolution instances (inicialmente 3 no dev)
curl http://localhost:3001/api/whatsapp/instances

# Esperado:
# {
#   "success": true,
#   "instances": [
#     {"id": 1, "name": "evolution-1", "url": "http://localhost:8001", "tenantCount": 0, "isActive": true, "occupancyPercent": 0},
#     ... (3 total no dev)
#   ]
# }

# Health check das Evolutions
curl http://localhost:3001/api/whatsapp/health

# Esperado:
# {
#   "success": true,
#   "instances": [
#     {"id": 1, "healthy": true},
#     {"id": 2, "healthy": true},
#     {"id": 3, "healthy": true}
#   ]
# }
```

### 4. Testar Setup de Novo Tenant
```bash
# Conectar um tenant teste
curl -X POST http://localhost:3001/api/whatsapp/setup \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "tenant-teste-001"}'

# Esperado:
# {
#   "success": true,
#   "qr": "iVBORw0KGgoAAAANSUhEUgAAA...",
#   "code": "unique-code-here",
#   "base64": "data:image/png;base64,iVBORw0KG...",
#   "evolutionId": 1,
#   "message": "QR Code gerado com sucesso. Escaneie com seu WhatsApp."
# }
```

**Se funcionar:** 🎉 Backend está 100% funcional!

---

## 📱 Integração Frontend (Próximos 2 dias)

### 1. Criar Página de Conexão WhatsApp
Local: `/apps/web/src/pages/dashboard/whatsapp.tsx`

```typescript
// Exemplo básico:
const [qrCode, setQrCode] = useState<string | null>(null)
const [isConnected, setIsConnected] = useState(false)
const [isLoading, setIsLoading] = useState(false)

const handleConnectWhatsApp = async () => {
  setIsLoading(true)
  try {
    const res = await fetch('/api/whatsapp/setup', {
      method: 'POST',
      body: JSON.stringify({ tenantId: tenant.id })
    })
    const data = await res.json()
    if (data.success) {
      setQrCode(data.base64) // Mostrar QR Code
    }
  } finally {
    setIsLoading(false)
  }
}

// Renderizar:
// <img src={qrCode} alt="QR Code" />
```

### 2. Adicionar Polling para Status
```typescript
// A cada 5 segundos, verificar se WhatsApp conectou
useEffect(() => {
  const interval = setInterval(async () => {
    const res = await fetch(`/api/whatsapp/status/${tenant.id}`)
    const data = await res.json()
    if (data.isConnected) {
      setIsConnected(true)
      setQrCode(null)
      clearInterval(interval)
    }
  }, 5000)
  
  return () => clearInterval(interval)
}, [])
```

### 3. Botão de Desconectar
```typescript
const handleDisconnect = async () => {
  await fetch('/api/whatsapp/disconnect', {
    method: 'POST',
    body: JSON.stringify({ tenantId: tenant.id })
  })
  setIsConnected(false)
}
```

---

## 🔄 Integração com Sistema de Agendamentos (Próximos 3-5 dias)

### 1. Enviar Confirmação via WhatsApp
Quando agendamento é criado:

```typescript
// Em: /apps/api/src/routes/appointments.ts
const appointmentCreated = await prisma.appointment.create({...})

// Enviar mensagem WhatsApp
await fetch('/api/whatsapp/send-message', {
  method: 'POST',
  body: JSON.stringify({
    tenantId: appointment.tenantId,
    phoneNumber: client.whatsapp,
    message: `Seu agendamento foi confirmado para ${appointment.date} às ${appointment.time}`
  })
})
```

### 2. Enviar Lembretes
Implementar cron job para enviar lembretes:

```typescript
// Todos os dias às 9:00 AM
schedule.cron('0 9 * * *', async () => {
  // Buscar agendamentos para hoje
  const appointments = await prisma.appointment.findMany({
    where: {
      date: today(),
      status: 'confirmed'
    },
    include: { tenant: true, client: true }
  })
  
  // Enviar WhatsApp para cada um
  for (const apt of appointments) {
    await sendWhatsAppMessage(
      apt.tenantId,
      apt.client.whatsapp,
      `Lembrete: Seu agendamento é hoje às ${apt.time}`
    )
  }
})
```

---

## 🛠️ Configuração EasyPanel (Para Produção)

### 1. Adicionar Variáveis de Ambiente
No painel do EasyPanel:
- Ir em: Aplicações → Seu App → Variáveis de Ambiente
- Adicionar:
  ```
  EVOLUTION_API_KEY=sua-chave-aqui
  EVOLUTION_1_URL=http://evolution-1:8001
  EVOLUTION_2_URL=http://evolution-2:8002
  ... (até 10)
  ```

### 2. Atualizar docker-compose.prod.yml
Copiar `/docker-compose.prod.yml` para seu servidor de produção

### 3. Deploy
```bash
# No servidor de produção
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Verificar Webhooks
Evolution API deve enviar webhooks para:
```
https://seu-dominio.com/api/webhooks/evolution/connected
https://seu-dominio.com/api/webhooks/evolution/disconnected
https://seu-dominio.com/api/webhooks/evolution/messages
```

Configure isso na dashboard da Evolution API

---

## 📊 Monitorar em Tempo Real

### Logs da API
```bash
docker logs agende-ai-api -f
```

### Logs da Evolution 1
```bash
docker logs evolution-1 -f
```

### Database
```bash
# Conectar ao banco e verificar Evolution instances
psql postgresql://user:password@localhost:5432/agende_ai_app

# SQL:
SELECT * FROM "EvolutionInstance";
SELECT * FROM "TenantEvolutionMapping";
```

---

## 🎯 Checklist de Execução

### Hoje (Preparação)
- [ ] `pnpm db:push` executado com sucesso
- [ ] `pnpm db:seed` criou as 10 Evolution instances
- [ ] `docker-compose -f docker-compose.dev.yml up -d` funcionando
- [ ] `curl http://localhost:3001/health` retorna OK
- [ ] `curl http://localhost:3001/api/whatsapp/health` retorna OK

### Amanhã (Testes)
- [ ] `POST /api/whatsapp/setup` gera QR Code
- [ ] QR Code é escaneável (se tiver Evolution real)
- [ ] Status endpoint retorna dados corretos
- [ ] Webhook de conexão processa corretamente

### Próximos 2 Dias (Frontend)
- [ ] Página de WhatsApp criada
- [ ] QR Code renderiza
- [ ] Polling de status funciona
- [ ] Botão desconectar funciona

### Próxima Semana (Integração)
- [ ] Agendamentos enviam mensagem WhatsApp
- [ ] Lembretes funcionam
- [ ] Webhook de mensagens processa corretamente
- [ ] Dashboard mostra status de WhatsApp

---

## 🆘 Problemas Comuns

### "tenantEvolutionMapping não existe"
**Causa:** Prisma não gerou tipos
**Solução:**
```bash
pnpm prisma generate
```

### "Evolution retorna erro 401"
**Causa:** EVOLUTION_API_KEY incorreta
**Solução:**
1. Verificar chave em variáveis de ambiente
2. Regenerar chave na dashboard da Evolution

### "QR Code não aparece"
**Causa:** Evolution não consegue gerar QR
**Solução:**
```bash
# Verificar se Evolution está rodando
docker logs evolution-1

# Testar conectividade
curl http://localhost:8001/health
```

### "Webhook não é chamado"
**Causa:** URL do webhook incorreta na Evolution
**Solução:**
1. Ir em Evolution API Dashboard
2. Configurar webhook URL:
   - Dev: `http://localhost:3001/api/webhooks/evolution/connected`
   - Prod: `https://seu-dominio.com/api/webhooks/evolution/connected`

---

## 📞 Suporte

- 📖 **Documentação:** `GUIA_EVOLUTION_API.md`
- ✅ **Checklist:** `CHECKLIST_EVOLUTION_IMPLEMENTATION.md`
- 📝 **Resumo:** `RESUMO_EVOLUTION_IMPLEMENTATION.md`
- 🔗 **API Docs:** https://evolution.api.docs

---

**Você está pronto para começar! Boa sorte!** 🚀
