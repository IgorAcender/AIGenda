# 🔧 Configuração do HTMX Frontend no EasyPanel

## ❌ Problema Atual

O frontend HTMX não consegue se conectar à API porque está usando a URL externa (`http://api.aigenda.easypanel.host`) que não funciona de dentro do container.

**Erros vistos:**
- HTTP 404 - Rota não encontrada
- HTTP 500 - Erro interno ao tentar conectar à API
- Exit code 6 - Could not resolve host

## ✅ Solução

No EasyPanel, serviços se comunicam via **rede interna** usando o nome do serviço.

### Passo 1: Acessar EasyPanel

1. Acesse: `https://panel.agendeai.online`
2. Faça login
3. Vá até o projeto `aigenda`

### Passo 2: Encontrar o Nome do Serviço da API

1. Clique no serviço da **API** (backend)
2. Olhe o nome do serviço (geralmente algo como `api` ou `aigenda-api`)
3. Anote este nome

### Passo 3: Configurar Variável de Ambiente no Frontend

1. Clique no serviço do **Frontend** (web/HTMX)
2. Vá em **Environment Variables** (Variáveis de Ambiente)
3. Adicione uma nova variável:

```
Nome: API_URL
Valor: http://NOME_DO_SERVICO_API:3001
```

**Exemplos de valores possíveis:**
- `http://api:3001` (se o serviço se chama "api")
- `http://aigenda-api:3001` (se o serviço se chama "aigenda-api")
- `http://backend:3001` (se o serviço se chama "backend")

### Passo 4: Redeploy do Frontend

1. Ainda no serviço do Frontend
2. Clique em **Redeploy** ou **Restart**
3. Aguarde o deploy terminar (~1-2 minutos)

### Passo 5: Verificar Logs

1. Vá em **Logs** do serviço Frontend
2. Procure por estas linhas no início:

```
🔧 Configuração do Frontend HTMX:
   API_URL: http://api:3001
   NODE_ENV: production
   PORT: 3000
```

3. Verifique se `API_URL` está mostrando a URL interna correta

### Passo 6: Testar Login

1. Acesse: `https://app.agendeai.online/login`
2. Faça login com:
   - Email: `dono@barbearia-exemplo.com`
   - Senha: `Dono@123`
3. Deveria redirecionar para `/dashboard`

## 🔍 Como Descobrir o Nome do Serviço da API

### Opção 1: Via Interface do EasyPanel
- Vá até Services
- O nome que aparece na lista É o nome do serviço

### Opção 2: Via Terminal no Container Frontend
1. No EasyPanel, abra o Terminal do serviço Frontend
2. Execute: `ping api` ou `ping backend`
3. Se resolver, esse é o nome correto

### Opção 3: Via Docker Compose (se aplicável)
Se você usou docker-compose, o nome do serviço está no arquivo `docker-compose.yml`

## 📝 Configurações Alternativas

### Se a API estiver em outro projeto:
```
API_URL=http://NOME_DO_PROJETO_API.aigenda.easypanel.host
```

### Se houver um gateway/proxy:
```
API_URL=http://gateway:3001
```

## ✅ Checklist de Validação

- [ ] Variável `API_URL` configurada no Frontend
- [ ] Valor aponta para rede interna (`http://SERVICO:PORTA`)
- [ ] Frontend fez redeploy
- [ ] Logs mostram URL correta
- [ ] Página de login carrega sem erro 500
- [ ] Login funciona e redireciona

## 🐛 Troubleshooting

### Ainda dá erro 500?
- Verifique se o nome do serviço está correto
- Teste fazer `ping` do container frontend para API
- Verifique se ambos estão na mesma rede Docker

### Erro "Could not resolve host"?
- Nome do serviço está errado
- Serviços não estão na mesma rede
- Use IP interno ao invés do nome

### Como pegar o IP interno?
No terminal do container da API:
```bash
hostname -i
```

Então use: `API_URL=http://IP_INTERNO:3001`

---

**Após configurar, o sistema deve funcionar perfeitamente!** 🚀
