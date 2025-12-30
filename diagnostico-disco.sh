#!/bin/bash

# 🔍 DIAGNÓSTICO COMPLETO DE ESPAÇO EM DISCO NA VPS

echo "═══════════════════════════════════════════════════════════"
echo "🔍 DIAGNÓSTICO DE ESPAÇO EM DISCO - AIGenda"
echo "═══════════════════════════════════════════════════════════"
echo ""

# 1. ESPAÇO EM DISCO TOTAL
echo "📊 ESPAÇO EM DISCO TOTAL:"
df -h / | tail -1
echo ""

# 2. DIRETÓRIOS GRANDES NO PROJETO
echo "📁 MAIORES DIRETÓRIOS NO PROJETO:"
du -sh /Users/user/Desktop/Programação/AIGenda/* 2>/dev/null | sort -hr | head -15
echo ""

# 3. CACHE DO NEXT.JS
echo "🔸 CACHE DO NEXT.JS:"
du -sh /Users/user/Desktop/Programação/AIGenda/apps/web/.next/cache 2>/dev/null || echo "   Não encontrado"
du -sh /Users/user/Desktop/Programação/AIGenda/apps/api/.next/cache 2>/dev/null || echo "   Não encontrado"
echo ""

# 4. NODE_MODULES
echo "🔸 NODE_MODULES:"
du -sh /Users/user/Desktop/Programação/AIGenda/node_modules 2>/dev/null || echo "   Não encontrado"
du -sh /Users/user/Desktop/Programação/AIGenda/apps/*/node_modules 2>/dev/null | sort -hr
echo ""

# 5. LOGS (se houver)
echo "🔸 LOGS (sistema):"
du -sh /var/log/* 2>/dev/null | sort -hr | head -10 || echo "   Sem permissão ou não encontrado"
echo ""

# 6. DOCKER (se instalado)
echo "🔸 DOCKER:"
if command -v docker &> /dev/null; then
    echo "   Imagens Docker:"
    docker images --format "{{.Size}}\t{{.Repository}}:{{.Tag}}" 2>/dev/null | sort -hr | head -10 || echo "   Erro ao listar"
    echo ""
    echo "   Containers Docker:"
    docker ps -a --format "{{.Size}}\t{{.Names}}" 2>/dev/null | sort -hr | head -10 || echo "   Erro ao listar"
    echo ""
    echo "   Volumes Docker:"
    docker volume ls --format "table {{.Name}}\t{{.Mountpoint}}" 2>/dev/null || echo "   Erro ao listar"
else
    echo "   Docker não instalado"
fi
echo ""

# 7. PNPM STORE
echo "🔸 PNPM STORE (cache de pacotes):"
if command -v pnpm &> /dev/null; then
    du -sh ~/.pnpm-store 2>/dev/null || echo "   Não encontrado"
    pnpm store status 2>/dev/null || echo "   Erro ao verificar"
else
    echo "   pnpm não instalado"
fi
echo ""

# 8. TURBO CACHE
echo "🔸 TURBO CACHE:"
du -sh /Users/user/Desktop/Programação/AIGenda/.turbo 2>/dev/null || echo "   Não encontrado"
du -sh ~/.cache/turbo 2>/dev/null || echo "   Não encontrado"
echo ""

# 9. BUILD ARTIFACTS ANTIGOS
echo "🔸 BUILD ARTIFACTS:"
find /Users/user/Desktop/Programação/AIGenda -name "dist" -type d 2>/dev/null | while read dir; do
    du -sh "$dir"
done || echo "   Nenhum encontrado"
echo ""

# 10. ESPAÇO TEMPORÁRIO DO PROJETO
echo "🔸 ARQUIVOS TEMPORÁRIOS (.next, .turbo, etc):"
du -sh /Users/user/Desktop/Programação/AIGenda/apps/web/.next 2>/dev/null || echo "   .next não encontrado"
du -sh /Users/user/Desktop/Programação/AIGenda/apps/api/.next 2>/dev/null || echo "   .next não encontrado"
du -sh /Users/user/Desktop/Programação/AIGenda/.turbo 2>/dev/null || echo "   .turbo não encontrado"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "✅ Diagnóstico concluído!"
echo "═══════════════════════════════════════════════════════════"
