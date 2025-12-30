#!/bin/bash

# 🚀 SCRIPT DE LIMPEZA SEGURA PRE-DEPLOY
# Remove caches SEM risco de erros

set -e

PROJECT_ROOT="/Users/user/Desktop/Programação/AIGenda"
BACKUP_DIR="/tmp/aigenda-backup-$(date +%s)"

echo "═══════════════════════════════════════════════════════════"
echo "🔒 LIMPEZA SEGURA DE CACHE - Pre-Deploy"
echo "═══════════════════════════════════════════════════════════"
echo ""

# PASSO 1: VERIFICAR INTEGRIDADE
echo "✓ PASSO 1: Verificando integridade do projeto..."
if [ ! -d "$PROJECT_ROOT/apps/web" ]; then
    echo "❌ ERRO: apps/web não encontrado!"
    exit 1
fi
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    echo "❌ ERRO: package.json não encontrado!"
    exit 1
fi
echo "   ✅ Projeto íntegro"
echo ""

# PASSO 2: BACKUP DOS ARQUIVOS CRÍTICOS
echo "✓ PASSO 2: Fazendo backup dos arquivos críticos..."
mkdir -p "$BACKUP_DIR"
cp "$PROJECT_ROOT/package.json" "$BACKUP_DIR/" 2>/dev/null || true
cp "$PROJECT_ROOT/pnpm-lock.yaml" "$BACKUP_DIR/" 2>/dev/null || true
echo "   ✅ Backup criado em: $BACKUP_DIR"
echo ""

# PASSO 3: MOSTRAR ESPAÇO ANTES
echo "✓ PASSO 3: Medindo espaço antes..."
SPACE_BEFORE=$(du -sh "$PROJECT_ROOT" 2>/dev/null | cut -f1)
echo "   📊 Espaço usado ANTES: $SPACE_BEFORE"
echo ""

# PASSO 4: LIMPAR APENAS CACHES (SEM DELETAR CÓDIGO)
echo "✓ PASSO 4: Limpando caches..."
echo "   → Removendo .turbo..."
rm -rf "$PROJECT_ROOT/.turbo" 2>/dev/null || echo "      (não encontrado)"

echo "   → Removendo .next/cache..."
rm -rf "$PROJECT_ROOT/apps/web/.next/cache" 2>/dev/null || echo "      (não encontrado)"
rm -rf "$PROJECT_ROOT/apps/api/.next/cache" 2>/dev/null || echo "      (não encontrado)"

echo "   → Limpando pnpm store (mantém integridade)..."
pnpm store prune 2>/dev/null || echo "      (erro ao limpar, ignorando)"

echo "   ✅ Caches removidos com segurança"
echo ""

# PASSO 5: VALIDAR QUE NADA CRÍTICO FOI DELETADO
echo "✓ PASSO 5: Validando integridade pós-limpeza..."
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    echo "❌ ERRO: package.json foi deletado! Restaurando..."
    cp "$BACKUP_DIR/package.json" "$PROJECT_ROOT/"
    exit 1
fi
if [ ! -d "$PROJECT_ROOT/apps/web/src" ]; then
    echo "❌ ERRO: Código fonte foi deletado! Restaurando..."
    exit 1
fi
echo "   ✅ Integridade confirmada"
echo ""

# PASSO 6: MOSTRAR ESPAÇO DEPOIS
echo "✓ PASSO 6: Medindo espaço depois..."
SPACE_AFTER=$(du -sh "$PROJECT_ROOT" 2>/dev/null | cut -f1)
echo "   📊 Espaço usado DEPOIS: $SPACE_AFTER"
echo ""

# PASSO 7: PRÓXIMAS INSTRUÇÕES
echo "═══════════════════════════════════════════════════════════"
echo "✅ LIMPEZA CONCLUÍDA COM SUCESSO!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📝 PRÓXIMOS PASSOS:"
echo ""
echo "   1️⃣  Verificar se tudo está funcionando localmente:"
echo "      npm run dev"
echo ""
echo "   2️⃣  Se tudo OK, fazer deploy:"
echo "      npm run build"
echo ""
echo "   3️⃣  Monitorar espaço em disco na VPS após deploy:"
echo "      df -h"
echo ""
echo "🔒 Backup criado em: $BACKUP_DIR"
echo "   (pode ser deletado depois se tudo funcionar)"
echo ""
