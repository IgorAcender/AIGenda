#!/bin/bash

# Easy Panel Deploy Automation Script
# Execute este script para exibir todas as instruções

clear

cat << 'EOF'

╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║        ✅ AIGenda SaaS - DEPLOY AUTOMÁTICO NO EASY PANEL COM GITHUB ✅   ║
║                                                                           ║
║                     TODOS OS ARQUIVOS FORAM CRIADOS!                     ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

📦 ARQUIVOS NOVOS CRIADOS:

✅ .npmrc                    - Configuração npm para monorepo
✅ build.sh                  - Script que faz build do front + back
✅ start.sh                  - Script que inicia com PM2
✅ Procfile                  - Compatibilidade com Easy Panel
✅ EASY-PANEL-GITHUB.md      - Guia COMPLETO (37 seções!)
✅ EASY-PANEL-QUICK.txt      - Resumo VISUAL (passo-a-passo)

═══════════════════════════════════════════════════════════════════════════

🎯 RESUMO DO QUE MUDA:

ANTES:
  • Instalar tudo manualmente no Easy Panel
  • SSH + bash scripts
  • Configuração complexa

AGORA:
  ✅ Conectar GitHub no Easy Panel
  ✅ Selecionar "Nixpacks"
  ✅ Preencher variáveis de ambiente
  ✅ Clicar DEPLOY
  ✅ Pronto! Tudo automático!

═══════════════════════════════════════════════════════════════════════════

🚀 PRÓXIMOS PASSOS (5 MINUTOS):

1️⃣  Push para GitHub
    $ cd /Users/user/Desktop/Programação/AIGenda-SaaS
    $ git add .
    $ git commit -m "AIGenda SaaS ready for Easy Panel"
    $ git push origin main

2️⃣  Easy Panel Dashboard
    • Ir para: https://easy-panel.seu-dominio.com
    • Criar novo "Aplicação" ou "Serviço"
    • Conectar GitHub

3️⃣  Configuração
    • Proprietário: IgorAcender
    • Repositório: AIGenda-SaaS
    • Ramo: main
    • Método Build: Nixpacks

4️⃣  Variáveis de Ambiente
    DATABASE_URL=postgresql://user:pass@localhost:5432/aigenda_prod
    REDIS_URL=redis://localhost:6379
    JWT_SECRET=seu-jwt-muito-seguro-aqui
    NODE_ENV=production
    API_PORT=3001
    CORS_ORIGIN=https://seu-dominio.com
    NEXT_PUBLIC_API_URL=https://api.seu-dominio.com
    NEXT_PUBLIC_APP_URL=https://seu-dominio.com

5️⃣  Deploy
    • Clicar em DEPLOY
    • Aguardar 5-10 minutos
    • ✅ Aplicação rodando!

═══════════════════════════════════════════════════════════════════════════

📖 DOCUMENTAÇÃO COMPLETA:

Leia na ordem:

1️⃣  EASY-PANEL-QUICK.txt
    └─ Resumo visual com passo-a-passo (LEIA PRIMEIRO!)

2️⃣  EASY-PANEL-GITHUB.md
    └─ Guia detalhado com 37 seções (tudo que você precisa saber)

3️⃣  DEPLOY.md
    └─ Versão anterior (manual SSH - pode usar como referência)

═══════════════════════════════════════════════════════════════════════════

🎁 O QUE VOCÊ GANHA:

✅ Deploy automático a cada git push
✅ Sem necessidade de SSH
✅ Build e inicialização automáticos
✅ Zero downtime deploys
✅ SSL/HTTPS automático
✅ PM2 gerenciando 24/7
✅ Logs em tempo real no painel
✅ Escalável e pronto para produção

═══════════════════════════════════════════════════════════════════════════

⚡ FLUXO RÁPIDO:

ANTES DE USAR Easy Panel (uma vez):
  git push → GitHub → Done

DEPOIS (toda vez que editar código):
  git push → Easy Panel detecta → Deploy automático → ✅ Ao vivo!

═══════════════════════════════════════════════════════════════════════════

🔐 SEGURANÇA:

✅ Gerar JWT_SECRET seguro:
   openssl rand -base64 32

✅ Senhas do banco:
   Escolher senha FORTE
   Mínimo 16 caracteres com números, letras, símbolos

✅ CORS_ORIGIN:
   Usar https://seu-dominio.com EXATO

═══════════════════════════════════════════════════════════════════════════

💡 DICAS IMPORTANTES:

1. Leia EASY-PANEL-QUICK.txt PRIMEIRO
2. Depois leia EASY-PANEL-GITHUB.md se tiver dúvidas
3. Teste localmente antes de fazer push: npm run dev
4. Mantenha .env.example atualizado com novas variáveis
5. Sempre faça commits descritivos

═══════════════════════════════════════════════════════════════════════════

🎯 CHECKLIST FINAL:

Antes de conectar Easy Panel:

Repositório:
  ☐ git init (feito)
  ☐ .gitignore (feito)
  ☐ todos os arquivos foram adicionados
  ☐ git push para GitHub (FAÇA AGORA!)

No Easy Panel:
  ☐ Conectar GitHub (IgorAcender / AIGenda-SaaS)
  ☐ Selecionar ramo: main
  ☐ Selecionar método: Nixpacks
  ☐ Preencher TODAS as 8 variáveis de ambiente
  ☐ Clicar DEPLOY

Pronto!
  ☐ Aguardar 5-10 minutos
  ☐ Acessar: https://seu-dominio.com
  ☐ ✅ Aplicação rodando!

═══════════════════════════════════════════════════════════════════════════

🚨 SE ALGO DER ERRADO:

1. Verificar logs no Easy Panel → Aba "Build Logs" ou "Logs"
2. Procurar a mensagem de erro em EASY-PANEL-GITHUB.md (seção Troubleshooting)
3. Fazer correção no código
4. git push novamente
5. Easy Panel refaz o deploy automaticamente

═══════════════════════════════════════════════════════════════════════════

📞 REFERÊNCIA RÁPIDA:

Variáveis Necessárias:
┌─────────────────────────────────────────────────────────────┐
│ DATABASE_URL         → Banco PostgreSQL                      │
│ REDIS_URL            → Cache Redis                           │
│ JWT_SECRET           → Token autenticação (gerar com openssl)│
│ NODE_ENV             → Sempre "production"                  │
│ API_PORT             → Sempre 3001                          │
│ CORS_ORIGIN          → https://seu-dominio.com              │
│ NEXT_PUBLIC_API_URL  → https://api.seu-dominio.com          │
│ NEXT_PUBLIC_APP_URL  → https://seu-dominio.com              │
└─────────────────────────────────────────────────────────────┘

Comandos Básicos (SSH no servidor):
┌─────────────────────────────────────────────────────────────┐
│ pm2 status                → Ver status das apps             │
│ pm2 logs                  → Ver logs em tempo real           │
│ pm2 restart all           → Reiniciar tudo                  │
│ pm2 stop all              → Parar tudo                      │
└─────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════

✨ TUDO PRONTO!

Você tem:
✅ Arquivos de build automático
✅ Scripts de inicialização
✅ Documentação completa (2 versões)
✅ Configuração PM2
✅ Configuração Nginx
✅ Tudo que precisa no GitHub

Próximo passo:

  $ cd /Users/user/Desktop/Programação/AIGenda-SaaS
  $ git push origin main

Depois no Easy Panel:
  → Conectar GitHub
  → Deploy
  → ✅ Pronto!

═══════════════════════════════════════════════════════════════════════════

🎉 BOA SORTE!

Qualquer dúvida, consulte:
📖 EASY-PANEL-QUICK.txt (comece aqui!)
📖 EASY-PANEL-GITHUB.md (guia completo)

═══════════════════════════════════════════════════════════════════════════

EOF

echo ""
echo "🔗 Arquivos disponíveis no VS Code:"
echo "   • EASY-PANEL-QUICK.txt (abra e leia!)"
echo "   • EASY-PANEL-GITHUB.md (documentação completa)"
echo ""
echo "✅ Tudo pronto para fazer git push!"
echo ""
