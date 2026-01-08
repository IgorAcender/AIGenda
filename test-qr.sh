#!/bin/bash

# Script para testar geração de QR Code

echo "====== TESTE DE QR CODE ======"
echo ""

# Matar todos os serviços antigos
echo "1️⃣  Limpando processos antigos..."
pkill -9 -f "tsx\|next dev\|node" 2>/dev/null
sleep 3

# Iniciar containers Docker
echo "2️⃣  Verificando containers Docker..."
docker ps | grep -E "evolution|postgres|redis" | head -3

# Iniciar API
echo "3️⃣  Iniciando API..."
cd /Users/user/Desktop/Programação/AIGenda/apps/api
tsx watch src/index.ts > /tmp/api-qr-test.log 2>&1 &
API_PID=$!
echo "   API PID: $API_PID"

# Aguardar inicialização
echo "4️⃣  Aguardando inicialização (15s)..."
sleep 15

# Testar conexão
echo "5️⃣  Testando conexão..."
curl -s http://localhost:3001/version 2>/dev/null || echo "❌ API não respondendo"

# Testar endpoint
echo ""
echo "6️⃣  Testando /api/whatsapp/setup..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/whatsapp/setup \
  -H "Content-Type: application/json" \
  -d '{"tenantId":"t1"}')

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

# Limpar
echo ""
echo "7️⃣  Limpando..."
kill $API_PID 2>/dev/null
echo "✅ Teste concluído"
