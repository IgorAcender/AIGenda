#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# AUTO COMMIT & PUSH SCRIPT
# Sincroniza automaticamente com o repositório remoto
# ═══════════════════════════════════════════════════════════════

set -e

PROJECT_DIR="/Users/user/Desktop/Programação/AIGenda"
cd "$PROJECT_DIR"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}  AUTO COMMIT & PUSH${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"

# Verificar se há mudanças
STATUS=$(git status --porcelain)

if [ -z "$STATUS" ]; then
    echo -e "${GREEN}✓ Nenhuma mudança para sincronizar${NC}"
    exit 0
fi

# Mostrar mudanças
echo -e "\n${BLUE}📝 Mudanças detectadas:${NC}"
echo "$STATUS"

# Adicionar todas as mudanças
echo -e "\n${BLUE}➕ Adicionando arquivos...${NC}"
git add -A
echo -e "${GREEN}✓ Arquivos adicionados${NC}"

# Criar mensagem de commit automática
TIMESTAMP=$(date '+%d/%m/%Y às %H:%M:%S')
BRANCH=$(git rev-parse --abbrev-ref HEAD)
COMMIT_MESSAGE="🤖 Auto-sync: $TIMESTAMP"

# Contar arquivos modificados
FILES_CHANGED=$(git diff --cached --name-only | wc -l)
echo -e "\n${BLUE}📊 Estatísticas:${NC}"
echo "   • Branch: $BRANCH"
echo "   • Arquivos: $FILES_CHANGED"
echo "   • Mensagem: $COMMIT_MESSAGE"

# Fazer commit
echo -e "\n${BLUE}💾 Fazendo commit...${NC}"
git commit -m "$COMMIT_MESSAGE" -m "Sincronização automática dos arquivos alterados"
echo -e "${GREEN}✓ Commit realizado${NC}"

# Fazer push
echo -e "\n${BLUE}🚀 Enviando para o repositório remoto...${NC}"
git push origin "$BRANCH"
echo -e "${GREEN}✓ Push realizado com sucesso${NC}"

# Resumo final
echo -e "\n${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Sincronização concluída!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"

# Mostrar log do último commit
echo -e "\n${BLUE}📋 Último commit:${NC}"
git log -1 --oneline --decorate

echo ""
