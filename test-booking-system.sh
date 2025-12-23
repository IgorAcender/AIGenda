#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🧪 TESTER DO SISTEMA DE AGENDAMENTO${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

API_URL="${1:-http://localhost:3000}"
TENANT_SLUG="barbearia-exemplo"

# Função para testar endpoint
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4
  
  echo -e "${YELLOW}▶ Testando:${NC} $description"
  echo -e "  ${BLUE}$method${NC} $API_URL$endpoint"
  
  if [ -z "$data" ]; then
    response=$(curl -s -X "$method" "$API_URL$endpoint" -H "Content-Type: application/json")
  else
    response=$(curl -s -X "$method" "$API_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  # Check if response is valid JSON
  if echo "$response" | jq . >/dev/null 2>&1; then
    echo -e "  ${GREEN}✅ Resposta recebida${NC}"
    echo "$response" | jq '.' --color-output | sed 's/^/  /'
  else
    echo -e "  ${RED}❌ Erro na resposta${NC}"
    echo "  Response: $response"
  fi
  
  echo ""
}

# 1. Teste: Listar serviços
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}1️⃣  TESTES DE LISTAGEM${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# Buscar primeiro serviço para usar nos testes
SERVICE_RESPONSE=$(curl -s "$API_URL/api/services?tenantSlug=$TENANT_SLUG")
SERVICE_ID=$(echo "$SERVICE_RESPONSE" | jq -r '.data[0].id // empty' 2>/dev/null)

if [ -z "$SERVICE_ID" ]; then
  echo -e "${RED}❌ Nenhum serviço encontrado${NC}"
  echo "Response: $SERVICE_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Serviço encontrado:${NC} $SERVICE_ID\n"

# 2. Teste: Listar profissionais para o serviço
test_endpoint "GET" "/public/bookings/$TENANT_SLUG/professionals/$SERVICE_ID" "" \
  "Listar profissionais para serviço ID: $SERVICE_ID"

# Buscar primeiro profissional
PRO_RESPONSE=$(curl -s "$API_URL/public/bookings/$TENANT_SLUG/professionals/$SERVICE_ID")
PROFESSIONAL_ID=$(echo "$PRO_RESPONSE" | jq -r '.data[0].id // empty' 2>/dev/null)

if [ -z "$PROFESSIONAL_ID" ]; then
  echo -e "${RED}⚠️  Nenhum profissional encontrado para este serviço${NC}\n"
  PROFESSIONAL_ID=""
fi

# 3. Teste: Listar slots disponíveis
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}2️⃣  TESTES DE DISPONIBILIDADE${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

START_DATE=$(date +"%Y-%m-%d")
END_DATE=$(date -d "+30 days" +"%Y-%m-%d" 2>/dev/null || date -v+30d +"%Y-%m-%d")

QUERY_STRING="serviceId=$SERVICE_ID&startDate=$START_DATE&endDate=$END_DATE"
if [ ! -z "$PROFESSIONAL_ID" ]; then
  QUERY_STRING="$QUERY_STRING&professionalId=$PROFESSIONAL_ID"
fi

test_endpoint "GET" "/public/bookings/$TENANT_SLUG/available-slots?$QUERY_STRING" "" \
  "Listar slots disponíveis (próximos 30 dias)"

# 4. Teste: Criar agendamento
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}3️⃣  TESTES DE CRIAÇÃO${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

if [ ! -z "$PROFESSIONAL_ID" ]; then
  # Pegar um slot disponível para o teste
  SLOTS_RESPONSE=$(curl -s "$API_URL/public/bookings/$TENANT_SLUG/available-slots?$QUERY_STRING")
  FIRST_SLOT=$(echo "$SLOTS_RESPONSE" | jq '.data[0]' 2>/dev/null)
  
  if echo "$FIRST_SLOT" | grep -q "date"; then
    SLOT_DATE=$(echo "$FIRST_SLOT" | jq -r '.date')
    SLOT_TIME=$(echo "$FIRST_SLOT" | jq -r '.time')
    
    # Converter para ISO 8601
    START_TIME="${SLOT_DATE}T${SLOT_TIME}:00Z"
    END_TIME=$(date -d "$START_TIME + 30 minutes" -I"seconds" 2>/dev/null || \
                date -f "%Y-%m-%dT%H:%M:%SZ" -v+30m "$START_TIME" 2>/dev/null || \
                echo "${SLOT_DATE}T$(printf '%02d:%02d' $((${SLOT_TIME%:*})) $((${SLOT_TIME#*:}+30)))Z")
    
    BOOKING_DATA=$(cat <<EOF
{
  "serviceId": "$SERVICE_ID",
  "professionalId": "$PROFESSIONAL_ID",
  "startTime": "$START_TIME",
  "endTime": "$END_TIME",
  "customerName": "Teste Cliente",
  "customerPhone": "(11) 98765-4321",
  "customerEmail": "teste@email.com",
  "notes": "Teste de agendamento automático"
}
EOF
)
    
    echo -e "Tentando criar agendamento com os seguintes dados:"
    echo "$BOOKING_DATA" | jq '.' --color-output | sed 's/^/  /'
    echo ""
    
    BOOKING_RESPONSE=$(curl -s -X POST "$API_URL/public/bookings/$TENANT_SLUG/create" \
      -H "Content-Type: application/json" \
      -d "$BOOKING_DATA")
    
    if echo "$BOOKING_RESPONSE" | jq . >/dev/null 2>&1; then
      echo -e "  ${GREEN}✅ Agendamento criado com sucesso${NC}"
      echo "$BOOKING_RESPONSE" | jq '.' --color-output | sed 's/^/  /'
      
      # Extrair ID para testes posteriores
      BOOKING_ID=$(echo "$BOOKING_RESPONSE" | jq -r '.data.id // empty' 2>/dev/null)
      
      if [ ! -z "$BOOKING_ID" ]; then
        echo -e "\n${GREEN}✅ ID do agendamento para testes posteriores:${NC} $BOOKING_ID"
        
        # 5. Teste: Cancelar agendamento
        echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${BLUE}4️⃣  TESTES DE CANCELAMENTO${NC}"
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"
        
        CANCEL_DATA='{"cancellationReason":"Teste de cancelamento"}'
        
        test_endpoint "POST" "/public/bookings/$BOOKING_ID/cancel" "$CANCEL_DATA" \
          "Cancelar agendamento ID: $BOOKING_ID"
      fi
    else
      echo -e "  ${RED}❌ Erro ao criar agendamento${NC}"
      echo "  Response: $BOOKING_RESPONSE"
    fi
  else
    echo -e "${YELLOW}⚠️  Nenhum slot disponível para este período${NC}"
    echo -e "${YELLOW}Dica: Slots deve estar em datas futuras com regras de disponibilidade ativas${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Pulando testes de agendamento (nenhum profissional)${NC}"
fi

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ TESTES CONCLUÍDOS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

echo "📋 Dicas:"
echo "  1. Configure variáveis SMTP em apps/api/.env para testar notificações"
echo "  2. Use Prisma Studio para visualizar dados: pnpm db:studio"
echo "  3. Verifique logs da API em tempo real"
