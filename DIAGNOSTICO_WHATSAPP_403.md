# 🔍 Diagnóstico: Falha ao Conectar WhatsApp (HTTP 403)

## Problema Identificado

A página de WhatsApp Marketing não consegue sincronizar com a Evolution API.

**Sintomas:**
- ❌ Status permanece "Desconectado"
- ❌ Erro HTTP 403 Forbidden ao clicar em "Atualizar QR Code"
- ⚠️ Não há QR Code disponível

## 📊 Análise Técnica

### 1. **Fluxo da Aplicação** ✅ Funcionando

```
Frontend (WhatsAppMarketingPage.tsx)
  ↓
POST /api/whatsapp/setup { tenantId: "t1" }
  ↓
API recebe requisição
  ↓
AllocationService.allocateTenantToEvolution()
  ↓
findAvailableEvolutionInstance() → Encontra evolution-1 ✅
  ↓
AllocationService.generateQRCodeForTenant()
  ↓
EvolutionService.generateQRCode()
  ↓
makeHttpRequest(http://localhost:8001/instance/create) → 403 ❌
```

### 2. **O que Testamos**

✅ **Frontend:**
- Tenant ID: `t1` (correto)
- Componente de polling a cada 10s
- Calls para `/api/whatsapp/status/{tenantId}` funcionando

✅ **Backend API:**
- Status endpoint retorna: `{ success: true, isConnected: false, evolutionId: 1 }`
- Rota setup está respondendo
- Evolution Instances seeded (10 instâncias disponíveis)

✅ **Banco de Dados:**
- Tenant `t1` existe ✅
- Evolution instance 1 existe ✅
- Mapping criado ✅

✅ **Evolution API:**
- Container `agende-ai-evolution-1` está rodando
- Porta 8001 aberta
- Responde a requisições diretas com 201 Created

**Teste Direto:**
```bash
curl -X POST http://localhost:8001/instance/create \
  -H "apikey: evolution_api_key_dev" \
  -H "Content-Type: application/json" \
  -d '{"instanceName":"test","integration":"WHATSAPP-BAILEYS","qrcode":true}'

Resposta: 201 Created ✅
```

### 3. **Onde Está o Problema?**

O erro 403 está acontecendo quando a **API local chama a Evolution API**.

**Possíveis causas:**
1. **API Key incorreta nos headers** - API local enviando chave errada
2. **Timeout na conexão** - Evolution API demorando para responder
3. **Headers diferentes** - Formato diferente entre curl e código Node.js
4. **DNS resolution** - Problema ao resolver `localhost:8001`

## 🔧 Solução Proposta

### Passo 1: Adicionar Logs Detalhados ✅ (Feito)

Adicionei logs no `evolution.service.ts`:
- ```typescript
  console.log(`[HTTP Request] ${method} ${hostname}:${port}${path}`);
  console.log(`[Headers] apikey: ${apiKey}`);
  console.log(`[HTTP Response] Status: ${statusCode}`);
  console.log(`[HTTP Error] ${statusCode}: ${error}`);
  ```

### Passo 2: Testar com Logs

Reiniciar servidor e monitorar logs:
```bash
cd /Users/user/Desktop/Programação/AIGenda
pnpm dev 2>&1 | grep -E "HTTP|apikey|Error"
```

Então fazer o teste:
```bash
curl -X POST http://localhost:3001/api/whatsapp/setup \
  -H "Content-Type: application/json" \
  -d '{"tenantId":"t1"}'
```

### Passo 3: Analisar Logs

Os logs dirão exatamente:
- Qual URL está sendo chamada
- Qual API Key está sendo enviada
- Qual status HTTP a Evolution retorna
- Qual é a resposta (sucesso ou erro)

## 📝 Próximas Ações

1. **Reiniciar servidor e capturar logs**
   ```bash
   pkill -9 -f "pnpm\|tsx\|next"
   cd /Users/user/Desktop/Programação/AIGenda
   pnpm dev 2>&1 | tee /tmp/api.log &
   ```

2. **Executar teste**
   ```bash
   curl -X POST http://localhost:3001/api/whatsapp/setup \
     -H "Content-Type: application/json" \
     -d '{"tenantId":"t1"}'
   ```

3. **Analisar logs**
   ```bash
   tail -100 /tmp/api.log | grep -E "HTTP|apikey|Error"
   ```

4. **Baseado nos logs, corrigir o problema**
   - Se API Key estiver errada: ajustar env
   - Se URL estiver errada: ajustar configuração
   - Se timeout: aumentar timeout
   - Se connection refused: verificar Evolution

## 🎯 Status Atual

| Componente | Status | Observação |
|-----------|--------|-----------|
| Frontend | ✅ OK | Página carrega, faz polling |
| Backend API | ✅ OK | Endpoints respondem |
| Banco de Dados | ✅ OK | Tenant e Evolution seeded |
| Evolution Instances | ✅ OK | 10 instâncias seeded |
| Evolution API Container | ✅ OK | Container rodando |
| Sincronização | ❌ ERRO | HTTP 403 ao chamar /instance/create |

## 🔐 Debug Info

- **Tenant ID:** t1
- **Evolution ID:** 1
- **Evolution URL:** http://localhost:8001
- **API Key:** evolution_api_key_dev
- **Instância que será criada:** tenant-t1

---

**Próximo paso:** Reiniciar servidor e analisar logs com as melhorias adicionadas.
