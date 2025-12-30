#!/bin/bash

# ⚡ LIMPEZA ULTRA-RÁPIDA (< 2 segundos)
# Remove APENAS os caches que crescem

PROJECT_ROOT="/Users/user/Desktop/Programação/AIGenda"
cd "$PROJECT_ROOT"

echo "⚡ Limpando caches..."

# Remover APENAS essas 3 pastas (tudo recria automaticamente)
rm -rf .turbo 2>/dev/null
rm -rf apps/web/.next/cache 2>/dev/null  
rm -rf apps/api/.next/cache 2>/dev/null

echo "✅ Concluído em < 1 segundo!"
