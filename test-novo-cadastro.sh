#!/bin/bash

echo "🧪 Teste do Novo Cadastro de Profissionais"
echo "=========================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se a API está rodando
echo -n "1. Verificando API na porta 3001... "
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✓ Rodando${NC}"
else
    echo -e "${RED}✗ Não está rodando${NC}"
    echo "   Execute: cd apps/api && PORT=3001 pnpm dev"
    exit 1
fi

echo ""
echo "2. Testando endpoint de profissionais..."

# Tentar fazer login primeiro (você precisa ajustar as credenciais)
echo -n "   - Fazendo login... "
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@aigenda.com",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Falha no login${NC}"
    echo "   Ajuste as credenciais no script"
    exit 1
fi
echo -e "${GREEN}✓ OK${NC}"

echo ""
echo "3. Criando profissional de teste..."

CREATE_RESPONSE=$(curl -s -X POST http://localhost:3001/professionals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "Carlos",
    "lastName": "Silva",
    "profession": "Barbeiro Profissional",
    "cpf": "123.456.789-00",
    "rg": "12.345.678-9",
    "birthDate": "1990-05-15T00:00:00Z",
    "phone": "(11) 98888-7777",
    "email": "carlos.teste@exemplo.com",
    "address": "Rua das Flores",
    "addressNumber": "123",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567",
    "notes": "Profissional experiente em cortes modernos",
    "availableOnline": true,
    "generateSchedule": true,
    "receivesCommission": true,
    "partnershipContract": false,
    "commissionRate": 40,
    "color": "#1890ff",
    "workingDays": [1, 2, 3, 4, 5, 6],
    "workingHours": {
      "start": "09:00",
      "end": "18:00"
    }
  }')

PROF_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*' | grep -o '[^"]*$')

if [ -z "$PROF_ID" ]; then
    echo -e "${RED}✗ Falha ao criar profissional${NC}"
    echo "   Resposta: $CREATE_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Profissional criado com ID: $PROF_ID${NC}"

echo ""
echo "4. Listando profissionais..."

LIST_RESPONSE=$(curl -s http://localhost:3001/professionals \
  -H "Authorization: Bearer $TOKEN")

echo "   Resposta:"
echo "$LIST_RESPONSE" | jq '.' 2>/dev/null || echo "$LIST_RESPONSE"

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Todos os testes passaram!"
echo "==========================================${NC}"
echo ""
echo "📝 Próximos passos:"
echo "   1. Acesse: http://localhost:3000/cadastro/profissionais"
echo "   2. Clique em 'Novo Profissional'"
echo "   3. Preencha os campos nas abas"
echo "   4. Salve e verifique"
echo ""
echo "🔧 Para remover o profissional de teste:"
echo "   curl -X DELETE http://localhost:3001/professionals/$PROF_ID \\"
echo "        -H 'Authorization: Bearer $TOKEN'"
echo ""
