#!/bin/bash

# =============================================================================
# Setup Evolution API Webhooks
# Configura as URLs de webhook para sincronizar com a app
# =============================================================================

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}🚀 Configurando Webhooks da Evolution${NC}"
echo -e "${BLUE}================================${NC}\n"

# Configurações
API_KEY="seu-api-key-aqui"  # Será substituído por variável de ambiente se existir
WEBHOOK_BASE_URL="http://localhost:3001/api/whatsapp/webhooks"
EVOLUTION_INSTANCES=("http://localhost:8001" "http://localhost:8002" "http://localhost:8003")
TENANT_ID="t1"  # Mude conforme necessário

# Se houver API_KEY em variável de ambiente
if [ -n "$EVOLUTION_API_KEY" ]; then
  API_KEY="$EVOLUTION_API_KEY"
fi

echo -e "${YELLOW}Configurações:${NC}"
echo "  API Key: ${API_KEY:0:10}..."
echo "  Webhook Base URL: $WEBHOOK_BASE_URL"
echo "  Tenant ID: $TENANT_ID"
echo ""

# Função para configurar webhook em uma instância
setup_webhook_for_instance() {
  local instance_url=$1
  local instance_name="tenant-${TENANT_ID}"
  
  echo -e "${BLUE}→ Configurando webhook para: ${instance_name}${NC}"
  echo "  Evolution: $instance_url"
  
  # Payload do webhook
  local webhook_payload=$(cat <<EOF
{
  "url": "${WEBHOOK_BASE_URL}/evolution/connected",
  "enabled": true,
  "events": ["connection.open"],
  "webhook_by_events": false
}
EOF
)

  echo -e "  ${YELLOW}Payload:${NC}"
  echo "$webhook_payload" | sed 's/^/    /'
  
  # Enviar requisição
  echo -e "  ${YELLOW}Enviando...${NC}"
  
  response=$(curl -s -X PUT \
    "${instance_url}/webhook/set/${instance_name}" \
    -H "Content-Type: application/json" \
    -H "apikey: ${API_KEY}" \
    -d "$webhook_payload" 2>&1)
  
  echo -e "  ${YELLOW}Resposta:${NC}"
  echo "$response" | sed 's/^/    /'
  
  # Verificar se foi bem-sucedido
  if echo "$response" | grep -q "success.*true\|\"status\":\"ok\""; then
    echo -e "  ${GREEN}✅ Webhook configurado com sucesso${NC}\n"
    return 0
  else
    echo -e "  ${RED}⚠️  Possível erro na resposta${NC}\n"
    return 1
  fi
}

# Tentar configurar webhook para cada instância
for evolution_url in "${EVOLUTION_INSTANCES[@]}"; do
  setup_webhook_for_instance "$evolution_url" || true
done

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ Configuração de webhooks concluída${NC}"
echo -e "${GREEN}================================${NC}\n"

echo -e "${YELLOW}Próximos passos:${NC}"
echo "1. Verifique se os webhooks foram configurados com sucesso"
echo "2. Escaneie o QR Code novamente no WhatsApp"
echo "3. Confira os logs da API para o webhook ser chamado:"
echo "   docker logs api"
echo "4. Verifique o status em: GET /api/whatsapp/status/t1\n"
