# ⚡ SOLUÇÃO PARA DISCO CRESCENDO NO DEPLOY

## 🔍 **O PROBLEMA**

A cada deploy sua VPS cresce porque:
- `.turbo/cache` → 304MB acumula
- `.next/cache` → 619MB acumula  
- Caches de build não são limpos automaticamente

**Resultado**: +950MB a cada deploy! 🚨

---

## ✅ **A SOLUÇÃO**

Use o script **`limpar-rapido.sh`** ANTES de fazer deploy.

### 1️⃣ **Opção Rápida** (< 1 segundo)
```bash
./limpar-rapido.sh
```

Deleta apenas:
- `.turbo/` (recria em milissegundos)
- `.next/cache/` (recria no build)
- Nada de código ou config

**Economiza**: ~950MB

### 2️⃣ **Antes de fazer push**
```bash
# 1. Limpar cache
./limpar-rapido.sh

# 2. Build local
npm run build

# 3. Testar
npm run dev

# 4. Se OK, fazer deploy
git add .
git commit -m "chore: deploy"
git push
```

---

## 📊 **IMPACTO**

```
ANTES:  3.1GB
DEPOIS: 2.1GB (economiza 1GB!)

Espaço liberado por deploy: ~950MB
```

---

## 🎯 **AUTOMATIZAR NO CI/CD**

Se você usa GitHub Actions ou similar, adicione ao workflow:

```yaml
- name: Limpar caches
  run: |
    rm -rf .turbo
    rm -rf apps/web/.next/cache
    rm -rf apps/api/.next/cache
```

---

## ⚙️ **COMO NÃO ATRASA NADA**

1. ✅ Limpeza leva **< 1 segundo**
2. ✅ Recria automaticamente no `npm run build`
3. ✅ Sem risco (são apenas caches)
4. ✅ Nenhum código deletado

---

## 🚀 **PRÓXIMA VEZ**

```bash
# Antes de fazer deploy
./limpar-rapido.sh && npm run build

# Pronto! Espaço economizado.
```

---

**Última atualização**: 30/12/2025
