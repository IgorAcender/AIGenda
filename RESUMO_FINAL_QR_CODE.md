# ✅ RESUMO: Solução QR Code WhatsApp

## 🎯 PROBLEMA ORIGINAL
- ❌ QR Code não aparecia ao clicar "Conectar WhatsApp"
- ❌ Erro "Tenant não encontrado"  
- ❌ Segunda tentativa dava erro

## 🔍 ROOT CAUSE ENCONTRADO
Analisando seu projeto **Rifas** (Django), descobri que você usava o endpoint **correto**:

```python
# Rifas (CORRETO)
url = f"{API_URL}/instance/connect/{instance_name}"
response = requests.get(url, headers={'apikey': API_KEY})
```

Mas AIGenda tentava:
```typescript
// AIGenda (ERRADO)
url = `${evolutionUrl}/instance/fetchInstances?instanceName=${name}`
```

## ✅ SOLUÇÃO IMPLEMENTADA

### 1. Arquivo: `apps/api/src/lib/evolution.service.ts`

#### Função `generateQRCode()` atualizada:
```typescript
async generateQRCode(evolutionId, tenantId) {
  const instanceName = `tenant-${tenantId}`;
  
  // 1. Cria instância
  await makeHttpRequest(
    `${evolutionUrl}/instance/create`,
    { instanceName, integration: 'WHATSAPP-BAILEYS', qrcode: true }
  );

  // 2. Aguarda 1 segundo
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 3. Obtém QR via endpoint CORRETO ✅
  const qrData = await makeHttpRequest(
    `${evolutionUrl}/instance/connect/${instanceName}`,  // ← CORRETO!
    null,
    'GET'  // ← GET, não POST!
  );

  // 4. Retorna base64
  if (qrData?.base64) {
    return {
      success: true,
      base64: qrData.base64,
      code: qrData.code,
      message: 'QR Code gerado'
    };
  }
}
```

#### Função `makeHttpRequest()` corrigida:
- ✅ Suporta GET e POST
- ✅ Content-Length apenas para POST
- ✅ Headers corretos para ambos

### 2. Arquivo: `apps/web/src/stores/auth.ts`

Adicionado salvamento no localStorage:
```typescript
localStorage.setItem('user', JSON.stringify(user))
localStorage.setItem('tenant', JSON.stringify(tenant))
```

## 📊 FLUXO FINAL

```
1. Clica "Conectar WhatsApp"
        ↓
2. POST /api/whatsapp/setup { tenantId }
        ↓
3. API: POST /instance/create
        ↓
4. API: ⏳ Aguarda 1 segundo
        ↓
5. API: GET /instance/connect/{name}  ← NOVO!
        ↓
6. Evolution retorna: { base64: "data:image/png;base64,..." }
        ↓
7. Frontend exibe QR Code em modal
```

## 🧪 COMO TESTAR

```bash
# 1. Terminal 1: Iniciar API
cd /Users/user/Desktop/Programação/AIGenda/apps/api
npm run dev

# 2. Terminal 2: Aguardar 5 segundos
sleep 5

# 3. Testar endpoint manualmente
curl -X POST http://localhost:3001/api/whatsapp/setup \
  -H 'Content-Type: application/json' \
  -d '{"tenantId":"cmk5k5iur0000mu98ev59y5t0"}'

# 4. Esperado: Resposta com base64 do QR code
# {
#   "success": true,
#   "base64": "data:image/png;base64,iVBORw0KGgo...",
#   "code": "tenant-cmk5k5iur0000mu98ev59y5t0",
#   "message": "QR Code gerado com sucesso"
# }
```

## 🔗 ARQUIVO MODIFICADO ORIGINAL
- `apps/web/src/stores/auth.ts` → Adicionado localStorage
- `apps/api/src/lib/evolution.service.ts` → Adicionado GET para QR

## 📈 DIFERENÇAS

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Endpoint QR** | `/instance/fetchInstances` | `/instance/connect/{name}` ✅ |
| **Método** | POST | GET ✅ |
| **Delay** | Nenhum | 1 segundo ✅ |
| **Sucesso** | ❌ Nunca retornava QR | ✅ Retorna base64 |

## ⚡ RESULTADO ESPERADO

- ✅ QR Code aparece em < 2 segundos
- ✅ Funciona na primeira tentativa
- ✅ Sem mais travamentos
- ✅ Sincronizado com código do Rifas

## 🎯 PRÓXIMAS AÇÕES

1. **Reiniciar API** (já feito em background)
2. **Abrir** http://localhost:3000/marketing/whatsapp
3. **Clicar em** "Conectar WhatsApp"
4. **Validar** se QR Code aparece

## 💡 APRENDIZADO

Seu outro projeto **Rifas** foi a chave! A integ evolution API:

- Django: `requests.get()` + `/instance/connect/`
- TypeScript: `http.request()` + `/instance/connect/`

Ambos agora em sintonia! 🎉
