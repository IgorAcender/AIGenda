#!/bin/bash

# ===========================================
# 🔍 VERIFICAÇÃO PRÉ-DEPLOY EASYPANEL
# Execute antes de fazer deploy
# ===========================================

echo "🚀 Verificando configuração para deploy no EasyPanel..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
ERRORS=0
WARNINGS=0
SUCCESS=0

# Função para verificar com mensagem customizada
check_success() {
    echo -e "${GREEN}✓${NC} $1"
    ((SUCCESS++))
}

check_error() {
    echo -e "${RED}✗${NC} $1"
    ((ERRORS++))
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

# ===========================================
# 1. VERIFICAR ESTRUTURA DE ARQUIVOS
# ===========================================
echo "📁 Verificando estrutura de arquivos..."

if [ -f "package.json" ]; then
    check_success "package.json existe"
else
    check_error "package.json NÃO encontrado"
fi

if [ -f "turbo.json" ]; then
    check_success "turbo.json existe"
else
    check_error "turbo.json NÃO encontrado"
fi

if [ -f "pnpm-workspace.yaml" ]; then
    check_success "pnpm-workspace.yaml existe"
else
    check_error "pnpm-workspace.yaml NÃO encontrado"
fi

if [ -f "apps/api/Dockerfile" ]; then
    check_success "Dockerfile da API existe"
else
    check_error "Dockerfile da API NÃO encontrado"
fi

if [ -f "apps/web/Dockerfile" ]; then
    check_success "Dockerfile do Web existe"
else
    check_error "Dockerfile do Web NÃO encontrado"
fi

if [ -f "apps/api/package.json" ]; then
    check_success "package.json da API existe"
else
    check_error "package.json da API NÃO encontrado"
fi

if [ -f "apps/web/package.json" ]; then
    check_success "package.json do Web existe"
else
    check_error "package.json do Web NÃO encontrado"
fi

echo ""

# ===========================================
# 2. VERIFICAR PRISMA
# ===========================================
echo "🗄️  Verificando Prisma..."

if [ -f "apps/api/prisma/schema.prisma" ]; then
    check_success "schema.prisma existe"
else
    check_error "schema.prisma NÃO encontrado"
fi

if [ -d "apps/api/prisma/migrations" ]; then
    check_success "Pasta de migrations existe"
else
    warn "Nenhuma migration encontrada"
fi

echo ""

# ===========================================
# 3. VERIFICAR NEXT.JS CONFIG
# ===========================================
echo "⚙️  Verificando Next.js config..."

if [ -f "apps/web/next.config.js" ]; then
    if grep -q "output: 'standalone'" "apps/web/next.config.js"; then
        check_success "next.config.js com output: 'standalone'"
    else
        echo -e "${RED}✗${NC} next.config.js SEM output: 'standalone'"
        echo "   Adicione: output: 'standalone' no next.config.js"
        ((ERRORS++))
    fi
else
    check_error "next.config.js NÃO encontrado"
fi

echo ""

# ===========================================
# 4. VERIFICAR DOCKERFILES
# ===========================================
echo "🐳 Verificando Dockerfiles..."

# API Dockerfile
if [ -f "apps/api/Dockerfile" ]; then
    grep -q "FROM node:20-alpine" apps/api/Dockerfile && check_success "API: Node 20 Alpine" || warn "API: Verifique versão do Node"
    grep -q "prisma migrate deploy" apps/api/Dockerfile && check_success "API: Migrations automáticas configuradas" || warn "API: Migrations podem precisar ser rodadas manualmente"
    grep -q "EXPOSE 3001" apps/api/Dockerfile && check_success "API: Porta 3001 exposta" || warn "API: Verifique porta exposta"
fi

# Web Dockerfile
if [ -f "apps/web/Dockerfile" ]; then
    grep -q "FROM node:20-alpine" apps/web/Dockerfile && check_success "Web: Node 20 Alpine" || warn "Web: Verifique versão do Node"
    grep -q "pnpm" apps/web/Dockerfile && check_success "Web: pnpm configurado" || warn "Web: Verifique gerenciador de pacotes"
    grep -q "EXPOSE 3000" apps/web/Dockerfile && check_success "Web: Porta 3000 exposta" || warn "Web: Verifique porta exposta"
fi

echo ""

# ===========================================
# 5. VERIFICAR VARIÁVEIS DE AMBIENTE
# ===========================================
echo "🔐 Verificando arquivos de variáveis de ambiente..."

if [ -f ".env.easypanel.api" ]; then
    check_success "Exemplo de .env para API criado"
else
    warn "Crie .env.easypanel.api com as variáveis necessárias"
fi

if [ -f ".env.easypanel.web" ]; then
    check_success "Exemplo de .env para Web criado"
else
    warn "Crie .env.easypanel.web com as variáveis necessárias"
fi

echo ""

# ===========================================
# 6. VERIFICAR DEPENDÊNCIAS
# ===========================================
echo "📦 Verificando dependências..."

command -v node >/dev/null 2>&1 && check_success "Node.js instalado ($(node --version))" || warn "Node.js não encontrado"
command -v pnpm >/dev/null 2>&1 && check_success "pnpm instalado ($(pnpm --version))" || warn "pnpm não encontrado"

if [ -f "pnpm-lock.yaml" ]; then
    check_success "pnpm-lock.yaml existe (lockfile presente)"
else
    echo -e "${RED}✗${NC} pnpm-lock.yaml NÃO encontrado"
    echo "   Execute: pnpm install"
    ((ERRORS++))
fi

echo ""

# ===========================================
# 7. TESTE DE BUILD LOCAL (OPCIONAL)
# ===========================================
echo "🔨 Verificando se o projeto compila..."

if command -v pnpm >/dev/null 2>&1; then
    if [ -f "pnpm-lock.yaml" ] && [ -d "node_modules" ]; then
        echo "   Tentando build local (pode levar alguns minutos)..."
        if pnpm build >/dev/null 2>&1; then
            check_success "Build local bem-sucedido"
        else
            echo -e "${RED}✗${NC} Build local falhou"
            echo "   Execute: pnpm install && pnpm build"
            echo "   E verifique os erros"
            ((ERRORS++))
        fi
    else
        warn "Instale as dependências primeiro: pnpm install"
    fi
else
    warn "Pule este teste se não tiver pnpm instalado"
fi

echo ""

# ===========================================
# 8. VERIFICAR GIT
# ===========================================
echo "🔄 Verificando Git..."

if [ -d ".git" ]; then
    check_success "Repositório Git inicializado"
    
    # Verificar se tem remote
    if git remote -v | grep -q "origin"; then
        REMOTE_URL=$(git remote get-url origin)
        check_success "Remote 'origin' configurado: $REMOTE_URL"
    else
        echo -e "${YELLOW}⚠${NC} Nenhum remote configurado"
        echo "   Configure: git remote add origin <URL>"
        ((WARNINGS++))
    fi
    
    # Verificar branch
    CURRENT_BRANCH=$(git branch --show-current)
    check_success "Branch atual: $CURRENT_BRANCH"
    
    # Verificar se há mudanças não commitadas
    if git diff-index --quiet HEAD --; then
        check_success "Sem mudanças não commitadas"
    else
        warn "Há mudanças não commitadas. Faça commit antes do deploy"
    fi
else
    warn "Não é um repositório Git"
fi

echo ""

# ===========================================
# RESUMO
# ===========================================
echo "════════════════════════════════════════"
echo "📊 RESUMO DA VERIFICAÇÃO"
echo "════════════════════════════════════════"
echo -e "${GREEN}✓ Sucessos:${NC} $SUCCESS"
echo -e "${YELLOW}⚠ Avisos:${NC} $WARNINGS"
echo -e "${RED}✗ Erros:${NC} $ERRORS"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 TUDO PRONTO PARA DEPLOY!${NC}"
    echo ""
    echo "Próximos passos:"
    echo "1. Faça commit das mudanças: git add . && git commit -m 'deploy: ready for production'"
    echo "2. Push para o repositório: git push origin main"
    echo "3. Configure o projeto no EasyPanel seguindo DEPLOY_EASYPANEL.md"
    echo ""
    exit 0
else
    echo -e "${RED}❌ CORRIJA OS ERROS ANTES DO DEPLOY${NC}"
    echo ""
    echo "Revise os erros acima e corrija antes de prosseguir."
    echo ""
    exit 1
fi
