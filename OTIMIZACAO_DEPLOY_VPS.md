# 🚀 OTIMIZAÇÃO DE ESPAÇO E PERFORMANCE DA VPS

## 📊 Análise Atual (30/12/2025)

### Tamanho Total
- **Projeto completo**: 3.1GB
- **Builds**: ~655MB (.next)
- **Node modules**: 676MB
- **Código antigo**: ~1.5GB (boraagendar + Balasis)

---

## 🗑️ LIMPEZA RECOMENDADA (Economiza ~1.5GB)

### 1. Remover Código Antigo (Django)
```bash
# Remover pasta boraagendar (código antigo)
rm -rf /Users/user/Desktop/Programação/AIGenda/boraagendar

# Remover pasta Balasis (não identificada)
rm -rf /Users/user/Desktop/Programação/AIGenda/Balasis

# Salva ~1.5GB
```

### 2. Limpar Node Modules (Reinstalar conforme necessário)
```bash
# Remover e reinstalar node_modules
rm -rf /Users/user/Desktop/Programação/AIGenda/node_modules
pnpm install --prefer-offline

# Salva ~200MB durante a transferência
```

### 3. Limpar Builds Antigos
```bash
# Remover build anterior
rm -rf /Users/user/Desktop/Programação/AIGenda/apps/web/.next

# Será regenerado no próximo build
npm run build

# Salva ~100MB durante a transferência
```

---

## 📦 OTIMIZAÇÕES PARA DEPLOYS

### 1. Arquivo .dockerignore (se usar Docker)
```
node_modules
.next
.git
.env
.env.local
docs
```

### 2. Arquivo .gitignore (se usar Git)
```
node_modules
.next
dist
build
.env
.env.local
.DS_Store
pnpm-lock.yaml (opcional, para CI/CD)
```

### 3. Arquivo .npmignore ou .pnpmignore
```
**/*.test.ts
**/*.test.tsx
.eslintrc
tsconfig.json
.turbo
docs
```

---

## 💾 ESTRATÉGIA DE DEPLOY NA VPS

### Opção 1: Monolítico (Simples)
```
VPS/
├── web/      (Next.js build)
├── api/      (Node.js)
└── nginx/    (Reverse proxy)

Tamanho: ~200MB (sem node_modules)
```

### Opção 2: Containerizado (Recomendado)
```
Docker Images:
├── api:latest       (~150MB)
├── web:latest       (~180MB)
└── nginx:latest     (~25MB)

Total: ~355MB (3 imagens)
```

### Opção 3: Monorepo Otimizado
```
Instalar APENAS dependências de produção:
pnpm install --prod
pnpm prune --prod

Reduz de 676MB para ~150MB
```

---

## 🚀 CHECKLIST DE OTIMIZAÇÃO

- [ ] Remover `boraagendar` (837MB)
- [ ] Remover `Balasis` (679MB)
- [ ] Fazer deploy sem node_modules
- [ ] Usar pnpm prune no servidor
- [ ] Configurar nginx como reverse proxy
- [ ] Limpar builds antigos regularmente
- [ ] Implementar CI/CD com limpeza automática

---

## 📈 IMPACTO ESPERADO

```
Antes:   3.1GB (no deploy)
         ~1.5GB (sem código antigo)

Depois:  ~300-400MB (build + produção)
         
Economia: ~80-90% de espaço!
```

---

## ⚡ COMANDOS RÁPIDOS PARA LIMPAR

```bash
# 1. Verificar tamanho antes
du -sh /caminho/do/projeto

# 2. Limpar tudo
rm -rf node_modules .next boraagendar Balasis

# 3. Reinstalar apenas produção
pnpm install --prod
pnpm prune --prod

# 4. Build otimizado
npm run build

# 5. Verificar tamanho depois
du -sh /caminho/do/projeto
```

---

## 🔍 PRÓXIMOS PASSOS

1. ✅ Remover código antigo (economiza 1.5GB imediato)
2. ✅ Implementar CI/CD para deploys automáticos
3. ✅ Usar Docker para isolamento
4. ✅ Configurar backup automático
5. ✅ Monitorar espaço em disco

---

**Último Update**: 30/12/2025
**Status**: Análise Completa ✅
