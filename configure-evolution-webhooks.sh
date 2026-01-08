#!/bin/bash

# =============================================================================
# Setup Evolution Webhooks - Automático
# Configura webhooks para sincronizar status em tempo real
# =============================================================================

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}🚀 Configurando Webhooks Evolution${NC}"
echo -e "${BLUE}================================${NC}\n"

# Config
API_KEY="${EVOLUTION_API_KEY:-evolution_api_key_dev}"
WEBHOOK_BASE="http://localhost:3001/api/whatsapp/webhooks/evolution"
INSTANCES=(
  "http://localhost:8001:t1"
  "http://localhost:8002:t2"
  "http://localhost:8003:t3"
)
TENANT_IDS=("t1" "t2" "t3")

echo -e "${YELLOW}Configurações:${NC}"
echo "  API Key: ${API_KEY:0:20}..."
echo "  Webhook Base: $WEBHOOK_BASE"
echo "  Instâncias: ${#INSTANCES[@]}"
echo ""

# Função para configurar webhook
configure_webhook() {
  local api_url=$1
  local tenant_id=$2
  local event_name=$3
  local webhook_url="${WEBHOOK_BASE}/connected"

  echo -e "${BLUE}→ Tenant ${tenant_id} no Evolution${NC}"
  echo "  URL: $api_url"
  echo "  Event: $event_name"
  echo "  Webhook: $webhook_url"

  # Enviar requisição
  response=$(curl -s -X POST "${api_url}/webhook/set/tenant-${tenant_id}" \
    -H "apikey: ${API_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"webhook\": {\"url\": \"${webhook_url}\", \"enabled\": true, \"events\": [\"CONNECTION_UPDATE\"]}}" 2>&1)

  # Verificar resposta
  if echo "$response" | grep -q "\"enabled\":true"; then
    echo -e "  ${GREEN}✅ Configurado com sucesso${NC}\n"
    return 0
  else
    echo -e "  ${YELLOW}⚠️ Resposta:${NC} $response\n"
    return 1
  fi
}

# Configurar para cada tenant
idx=0
for instance_url in "${INSTANCES[@]}"; do
  api_url=$(echo $instance_url | cut -d: -f1-3)
  tenant_id=$(echo $instance_url | cut -d: -f4)

  # Verificar se está online
  if ! curl -s "$api_url/" -H "apikey: $API_KEY" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Evolution em ${api_url} offline. Pulando...${NC}\n"
    continue
  fi

  configure_webhook "$api_url" "$tenant_id" "CONNECTION_UPDATE" || true
done

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ Setup de webhooks concluído${NC}"
echo -e "${GREEN}================================${NC}\n"

echo -e "${YELLOW}Próximos passos:${NC}"
echo "1. Teste o webhook:"
echo "   curl -X POST http://localhost:3001/api/whatsapp/webhooks/evolution/connected \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"instance\":\"tenant-t1\",\"data\":{\"state\":\"open\"}}'"
echo ""
echo "2. Verifique o status:"
echo "   curl http://localhost:3001/api/whatsapp/status/t1"
echo ""
echo "3. Escaneie o QR Code novamente para testar webhook real"
echo ""
