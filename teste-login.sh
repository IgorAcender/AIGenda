#!/bin/bash

# 🧪 Script de Teste do Login HTMX
# Testa conectividade com frontend e backend

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🧪 TESTE DO SISTEMA HTMX - AGENDE AI                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URLs
FRONTEND_URL="http://app.agendeai.easypanel.host"
BACKEND_URL="http://api.aigenda.easypanel.host"

test_count=0
pass_count=0
fail_count=0

# Função para testar
test_endpoint() {
    local name=$1
    local url=$2
    local expected_code=$3
    
    ((test_count++))
    
    echo -n "🔍 Testando $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected_code" ]; then
        echo -e "${GREEN}✅ OK${NC} (HTTP $response)"
        ((pass_count++))
    else
        echo -e "${RED}❌ FALHA${NC} (HTTP $response, esperado $expected_code)"
        ((fail_count++))
    fi
}

# Função para testar JSON
test_json_endpoint() {
    local name=$1
    local url=$2
    local headers=$3
    
    ((test_count++))
    
    echo -n "📡 Testando $name... "
    
    if response=$(curl -s -f -H "$headers" "$url" 2>/dev/null); then
        echo -e "${GREEN}✅ OK${NC}"
        echo "   └─ Resposta: $(echo $response | jq '.' 2>/dev/null | head -3)..."
        ((pass_count++))
    else
        echo -e "${RED}❌ FALHA${NC}"
        ((fail_count++))
    fi
}

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo "1️⃣  TESTANDO CONECTIVIDADE"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Testar Frontend
test_endpoint "Login Page" "$FRONTEND_URL/login" "200"
test_endpoint "Root (deveria redirecionar)" "$FRONTEND_URL/" "302"

echo ""

# Testar Backend
test_endpoint "Health Check" "$BACKEND_URL/health" "200"
test_endpoint "API Auth (GET deveria falhar)" "$BACKEND_URL/api/auth/login" "405"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo "2️⃣  TESTANDO AUTENTICAÇÃO"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Fazer login
echo "🔐 Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dono@barbearia-exemplo.com",
    "password": "Dono@123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token' 2>/dev/null || echo "")

if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo -e "${GREEN}✅ Login bem-sucedido!${NC}"
    ((pass_count++))
    ((test_count++))
    
    # Extrair informações do token
    USER_EMAIL=$(echo $LOGIN_RESPONSE | jq -r '.user.email')
    USER_NAME=$(echo $LOGIN_RESPONSE | jq -r '.user.name')
    TENANT_NAME=$(echo $LOGIN_RESPONSE | jq -r '.tenant.name')
    
    echo "   ├─ Email: $USER_EMAIL"
    echo "   ├─ Nome: $USER_NAME"
    echo "   └─ Tenant: $TENANT_NAME"
else
    echo -e "${RED}❌ Falha no login${NC}"
    echo "   └─ Resposta: $LOGIN_RESPONSE"
    ((fail_count++))
    ((test_count++))
    exit 1
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo "3️⃣  TESTANDO ENDPOINTS AUTENTICADOS"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Testar endpoints autenticados
AUTH_HEADER="Authorization: Bearer $TOKEN"

test_json_endpoint "Dashboard" "$BACKEND_URL/api/dashboard" "$AUTH_HEADER"
test_json_endpoint "Clientes" "$BACKEND_URL/api/clients" "$AUTH_HEADER"
test_json_endpoint "Profissionais" "$BACKEND_URL/api/professionals" "$AUTH_HEADER"
test_json_endpoint "Serviços" "$BACKEND_URL/api/services" "$AUTH_HEADER"
test_json_endpoint "Tenant" "$BACKEND_URL/api/tenants/me" "$AUTH_HEADER"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo "4️⃣  RESUMO DOS TESTES"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

echo "Total de testes: $test_count"
echo -e "✅ Sucessos: ${GREEN}$pass_count${NC}"
echo -e "❌ Falhas: ${RED}$fail_count${NC}"

echo ""

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  🎉 TODOS OS TESTES PASSARAM! SISTEMA OPERACIONAL!            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "✨ Você pode fazer login em: $FRONTEND_URL/login"
    echo "   Email: dono@barbearia-exemplo.com"
    echo "   Senha: Dono@123"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ⚠️  ALGUNS TESTES FALHARAM! VERIFIQUE OS ERROS ACIMA         ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
