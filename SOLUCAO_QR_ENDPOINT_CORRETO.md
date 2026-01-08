# 🎯 SOLUÇÃO: QR Code WhatsApp - Endpoint Correto Encontrado

## 🔍 DESCOBERTA IMPORTANTE

Analisando seu outro projeto **Rifas** (Django), descobri que você usa o endpoint **correto**:

### ❌ ERRADO (O que tínhamos):
```typescript
/instance/fetchInstances?instanceName=...  // ← NÃO FUNCIONA!
```

### ✅ CORRETO (Do seu projeto Rifas):
```python
url = f"{settings.EVOLUTION_API_URL}/instance/connect/{settings.EVOLUTION_INSTANCE_NAME}"
```

Em TypeScript:
```typescript
`${evolutionUrl}/instance/connect/${instanceName}`  // ← CORRETO!
```

## 🛠️ SOLUÇÃO IMPLEMENTADA

Alterei `apps/api/src/lib/evolution.service.ts`:

```typescript
async generateQRCode(evolutionId: number, tenantId: string) {
  const instanceName = `tenant-${tenantId}`;
  
  // 1️⃣ Cria a instância
  await this.makeHttpRequest(
    `${evolutionUrl}/instance/create`,
    { instanceName, integration: 'WHATSAPP-BAILEYS', qrcode: true }
  );

  // 2️⃣ Aguarda 1 segundo
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 3️⃣ Obtém o QR Code usando o endpoint CORRETO
  const qrData = await this.makeHttpRequest(
    `${evolutionUrl}/instance/connect/${instanceName}`,
    null,
    'GET'  // ← GET, não POST!
  );

  // 4️⃣ Retorna o QR code em base64
  if (qrData && (qrData.base64 || qrData.qr)) {
    return {
      success: true,
      base64: qrData.base64 || qrData.qr,
      code: qrData.code || instanceName,
      message: 'QR Code gerado com sucesso'
    };
  }
}
```

## 📊 FLUXO CORRETO

```
POST /api/whatsapp/setup { tenantId }
         ↓
POST ${evolutionUrl}/instance/create
    { instanceName, integration: 'WHATSAPP-BAILEYS', qrcode: true }
         ↓
⏳ Aguarda 1 segundo
         ↓
GET ${evolutionUrl}/instance/connect/${instanceName}  ← CORRETO!
         ↓
Evolution retorna: { base64: "data:image/png;base64,..." }
         ↓
Frontend exibe QR Code!
```

## 🧪 COMO TESTAR

1. Reinicia API: `pnpm dev` em `/apps/api`
2. Va em http://localhost:3000/marketing/whatsapp
3. Clique em "Conectar WhatsApp"
4. **ESPERADO:** QR Code aparece em < 2 segundos

## ✨ PONTOS-CHAVE

| Aspecto | Valor |
|---------|-------|
| **Endpoint correto** | `/instance/connect/{name}` |
| **Método HTTP** | GET (não POST!) |
| **Delay antes de pedir QR** | 1 segundo |
| **Campo com QR code** | `base64` ou `qr` |
| **Formato esperado** | `data:image/png;base64,...` |

## 🔗 DIFERENÇAS COM RIFAS

Seu projeto **rifas** usa:
```python
# Django - Simples e direto
url = f"{EVOLUTION_API_URL}/instance/connect/{INSTANCE_NAME}"
response = requests.get(url, headers={'apikey': API_KEY})
data = response.json()  # { base64: "...", code: "..." }
```

Agora **AIGenda** faz a mesma coisa:
```typescript
// TypeScript - HTTP nativo
const url = `${evolutionUrl}/instance/connect/${instanceName}`;
const qrData = await makeHttpRequest(url, null, 'GET');
// { base64: "...", code: "..." }
```

## ⚠️ SE AINDA NÃO FUNCIONAR

1. **Aumentar delay de 1 para 2 segundos:**
   ```typescript
   await new Promise(resolve => setTimeout(resolve, 2000));
   ```

2. **Checar logs da API** para ver exatamente o que Evolution retorna:
   ```bash
   # Terminal da API
   # Procure por: "📊 Resposta QR Data:"
   ```

3. **Testar manualmente:**
   ```bash
   curl -H "apikey: YOUR_KEY" \
     "http://localhost:3000/instance/connect/tenant-cmk5k5iur0000mu98ev59y5t0"
   ```

## 🎉 RESULTADO ESPERADO

Agora que temos o endpoint correto:
- ✅ QR Code aparece imediatamente (< 2 segundos)
- ✅ Funciona na primeira tentativa
- ✅ Sincronizado com seu código do Rifas
- ✅ Sem mais "erro desconhecido"

**Crédito:** Descoberta baseada no código de trabalho do seu projeto **Rifas**! 🚀
