# 🚀 Easy Panel Deploy - Guia Completo com GitHub

## 📋 Resumo do Processo

O Easy Panel vai:
1. ✅ Clonar o repositório do GitHub
2. ✅ Detectar que é um monorepo Node.js (Nixpacks)
3. ✅ Executar `npm install` automaticamente
4. ✅ Executar `./build.sh` (build process)
5. ✅ Executar `npm start` (comando de inicialização)

---

## 🔧 Configuração no Easy Panel

### Aba: **GitHub**

| Campo | Valor |
|-------|-------|
| **Proprietário** | IgorAcender |
| **Repositório** | AIGenda-SaaS |
| **Ramo** | main |
| **Caminho de Build** | / |

### Aba: **Construção** (Construction)

| Campo | Seleção |
|-------|---------|
| **Método de Build** | ✅ **Nixpacks** (recomendado) |
| **Versão do Nix** | 1.34.1 (ou mais recente) |

### Campos Opcionais

**Comando de Instalação (opcional):**
```bash
npm install --legacy-peer-deps
```

**Comando de Build (opcional):**
```bash
chmod +x build.sh && ./build.sh
```

**Comando de Início (opcional):**
```bash
npm start
```

---

## 📦 Arquivos Necessários no Repositório

✅ Todos esses arquivos JÁ foram criados:

```
AIGenda-SaaS/
├── package.json           ✅ Monorepo root
├── .npmrc                 ✅ Configuração npm
├── .gitignore             ✅ Arquivos ignorados
├── build.sh               ✅ Script de build
├── start.sh               ✅ Script de inicialização
├── Procfile               ✅ Para Easy Panel (opcional)
├── ecosystem.config.js    ✅ PM2 configuration
├── nginx.conf             ✅ Nginx configuration
├── apps/
│   ├── api/
│   │   ├── package.json
│   │   ├── .env.example
│   │   └── prisma/
│   │       └── schema.prisma
│   └── web/
│       ├── package.json
│       ├── .env.example
│       └── next.config.js
└── packages/
    └── shared/
        └── package.json
```

---

## 🌍 Variáveis de Ambiente

### No Easy Panel - Abas: **Environment** ou **Variáveis**

Adicione TODAS estas variáveis:

```
# Backend API
DATABASE_URL=postgresql://user:password@db-host:5432/aigenda_prod
REDIS_URL=redis://redis-host:6379
JWT_SECRET=seu-jwt-secret-muito-seguro-aqui
NODE_ENV=production
API_PORT=3001
CORS_ORIGIN=https://seu-dominio.com

# Frontend
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
NODE_ENV=production
```

**Como gerar JWT_SECRET seguro:**
```bash
openssl rand -base64 32
```

---

## 🗄️ Banco de Dados

### Opção 1: PostgreSQL no próprio servidor Easy Panel
```
DATABASE_URL=postgresql://aigenda:senha123@localhost:5432/aigenda_prod
```

### Opção 2: PostgreSQL em outro servidor
```
DATABASE_URL=postgresql://aigenda:senha123@pg.seu-servidor.com:5432/aigenda_prod
```

### Opção 3: PostgreSQL em nuvem (Render, Railway, etc)
```
DATABASE_URL=postgresql://user:password@dpg-xxxx-a.oregon-postgres.render.com:5432/aigenda_prod
```

---

## ⚡ O que Easy Panel faz Automaticamente

### 1️⃣ **Primeira Deploy (Initial Setup)**

```bash
# Nixpacks detecta Node.js
# 1. Instala Node.js 20 LTS
# 2. Detecta npm workspaces
# 3. Executa: npm install
# 4. Executa: chmod +x build.sh && ./build.sh
# 5. Executa: npm start
```

### 2️⃣ **Atualizações (Git Pull)**

Quando você fizer `git push`:
```bash
# Easy Panel automaticamente:
# 1. Pull do GitHub
# 2. npm install (se package.json mudou)
# 3. ./build.sh (rebuild)
# 4. Reinicia aplicação
```

### 3️⃣ **Zero Downtime Deploys**

```bash
# Easy Panel usa reverse proxy
# 1. Build nova versão
# 2. Inicia nova instância
# 3. Redireciona tráfego
# 4. Encerra versão antiga
```

---

## 🔄 Fluxo de Deploy Step-by-Step

```
┌─────────────────────────────────────────┐
│ 1. Você faz: git push no GitHub         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 2. Easy Panel webhook detecta mudança   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 3. Easy Panel git clone (ou git pull)   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 4. Nixpacks detecta Node.js monorepo    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 5. npm install --legacy-peer-deps       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 6. ./build.sh (build front + back)      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 7. npm start (inicia com PM2)           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 8. ✅ Aplicação rodando!                │
└─────────────────────────────────────────┘
```

---

## 📊 Portas Configuradas

| Aplicação | Porta | Visibilidade |
|-----------|-------|--------------|
| Frontend (Next.js) | 3000 | Interna |
| Backend (Express) | 3001 | Interna |
| Nginx (Reverse Proxy) | 80/443 | Externa ✅ |

O Easy Panel automaticamente expõe a porta 80/443 para seu domínio.

---

## 🔒 Segurança - Configurar no Easy Panel

### SSL/HTTPS
- ✅ Easy Panel configura automaticamente com Let's Encrypt
- ✅ Certificado renovado automaticamente

### Firewall
- ✅ Easy Panel já bloqueia acessos diretos às portas internas (3000/3001)
- ✅ Apenas Nginx (porta 80/443) é público

### Backups
- Configurar backups automáticos do banco de dados
- Geralmente disponível no painel de controle do Easy Panel

---

## 📝 Checklist Pré-Deploy

Antes de conectar ao Easy Panel:

- [ ] Repositório foi feito push para GitHub
- [ ] Arquivo `.env.example` tem todas as variáveis
- [ ] `build.sh` e `start.sh` têm permissão de execução
- [ ] `package.json` tem scripts: `build` e `start`
- [ ] Banco de dados está acessível
- [ ] Git webhook está configurado (geralmente automático)

---

## 🚨 Troubleshooting

### Erro: "npm install failed"
```bash
✅ Solução: Adicionar em "Comando de Instalação"
npm install --legacy-peer-deps
```

### Erro: "build.sh not found"
```bash
✅ Solução: Arquivo precisa estar no Git
git add build.sh && git commit -m "Add build script" && git push
```

### Erro: "Cannot connect to database"
```bash
✅ Solução: Verificar DATABASE_URL na aba Environment
Testar: psql -U user -h host -d database
```

### Erro: "Port 3000/3001 already in use"
```bash
✅ Solução: Easy Panel gerencia portas automaticamente
Se erro persistir: pm2 kill && pm2 start ecosystem.config.js
```

### Erro: "Module not found" durante build
```bash
✅ Solução: Verificar node_modules
npm ci --legacy-peer-deps (ao invés de npm install)
```

---

## 📞 Monitoramento

### Acessar Logs no Easy Panel

1. Vá para a aba "Logs" ou "Build Logs"
2. Veja logs em tempo real da:
   - Clonagem do repositório
   - Instalação de dependências
   - Build process
   - Inicialização da aplicação

### Comandos Úteis (SSH no servidor)

```bash
# Ver status PM2
pm2 status

# Ver logs em tempo real
pm2 logs

# Ver logs específicos
pm2 logs aigenda-web
pm2 logs aigenda-api

# Reiniciar aplicação
pm2 restart all

# Parar aplicação
pm2 stop all

# Listar arquivos
ls -la /home/easy-panel/aigenda/
```

---

## ✅ Depois que Deploy Funcionar

### 1️⃣ Acessar a Aplicação
```
Frontend: https://seu-dominio.com
Backend API: https://seu-dominio.com/api
```

### 2️⃣ Testar
```bash
# Teste de Health Check
curl -H "Authorization: Bearer token" https://seu-dominio.com/api/health

# Login
curl -X POST https://seu-dominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"senha"}'
```

### 3️⃣ Monitorar
- Configurar alertas de downtime
- Monitorar uso de CPU/Memória
- Revisar logs regularmente

### 4️⃣ Fazer Atualizações
```bash
# No seu computador:
git push
# Easy Panel faz o resto automaticamente!
```

---

## 🎉 Pronto!

Seu AIGenda SaaS está:
- ✅ Clonando automaticamente do GitHub
- ✅ Fazendo build automático
- ✅ Iniciando com PM2 24/7
- ✅ Com SSL/HTTPS automático
- ✅ Com reverse proxy (Nginx)
- ✅ Rodando em produção

**BOA SORTE!** 🚀

---

## 📚 Referências Rápidas

- 📖 [DEPLOY.md](./DEPLOY.md) - Guia completo passo-a-passo
- 📖 [EASY-PANEL.md](./EASY-PANEL.md) - Versão anterior (manual)
- 📖 [EASY_PANEL_RESUMO.txt](./EASY_PANEL_RESUMO.txt) - Resumo visual
- 📖 [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura do projeto

