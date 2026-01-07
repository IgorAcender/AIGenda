# ✅ Checklist de Implementação - Evolution API

## 📋 Fase 1: Configuração Inicial

- [x] Schema Prisma atualizado com EvolutionInstance e TenantEvolutionMapping
- [x] Migração Prisma criada (`schema.prisma` modificado)
- [x] Seed script atualizado para criar 10 Evolution instances
- [x] Variáveis de ambiente configuradas (`.env.example`)

**Próximos passos:**
```bash
# Executar no /apps/api
pnpm db:push              # Aplicar schema ao banco
pnpm db:seed              # Criar 10 Evolution instances
```

---

## 🔧 Fase 2: Backend Implementation

### Serviços Criados

- [x] `evolution.service.ts` (Camada de comunicação com Evolution API)
  - ✅ generateQRCode()
  - ✅ sendMessage()
  - ✅ disconnect()
  - ✅ getStatus()
  - ✅ sendTemplate()
  - ✅ healthCheck()
  - ✅ getAllStatus()

- [x] `evolution-allocation.service.ts` (Alocação e gerenciamento de tenants)
  - ✅ findAvailableEvolutionInstance()
  - ✅ allocateTenantToEvolution()
  - ✅ generateQRCodeForTenant()
  - ✅ handleTenantConnected()
  - ✅ handleTenantDisconnected()
  - ✅ deleteTenantEvolutionConnection()
  - ✅ getTenantEvolutionStatus()
  - ✅ getAllEvolutionStatus()

### Endpoints Criados

- [x] `whatsapp.ts` (Rotas Fastify)
  - ✅ POST `/setup` - Conectar novo WhatsApp
  - ✅ POST `/refresh-qr` - Regenerar QR Code
  - ✅ GET `/status/:tenantId` - Verificar status
  - ✅ POST `/send-message` - Enviar mensagem
  - ✅ POST `/disconnect` - Desconectar WhatsApp
  - ✅ GET `/instances` - Listar instâncias
  - ✅ GET `/health` - Health check

### Webhooks Implementados

- [x] POST `/webhooks/evolution/connected` - WhatsApp conectado
- [x] POST `/webhooks/evolution/disconnected` - WhatsApp desconectado
- [x] POST `/webhooks/evolution/messages` - Mensagem recebida

### Integração no Servidor Principal

- [x] Importar `whatsappRoutes` em `index.ts`
- [x] Registrar rotas com prefixo `/api/whatsapp`

---

## 🐳 Fase 3: Docker & Deployment

### Docker Compose

- [x] `docker-compose.dev.yml` (3 Evolution instances para dev)
  - Services:
    - ✅ web (frontend)
    - ✅ api (backend)
    - ✅ postgres-app
    - ✅ redis-app
    - ✅ postgres-evolution
    - ✅ redis-evolution
    - ✅ evolution-1 (porta 8001)
    - ✅ evolution-2 (porta 8002)
    - ✅ evolution-3 (porta 8003)

- [x] `docker-compose.prod.yml` (10 Evolution instances para prod)
  - Services:
    - ✅ web (frontend)
    - ✅ api (backend)
    - ✅ evolution-1 a evolution-10 (portas 8001-8010)

---

## 🧪 Fase 4: Testes Locais

### Preparação

```bash
cd /Users/user/Desktop/Programação/AIGenda

# 1. Instalar dependências
pnpm install

# 2. Configurar banco de dados (se necessário)
cd apps/api
pnpm db:push
pnpm db:seed
cd ../..

# 3. Iniciar ambiente Docker
docker-compose -f docker-compose.dev.yml up -d
```

### Testes Manuais

```bash
# 1. Verificar saúde do sistema
curl http://localhost:3001/health

# 2. Verificar Health Check das Evolutions
curl http://localhost:3001/api/whatsapp/health

# 3. Listar instâncias disponíveis
curl http://localhost:3001/api/whatsapp/instances

# 4. Conectar novo WhatsApp (substitua com ID real)
curl -X POST http://localhost:3001/api/whatsapp/setup \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "test-tenant-001"}'

# Resposta esperada:
# {
#   "success": true,
#   "qr": "base64-encoded-image",
#   "evolutionId": 1,
#   "message": "QR Code gerado com sucesso..."
# }

# 5. Verificar status
curl http://localhost:3001/api/whatsapp/status/test-tenant-001

# 6. Enviar mensagem de teste
curl -X POST http://localhost:3001/api/whatsapp/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "test-tenant-001",
    "phoneNumber": "5511999999999",
    "message": "Teste de mensagem"
  }'

# 7. Desconectar
curl -X POST http://localhost:3001/api/whatsapp/disconnect \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "test-tenant-001"}'
```

### Verificação de Logs

```bash
# Logs da API
docker logs agende-ai-api -f

# Logs da Evolution 1
docker logs evolution-1 -f

# Logs da Evolution 2
docker logs evolution-2 -f

# Todos os serviços
docker-compose -f docker-compose.dev.yml logs -f
```

### Teste de Webhook

```bash
# Simular webhook de conexão
curl -X POST http://localhost:3001/api/whatsapp/webhooks/evolution/connected \
  -H "Content-Type: application/json" \
  -d '{
    "instance": "tenant-test-tenant-001",
    "data": {
      "phoneNumber": "5511999999999",
      "instanceName": "tenant-test-tenant-001"
    }
  }'

# Verificar se mudou para conectado
curl http://localhost:3001/api/whatsapp/status/test-tenant-001
# Esperar: "isConnected": true
```

---

## 🚀 Fase 5: Deployment em Produção

### Via EasyPanel

1. **Configurar Variáveis de Ambiente:**
   ```
   EVOLUTION_API_KEY=sua-chave-api
   EVOLUTION_1_URL=http://evolution-1:8001
   EVOLUTION_2_URL=http://evolution-2:8002
   ... (até EVOLUTION_10_URL)
   ```

2. **Atualizar docker-compose.prod.yml**
   - Copiado para produção
   - 10 Evolution instances configuradas
   - Health checks ativados

3. **Deploy:**
   ```bash
   cd /seu-repo
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Verificar:**
   ```bash
   # Health check
   curl https://seu-api.com/health
   
   # Instâncias
   curl https://seu-api.com/api/whatsapp/instances
   ```

---

## 📊 Fase 6: Monitoramento

### Métricas Importantes

- [ ] Número de tenants conectados por Evolution
- [ ] Taxa de ocupação das Evolutions
- [ ] Falhas de conexão
- [ ] Latência de envio de mensagens
- [ ] Status de cada Evolution instance

### Dashboard (TODO)

```
Interface Admin para:
- Ver todas as 10 Evolution instances
- Estatísticas de tenants por instance
- Histórico de conexões/desconexões
- Logs de mensagens enviadas
- Health check em tempo real
```

---

## 🔐 Fase 7: Segurança

- [ ] EVOLUTION_API_KEY protegida em variáveis de ambiente
- [ ] Webhooks validam origem (adicionar token)
- [ ] Rate limiting nos endpoints
- [ ] Validação de entrada (tenantId, phoneNumber)
- [ ] Logs de todas as operações (auditoria)
- [ ] HTTPS em produção
- [ ] Backup automático de dados Evolution

---

## 📈 Escalabilidade Futura

Se precisar suportar mais de 1.000 tenants:

1. **Adicionar mais Evolution instances:**
   ```
   Mude: EVOLUTION_INSTANCES_COUNT = 20
   Crie: evolution-11 a evolution-20
   ```

2. **Distribuir entre múltiplos VPS:**
   - Evolution instances em VPS separados
   - PostgreSQL Evolution em servidor dedicado
   - Redis Evolution em servidor dedicado

3. **Load balancing:**
   - Nginx/HAProxy na frente das Evolutions
   - API em múltiplos containers

---

## 🐛 Troubleshooting

### Evolution não conecta

```bash
# Verificar se serviço está rodando
docker ps | grep evolution

# Ver logs
docker logs evolution-1

# Testar conectividade
curl http://localhost:8001/health
```

### Webhook não é chamado

- [ ] Verificar URL do webhook na configuração Evolution
- [ ] Checar firewall (porta 3001 aberta)
- [ ] Validar JWT_SECRET está correto
- [ ] Ver logs da API: `docker logs agende-ai-api`

### Banco de dados não inicializa

```bash
# Re-aplicar schema
pnpm db:push

# Recriar seed
pnpm db:seed

# Verificar conexão
psql postgresql://user:password@localhost:5432/agende_ai_app
```

---

## ✨ Checklist Final

- [ ] Todas as 10 Evolution instances criadas no banco
- [ ] Endpoints testados manualmente
- [ ] Webhooks recebem e processam corretamente
- [ ] QR Code gerado e escaneável
- [ ] Mensagens enviadas com sucesso
- [ ] Docker Compose dev funciona
- [ ] Docker Compose prod funciona
- [ ] Variáveis de ambiente configuradas
- [ ] Health check retorna status correto
- [ ] Logs funcionando
- [ ] Rate limiting ativo
- [ ] Backup de dados configurado

---

## 📚 Referências

- [Evolution API Docs](https://evolution.api.docs)
- [Prisma ORM](https://www.prisma.io/docs)
- [Fastify](https://www.fastify.io/docs)
- [Docker Compose](https://docs.docker.com/compose)

---

**Status:** ✅ Implementação Completa
**Última atualização:** 2024
**Próxima review:** Após primeiro teste em produção
