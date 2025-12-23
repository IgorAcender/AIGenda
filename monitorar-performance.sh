#!/bin/bash

# Script de monitoramento em tempo real dos processos Node.js/Next.js

echo "📊 Monitor de Performance - AIGenda"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

while true; do
  clear
  
  echo "📊 Monitor de Performance - AIGenda"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "⏰ Atualizado em: $(date '+%H:%M:%S')"
  echo ""
  
  # CPU e Memória geral
  echo "💻 SISTEMA GERAL:"
  vm_stat 2>/dev/null | grep "Pages free" | awk '{printf "   RAM Livre: %.2f GB\n", $3 * 4096 / 1024 / 1024 / 1024}'
  top -l 1 2>/dev/null | grep "CPU usage" | sed 's/^/   /'
  echo ""
  
  # Next.js Server
  NEXT_PID=$(pgrep -f "next-server" | head -1)
  if [ ! -z "$NEXT_PID" ]; then
    echo "🔹 NEXT.JS SERVER (PID: $NEXT_PID):"
    ps -p $NEXT_PID -o %cpu=,%mem=,rss= 2>/dev/null | awk '{
      cpu=$1
      mem=$2
      rss=$3
      printf "   CPU: %.1f%% | Memória: %.1f%% (%.0f MB)\n", cpu, mem, rss/1024
    }'
  else
    echo "🔹 NEXT.JS SERVER: ❌ Não está rodando"
  fi
  echo ""
  
  # API Server
  API_PID=$(lsof -i :3001 2>/dev/null | tail -1 | awk '{print $2}')
  if [ ! -z "$API_PID" ] && [ "$API_PID" != "PID" ]; then
    echo "🔹 API SERVER (PID: $API_PID):"
    ps -p $API_PID -o %cpu=,%mem=,rss= 2>/dev/null | awk '{
      cpu=$1
      mem=$2
      rss=$3
      printf "   CPU: %.1f%% | Memória: %.1f%% (%.0f MB)\n", cpu, mem, rss/1024
    }'
  else
    echo "🔹 API SERVER: ❌ Não está rodando"
  fi
  echo ""
  
  # Portas ativas
  echo "🌐 PORTAS ATIVAS:"
  if lsof -i :3000 >/dev/null 2>&1; then
    echo "   ✅ Porta 3000 (Web): ATIVA"
  else
    echo "   ❌ Porta 3000 (Web): INATIVA"
  fi
  
  if lsof -i :3001 >/dev/null 2>&1; then
    echo "   ✅ Porta 3001 (API): ATIVA"
  else
    echo "   ❌ Porta 3001 (API): INATIVA"
  fi
  echo ""
  
  # Processos Node
  TOTAL_NODE=$(ps aux | grep -E "node|pnpm|tsx|next" | grep -v grep | wc -l)
  echo "🔢 TOTAL DE PROCESSOS RELACIONADOS: $TOTAL_NODE"
  echo ""
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔄 Atualizando em 5 segundos... (Ctrl+C para sair)"
  sleep 5
done
