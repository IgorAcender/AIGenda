#!/bin/bash

# ===========================================
# SCRIPT DE INICIALIZAÇÃO - AGENDE AI
# Inicia toda a infraestrutura de desenvolvimento
# ===========================================

set -e

echo "🚀 Iniciando Agende AI - Ambiente de Desenvolvimento"
echo "=================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretório do projeto
PROJECT_DIR="/Users/user/Desktop/Programação/AIGenda"
cd "$PROJECT_DIR"

# 1. Matar processos anteriores
echo -e "\n${YELLOW}[1/5] Limpando processos anteriores...${NC}"
pkill -9 -f "next dev" 2>/dev/null || true
pkill -9 -f "tsx watch" 2>/dev/null || true
sleep 2
echo -e "${GREEN}✓ Processos limpos${NC}"

# 2. Verificar e iniciar Docker containers
echo -e "\n${YELLOW}[2/5] Iniciando containers Docker...${NC}"

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker não está rodando. Por favor, inicie o Docker Desktop.${NC}"
    exit 1
fi

# Parar containers antigos se existirem
docker-compose -f docker-compose.evolution.yml down 2>/dev/null || true

# Iniciar infraestrutura (postgres, redis, evolution)
docker-compose -f docker-compose.evolution.yml up -d postgres redis postgres-evolution redis-evolution

echo "Aguardando bancos de dados ficarem healthy..."
sleep 15

# Verificar se os bancos estão healthy
POSTGRES_HEALTHY=$(docker ps --format "{{.Names}} {{.Status}}" | grep "agende-ai-db" | grep -c "healthy" || echo "0")
REDIS_HEALTHY=$(docker ps --format "{{.Names}} {{.Status}}" | grep "agende-ai-redis" | grep -c "healthy" || echo "0")

if [ "$POSTGRES_HEALTHY" = "0" ] || [ "$REDIS_HEALTHY" = "0" ]; then
    echo "Aguardando mais 10 segundos..."
    sleep 10
fi

echo -e "${GREEN}✓ Postgres e Redis rodando${NC}"

# 3. Iniciar Evolution instances
echo -e "\n${YELLOW}[3/5] Iniciando Evolution API instances...${NC}"
docker-compose -f docker-compose.evolution.yml up -d evolution-1 evolution-2 evolution-3

echo "Aguardando Evolution inicializar..."
sleep 30

# Verificar Evolution
EVOLUTION_OK=0
for i in 1 2 3; do
    PORT=$((8000 + i))
    RESPONSE=$(curl -s "http://localhost:$PORT/" 2>/dev/null | grep -c "Evolution" || echo "0")
    if [ "$RESPONSE" != "0" ]; then
        echo -e "${GREEN}✓ Evolution $i (porta $PORT) - OK${NC}"
        EVOLUTION_OK=$((EVOLUTION_OK + 1))
    else
        echo -e "${RED}✗ Evolution $i (porta $PORT) - Falhou${NC}"
    fi
done

if [ "$EVOLUTION_OK" = "0" ]; then
    echo -e "${RED}Nenhuma Evolution iniciou. Verificando logs...${NC}"
    docker logs agende-ai-evolution-1 2>&1 | tail -20
    exit 1
fi

# 4. Mostrar status dos containers
echo -e "\n${YELLOW}[4/5] Status dos containers:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "agende-ai|evolution"

# 5. Iniciar aplicação
echo -e "\n${YELLOW}[5/5] Iniciando API e Web...${NC}"
echo "Execute em outro terminal:"
echo -e "${GREEN}cd $PROJECT_DIR && pnpm dev --filter=api --filter=web${NC}"
echo ""
echo "Ou pressione ENTER para iniciar automaticamente..."
read -r

# Iniciar em background
nohup pnpm dev --filter=api --filter=web > /tmp/agende-ai-dev.log 2>&1 &
DEV_PID=$!

echo "Aguardando aplicação inicializar..."
sleep 15

# Verificar se a API está rodando
API_OK=$(curl -s "http://localhost:3001/health" 2>/dev/null | grep -c "ok" || echo "0")
if [ "$API_OK" != "0" ]; then
    echo -e "${GREEN}✓ API rodando em http://localhost:3001${NC}"
else
    echo -e "${YELLOW}⚠ API ainda inicializando...${NC}"
fi

# Mostrar resumo final
echo ""
echo "=================================================="
echo -e "${GREEN}🎉 Ambiente de Desenvolvimento Pronto!${NC}"
echo "=================================================="
echo ""
echo "📡 Serviços disponíveis:"
echo "   - Frontend:     http://localhost:3000"
echo "   - API:          http://localhost:3001"
echo "   - Evolution 1:  http://localhost:8001"
echo "   - Evolution 2:  http://localhost:8002"
echo "   - Evolution 3:  http://localhost:8003"
echo "   - PostgreSQL:   localhost:5432"
echo "   - Redis:        localhost:6379"
echo ""
echo "📝 Logs da aplicação: /tmp/agende-ai-dev.log"
echo "   Para ver: tail -f /tmp/agende-ai-dev.log"
echo ""
echo "🛑 Para parar tudo:"
echo "   docker-compose -f docker-compose.evolution.yml down"
echo "   pkill -f 'next dev' && pkill -f 'tsx watch'"
echo ""
