#!/bin/bash
set -e

echo "========================================"
echo "🚀 TESTE DE GERAÇÃO DE QR CODE"
echo "========================================"
echo ""

# 1. Limpar
echo "1️⃣  Limpando processos antigos..."
pkill -9 -f "tsx\|next" 2>/dev/null || true
sleep 2

# 2. Verificar Docker
echo "2️⃣  Verificando Docker..."
docker ps --filter "label=com.docker.compose.project=agende-ai" --format "table {{.Names}}\t{{.Status}}" | head -5 || echo "❌ Docker não disponível"

# 3. Iniciar API
echo ""
echo "3️⃣  Iniciando API em background..."
cd /Users/user/Desktop/Programação/AIGenda/apps/api
nohup tsx watch src/index.ts > /tmp/api.log 2>&1 &
API_PID=$!
echo "   ➜ PID: $API_PID"

# 4. Aguardar inicialização
echo ""
echo "4️⃣  Aguardando inicialização (20 segundos)..."
for i in {1..20}; do
  if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "   ✅ API respondendo!"
    break
  fi
  echo -n "."
  sleep 1
done
echo ""

# 5. Testar endpoint
echo ""
echo "5️⃣  Testando /api/whatsapp/setup..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/whatsapp/setup \
  -H "Content-Type: application/json" \
  -d '{"tenantId":"t1"}')

echo ""
echo "Resposta:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

# 6. Análise
echo ""
echo "6️⃣  Análise:"
if echo "$RESPONSE" | grep -q "success"; then
  if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ QR Code gerado com sucesso!"
  else
    echo "⚠️  Erro na resposta (success=false)"
  fi
else
  echo "❌ Falha ao gerar QR Code"
fi

# 7. Limpar
echo ""
echo "7️⃣  Limpando..."
kill $API_PID 2>/dev/null || true
echo "✅ Teste finalizado"
