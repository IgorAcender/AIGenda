# ✅ Sincronização de Status WhatsApp Evolution - RESOLVIDO

## 🎯 Problema Identificado

O app mostrava "Desconectado" mesmo com a Evolution conectada porque:

1. **Webhooks não estavam configurados** na Evolution API
2. A tabela `tenantEvolutionMapping` nunca era atualizada quando WhatsApp conectava
3. O frontend apenas lia do banco de dados (sem sincronizar com Evolution API em tempo real)

## ✅ Solução Implementada

### 1. Configuração de Webhooks na Evolution API

```bash
# Endpoint: POST /webhook/set/{instanceName}
# Eventos válidos: CONNECTION_UPDATE, QRCODE_UPDATED, MESSAGES_UPSERT, etc.

curl -X POST "http://localhost:8001/webhook/set/tenant-t1" \
  -H "apikey: evolution_api_key_dev" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook": {
      "url": "http://localhost:3001/api/whatsapp/webhooks/evolution/connected",
      "enabled": true,
      "events": ["CONNECTION_UPDATE"]
    }
  }'
```

### 2. Melhorias no Webhook Handler

**Arquivo**: `/apps/api/src/routes/whatsapp.ts`

- ✅ Processamento correto do payload da Evolution API v2.2.3
- ✅ Extração de `state` ("open" = conectado, "close" = desconectado)
- ✅ Extração de `phoneNumber` do tensor de dados
- ✅ Chamada de `handleTenantConnected()` quando `state === "open"`
- ✅ Chamada de `handleTenantDisconnected()` quando `state === "close"`
- ✅ Logs detalhados para debug

### 3. Fluxo Completo de Sincronização

```
Usuario scanneia QR Code
          ↓
WhatsApp Web se conecta à Evolution #1
          ↓
Evolution dispara webhook CONNECTION_UPDATE
          ↓
POST /api/whatsapp/webhooks/evolution/connected
          ↓
handleTenantConnected(tenantId, phoneNumber)
          ↓
UPDATE tenantEvolutionMapping SET isConnected = true, whatsappPhoneNumber = ...
          ↓
GET /api/whatsapp/status/tenantId retorna isConnected: true
          ↓
Frontend polling a cada 10s detecta mudança
          ↓
UI muda de "Desconectado" 🔴 para "Conectado" 🟢
```

## 🧪 Como Testar

### Teste 1: Webhook Manual
```bash
curl -X POST "http://localhost:3001/api/whatsapp/webhooks/evolution/connected" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "CONNECTION_UPDATE",
    "instance": "tenant-t1",
    "data": {
      "instanceName": "tenant-t1",
      "state": "open",
      "phoneNumber": "5511999999999"
    }
  }'
```

Resposta esperada:
```json
{
  "success": true,
  "message": "Tenant t1 conectado com sucesso"
}
```

### Teste 2: Verificar Status Atualizado
```bash
curl http://localhost:3001/api/whatsapp/status/t1 | json_pp
```

Resposta esperada:
```json
{
  "success": true,
  "isConnected": true,
  "evolutionId": 1,
  "whatsappPhone": "5511999999999",
  "connectedAt": "2026-01-08T17:06:32.365Z"
}
```

### Teste 3: Frontend Atualizado

1. Abra o app em `http://localhost:3000/marketing/whatsapp`
2. Procure pelo card "WhatsApp Marketing"
3. Você verá um indicador:
   - 🟢 **Conectado** (verde) - quando `isConnected = true`
   - 🔴 **Desconectado** (vermelho) - quando `isConnected = false`
4. O status é atualizado a cada 10 segundos automaticamente

## 📋 Checklist de Implementação

- [x] Webhook handler implementado em `/api/whatsapp/webhooks/evolution/connected`
- [x] Processamento correto do payload da Evolution API v2.2.3
- [x] Diferenciação entre `state === "open"` (conectado) e `state === "close"` (desconectado)
- [x] Atualização correta do banco de dados (`tenantEvolutionMapping`)
- [x] Endpoint GET `/api/whatsapp/status/:tenantId` retorna status correto
- [x] Frontend faz polling a cada 10 segundos
- [x] UI mostra "Conectado" 🟢 quando `isConnected = true`
- [x] Logs detalhados para debug

## 🔧 Próximos Passos (Opcional)

### Para Production:

1. **Certificado SSL**:
   - Evolution API enviará webhooks para `https://seu-dominio.com/api/whatsapp/...`
   - Configure SSL/TLS na app ou use reverse proxy (nginx)

2. **Validação de Webhook**:
   - Adicione header authentication (`X-Evolution-Signature`)
   - Verifique timestamp para evitar replay attacks

3. **Retry Mechanism**:
   - Se webhook falhar, Evolution API tentará novamente
   - Configure timeout apropriado

4. **Monitoramento**:
   - Monitore logs de webhook falhos
   - Setup alertas para desconexões não esperadas

5. **Configuração em Todas as Instâncias**:
   - Repita webhook setup para Evolution 2 e 3
   - Ou use endpoint genérico que redireciona

## 📊 Estrutura de Dados

### TenantEvolutionMapping (após webhook)
```javascript
{
  tenantId: "t1",
  evolutionInstanceId: 1,
  isConnected: true,           // ← Atualizado pelo webhook
  whatsappPhoneNumber: "5511999999999",  // ← Extraído do webhook
  connectedAt: "2026-01-08T17:06:32.365Z",  // ← Timestamp da conexão
  disconnectedAt: null,
  lastQRCodeGeneratedAt: "2026-01-08T16:45:00.000Z"
}
```

## 🐛 Debug

Se o status não atualizar:

1. **Verifique logs da API**:
   ```bash
   docker logs api | grep -i webhook
   ```

2. **Confira webhook foi configurado**:
   ```bash
   curl http://localhost:8001/webhook/{instanceName} \
     -H "apikey: evolution_api_key_dev"
   ```

3. **Teste webhook manualmente**:
   ```bash
   curl -X POST "http://localhost:3001/api/whatsapp/webhooks/evolution/connected" \
     -H "Content-Type: application/json" \
     -d '{"instance": "tenant-t1", "data": {"state": "open"}}'
   ```

4. **Verifique banco de dados**:
   ```bash
   psql -h localhost -U evolution_user -d evolution_main -c \
     "SELECT * FROM TenantEvolutionMapping WHERE tenantId = 't1';"
   ```

## ✨ Benefícios

✅ Status sincronizado em tempo real
✅ Webhook automático quando conecta/desconecta
✅ UI reflete estado real da Evolution
✅ Melhor UX com feedback visual
✅ Logs detalhados para troubleshooting

## 🎉 Resultado Final

Agora quando você conectar o WhatsApp via QR Code:

1. Evolution dispara webhook `CONNECTION_UPDATE` com `state: "open"`
2. API recebe webhook e atualiza banco de dados
3. Frontend faz polling e detecta mudança
4. UI muda instantaneamente para 🟢 "Conectado"

Sem necessidade de refresh manual! 🚀
