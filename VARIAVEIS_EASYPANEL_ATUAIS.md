# 🔧 Ajustes nas Variáveis de Ambiente - EasyPanel

## ✅ Variáveis que estão CORRETAS

```bash
# Database - PERFEITO! ✅
DATABASE_URL=postgresql://postgres:204e9fd37bad6bd5a8bb@robo_de_agendamento_aigenda_postgres:5432/aigenda_postgres_bd

# Redis - PERFEITO! ✅
REDIS_URL=redis://:cc92f71377a4cecdee4f@robo_de_agendamento_aigenda_redis:6379

# JWT Secret - PERFEITO! ✅
JWT_SECRET=jK9mL2pQ3rStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYz=

# Node Environment - PERFEITO! ✅
NODE_ENV=production

# API Port - PERFEITO! ✅
API_PORT=3001
```

---

## ⚠️ Variáveis que PRECISAM SER AJUSTADAS

### 1. CORS_ORIGIN
**Atual:**
```bash
CORS_ORIGIN=https://seu-dominio.com
```

**Precisa mudar para:**
```bash
CORS_ORIGIN=https://robo-de-agendamento-igor.ivhjcm.easypanel.host,https://api-robo-de-agendamento-igor.ivhjcm.easypanel.host
```

**OU se você já tiver um domínio personalizado:**
```bash
CORS_ORIGIN=https://aigenda.com.br,https://api.aigenda.com.br
```

> 💡 **Importante:** Inclua TODAS as URLs que vão acessar a API (frontend + domínios alternativos)

---

### 2. NEXT_PUBLIC_API_URL
**Atual:**
```bash
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com
```

**Precisa mudar para a URL REAL da sua API no EasyPanel:**

**Opção A - URL do EasyPanel (temporária):**
```bash
NEXT_PUBLIC_API_URL=https://api-robo-de-agendamento-igor.ivhjcm.easypanel.host
```

**Opção B - Domínio personalizado (recomendado):**
```bash
NEXT_PUBLIC_API_URL=https://api.aigenda.com.br
```

> ⚠️ **CRÍTICO:** Esta é a URL que o frontend vai usar para chamar a API!

---

### 3. NEXT_PUBLIC_APP_URL
**Atual:**
```bash
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
```

**Precisa mudar para a URL REAL do seu frontend:**

**Opção A - URL do EasyPanel (temporária):**
```bash
NEXT_PUBLIC_APP_URL=https://robo-de-agendamento-igor.ivhjcm.easypanel.host
```

**Opção B - Domínio personalizado (recomendado):**
```bash
NEXT_PUBLIC_APP_URL=https://aigenda.com.br
```

---

## 🎯 CONFIGURAÇÃO COMPLETA RECOMENDADA

### Para API Backend (`aigenda-api`):

```bash
# ✅ Mantenha estas
DATABASE_URL=postgresql://postgres:204e9fd37bad6bd5a8bb@robo_de_agendamento_aigenda_postgres:5432/aigenda_postgres_bd
REDIS_URL=redis://:cc92f71377a4cecdee4f@robo_de_agendamento_aigenda_redis:6379
JWT_SECRET=jK9mL2pQ3rStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYz=
NODE_ENV=production
API_PORT=3001
API_HOST=0.0.0.0

# ⚠️ AJUSTE ESTAS (use sua URL real)
CORS_ORIGIN=https://robo-de-agendamento-igor.ivhjcm.easypanel.host

# 📧 ADICIONE ESTAS (para envio de emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-de-app
EMAIL_FROM=noreply@aigenda.com.br

# ⏱️ ADICIONE ESTAS (opcional)
JWT_EXPIRES_IN=7d
```

---

### Para Web Frontend (`aigenda-web`):

```bash
# ⚠️ AJUSTE ESTAS (use suas URLs reais)
NEXT_PUBLIC_API_URL=https://api-robo-de-agendamento-igor.ivhjcm.easypanel.host
NEXT_PUBLIC_APP_URL=https://robo-de-agendamento-igor.ivhjcm.easypanel.host

# ✅ Mantenha esta
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

---

## 🔍 Como Descobrir suas URLs no EasyPanel

### 1. URL da API
No EasyPanel:
1. Vá em **aigenda-api** (ou nome do seu app de API)
2. Clique na aba **"Domains"**
3. Copie a URL principal (ex: `https://api-robo-de-agendamento-igor.ivhjcm.easypanel.host`)

### 2. URL do Frontend
No EasyPanel:
1. Vá em **aigenda-web** (ou nome do seu app frontend)
2. Clique na aba **"Domains"**
3. Copie a URL principal (ex: `https://robo-de-agendamento-igor.ivhjcm.easypanel.host`)

---

## 📝 CHECKLIST DE ATUALIZAÇÃO

### No EasyPanel - App da API:
```
[ ] Atualizar CORS_ORIGIN com URL real do frontend
[ ] Adicionar API_HOST=0.0.0.0
[ ] Adicionar configurações de SMTP (se usar email)
[ ] Adicionar JWT_EXPIRES_IN=7d
```

### No EasyPanel - App do Frontend:
```
[ ] Atualizar NEXT_PUBLIC_API_URL com URL real da API
[ ] Atualizar NEXT_PUBLIC_APP_URL com URL real do frontend
[ ] Verificar NEXT_TELEMETRY_DISABLED=1
```

### Após Atualizar:
```
[ ] Reiniciar app da API
[ ] Reiniciar app do Frontend
[ ] Testar: curl https://sua-api/health
[ ] Acessar frontend no navegador
[ ] Testar login/cadastro
```

---

## 🧪 Teste Rápido

Depois de ajustar, teste se está tudo certo:

```bash
# 1. Testar API
curl https://api-robo-de-agendamento-igor.ivhjcm.easypanel.host/health

# Resposta esperada:
# {"status":"ok","timestamp":"...","database":"connected","redis":"connected"}

# 2. Testar CORS
curl -H "Origin: https://robo-de-agendamento-igor.ivhjcm.easypanel.host" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://api-robo-de-agendamento-igor.ivhjcm.easypanel.host/api/auth/login

# Resposta esperada deve ter cabeçalhos CORS
```

---

## 🎯 RESUMO DO QUE FAZER AGORA

### Passo 1: Copiar URLs
1. Abra o EasyPanel
2. Anote a URL da API
3. Anote a URL do Frontend

### Passo 2: Atualizar API
1. Vá em **aigenda-api** → **Environment**
2. Atualize:
   ```
   CORS_ORIGIN=https://SUA-URL-FRONTEND
   API_HOST=0.0.0.0
   JWT_EXPIRES_IN=7d
   ```
3. Clique em **Save** e **Restart**

### Passo 3: Atualizar Frontend
1. Vá em **aigenda-web** → **Environment**
2. Atualize:
   ```
   NEXT_PUBLIC_API_URL=https://SUA-URL-API
   NEXT_PUBLIC_APP_URL=https://SUA-URL-FRONTEND
   ```
3. Clique em **Save** e **Restart**

### Passo 4: Testar
```bash
curl https://SUA-URL-API/health
open https://SUA-URL-FRONTEND
```

---

## ❓ Dúvidas Comuns

### "Qual URL usar no CORS_ORIGIN?"
Use a URL do FRONTEND (onde o usuário acessa o site).

### "Qual URL usar no NEXT_PUBLIC_API_URL?"
Use a URL da API (onde a API está rodando).

### "Preciso usar HTTPS?"
Sim! O EasyPanel já configura SSL automaticamente. Sempre use `https://`.

### "Posso usar múltiplas origens no CORS?"
Sim! Separe por vírgula:
```
CORS_ORIGIN=https://url1.com,https://url2.com,https://url3.com
```

---

## 🚨 IMPORTANTE

Depois de ajustar as variáveis:

1. ✅ **Reinicie os apps** no EasyPanel
2. ✅ **Aguarde 1-2 minutos** para os containers reiniciarem
3. ✅ **Teste a API** com curl
4. ✅ **Teste o frontend** no navegador
5. ✅ **Verifique os logs** se algo não funcionar

---

**Está com dúvida sobre suas URLs?** Me envie um print do EasyPanel e eu te ajudo! 📸
