#!/bin/bash

# 🧹 SCRIPT DE LIMPEZA DE CACHE DE DEPLOY
# Limpa os caches que crescem a cada build

echo "🧹 Limpando caches de deploy..."

# 1. Limpar cache do Next.js
echo "   → Limpando .next/cache..."
rm -rf /Users/user/Desktop/Programação/AIGenda/apps/web/.next/cache
rm -rf /Users/user/Desktop/Programação/AIGenda/apps/api/.next/cache

# 2. Limpar cache do pnpm
echo "   → Limpando cache do pnpm..."
pnpm store prune

# 3. Limpar cache do turbo
echo "   → Limpando cache do Turbo..."
rm -rf /Users/user/Desktop/Programação/AIGenda/.turbo

# 4. Limpar arquivos temporários
echo "   → Limpando temporários..."
rm -rf /tmp/next* 2>/dev/null
rm -rf /var/tmp/next* 2>/dev/null

# 5. Mostrar novo tamanho
echo ""
echo "✅ Limpeza concluída!"
echo ""
echo "📊 Novo tamanho do projeto:"
du -sh /Users/user/Desktop/Programação/AIGenda

echo ""
echo "📊 Novo tamanho do .next:"
du -sh /Users/user/Desktop/Programação/AIGenda/apps/web/.next 2>/dev/null || echo "   (será recriado no próximo build)"
