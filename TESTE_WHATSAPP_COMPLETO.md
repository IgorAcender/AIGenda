# 🚀 COMO TESTAR WHATSAPP MARKETING

## Passos para testar a página WhatsApp Marketing:

### 1. **Abra http://localhost:3000/login**

### 2. **Faça login com as credenciais de teste:**
   - **Email:** `test@example.com`
   - **Senha:** `password123`

### 3. **Após fazer login, acesse:**
   ```
   http://localhost:3000/marketing/whatsapp
   ```

## ✅ O que você verá:

1. **Painel de Status** - mostra se o WhatsApp está conectado ou desconectado
2. **Botão "Conectar WhatsApp"** - abre um modal com QR Code
3. **Lista de Instâncias** - mostra 10 servidores Evolution disponíveis com percentual de ocupação
4. **Polling Automático** - a cada 5 segundos, o status é verificado
5. **Notificações** - você verá toast notifications com mensagens de sucesso/erro

## 🎯 Funcionalidades que você pode testar:

- ✅ Conectar WhatsApp (abre modal com QR Code)
- ✅ Atualizar QR Code
- ✅ Desconectar WhatsApp
- ✅ Ver status de conexão
- ✅ Visualizar instâncias disponíveis
- ✅ Checker ocupação de servidores

## 🔧 Se não conseguir fazer login:

### Alternativa: criar conta de teste
- Acesse http://localhost:3000/login
- Clique em "Registre-se"
- Crie uma nova conta com qualquer email
- A conta será criada automaticamente

## 📊 Dados de Teste Disponíveis:

### Usuários pré-configurados:

| Email | Senha | Role |
|-------|-------|------|
| test@example.com | password123 | OWNER (Proprietário) |
| master@example.com | master123 | MASTER (Administrador) |
| professional@example.com | pro123 | PROFESSIONAL (Profissional) |

## 🌐 API Endpoints (usados internamente):

```
GET  /api/whatsapp/health        → Status geral
POST /api/whatsapp/setup         → Conectar WhatsApp (gera QR)
GET  /api/whatsapp/status/:tenantId → Status de conexão
POST /api/whatsapp/refresh-qr    → Atualizar QR Code
POST /api/whatsapp/disconnect    → Desconectar
GET  /api/whatsapp/instances     → Listar instâncias
POST /api/whatsapp/send-message  → Enviar mensagem
```

## 🔍 Troubleshooting:

### Se a página retornar erro 500:
1. Certifique-se de que está logado
2. Verifique se a API está rodando em `http://localhost:3001`
3. Tente atualizar a página (F5)

### Se as instâncias não carregarem:
1. Verifique o console do navegador (F12)
2. Procure por erros de CORS
3. Certifique-se de que o token JWT está sendo enviado

### Se o polling não atualizar:
1. O polling automático roda a cada 5 segundos
2. Você pode clicar em "Verificar Status" para forçar uma atualização

## 📝 Logs da API:

Para ver logs da API em tempo real:
```bash
# Terminal 1
pnpm dev

# Você verá logs como:
# [server] GET /api/whatsapp/health 200
# [server] GET /api/whatsapp/status/test-tenant-demo-001 200
# [server] GET /api/whatsapp/instances 200
```

## ✨ Próximos Passos:

Após testar tudo:
1. Integrar com a Evolution API real
2. Implementar webhooks para receber mensagens
3. Criar histórico de mensagens
4. Adicionar agendamento automático via WhatsApp
