#!/bin/bash

echo "🔧 Otimizando servidor..."
echo ""

# 1. Parar todos os processos
echo "📍 Parando processos..."
pkill -9 node
pkill -9 tsx
pkill -9 pnpm
sleep 2

# 2. Limpar caches
echo "📍 Limpando caches..."
rm -rf /Users/user/Desktop/Programação/AIGenda/apps/web/.next
rm -rf /Users/user/Desktop/Programação/AIGenda/apps/web/node_modules/.cache
rm -rf /Users/user/Desktop/Programação/AIGenda/apps/api/node_modules/.cache

# 3. Liberar memória
echo "📍 Liberando memória..."
purge 2>/dev/null || true

# 4. Verificar estado
echo ""
echo "✅ Status atual:"
echo ""
echo "🔹 Memória:"
vm_stat | grep "Pages free" | awk '{print "   Páginas livres: " $3}'

echo ""
echo "🔹 CPU:"
top -l 1 | grep "CPU usage" | awk '{print "   " $0}'

echo ""
echo "🔹 Processos Node.js/PNPM:"
ps aux | grep -E "pnpm|node|tsx" | grep -v grep | wc -l | awk '{print "   Processos rodando: " $1}'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Próximos passos:"
echo ""
echo "1️⃣  Para desenvolvimento rápido (recomendado):"
echo "    cd /Users/user/Desktop/Programação/AIGenda"
echo "    NODE_OPTIONS='--max-old-space-size=2048' pnpm dev"
echo ""
echo "2️⃣  Para build otimizado (produção):"
echo "    pnpm build && pnpm start"
echo ""
echo "3️⃣  Se persistir lentidão:"
echo "    • Aumentar espaço de swap"
echo "    • Adicionar RAM ao sistema"
echo "    • Usar Docker com limites de memória"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
