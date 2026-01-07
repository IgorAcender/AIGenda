# 🚀 Integração Evolution API - Guia Completo

## Visão Geral

A integração da Evolution API permite que cada tenant do seu SaaS conecte seu próprio WhatsApp para automação de agendamentos. O sistema distribui automaticamente os tenants entre 10 instâncias da Evolution API, suportando até 1.000 tenants simultaneamente (100 tenants por instância).

## Arquitetura

```
┌─────────────────────────────────────────────┐
│         Aplicação AIGenda (Node.js)         │
│  ┌─────────────────────────────────────────┐│
│  │         API Backend (Fastify)           ││
│  │  - /api/whatsapp/setup                  ││
│  │  - /api/whatsapp/status/:tenantId       ││
│  │  - /api/whatsapp/disconnect             ││
│  │  - /webhooks/evolution/*                ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
           │
           ├─→ PostgreSQL App (Banco de Dados)
           │   - Tenants, Users, Appointments
           │   - TenantEvolutionMapping
           │   - EvolutionInstance
           │
           └─→ Redis App (Cache/Sessions)
               - user sessions
               - temporary QR codes

           │
           ├─→ Evolution 1 (porta 8001)
           ├─→ Evolution 2 (porta 8002)
           ├─→ Evolution 3 (porta 8003)
           └─→ ... Evolution 10 (porta 8010)
               │
               └─→ PostgreSQL Evolution (Dados das mensagens)
               └─→ Redis Evolution (Filas de mensagens)
```

## Fluxo de Uso

### 1. Novo Tenant Conecta WhatsApp

```
1. Cliente clica "Conectar WhatsApp" no dashboard
2. Frontend chama: POST /api/whatsapp/setup
   Body: { "tenantId": "abc123" }

3. Backend:
   a) Encontra Evolution com menos tenants
   b) Cria TenantEvolutionMapping
   c) Incrementa tenantCount na Evolution
   d) Chama Evolution API para gerar QR Code

4. Backend retorna QR Code para o cliente
   Response: {
     "success": true,
     "qr": "base64 da imagem",
     "code": "codigo da sessão",
     "evolutionId": 1
   }

5. Cliente escaneia QR Code com WhatsApp
6. WhatsApp se conecta
7. Evolution API chama webhook:
   POST /api/webhooks/evolution/connected
   Body: {
     "instance": "tenant-abc123",
     "data": {
       "phoneNumber": "5511999999999",
       "instanceName": "tenant-abc123"
     }
   }

8. Backend marca como conectado:
   - TenantEvolutionMapping.isConnected = true
   - TenantEvolutionMapping.whatsappPhoneNumber = "5511999999999"
   - TenantEvolutionMapping.connectedAt = agora
```

### 2. Enviar Mensagem WhatsApp

```
1. Sistema precisa enviar mensagem (confirmação de agendamento)

2. Backend chama: POST /api/whatsapp/send-message
   Body: {
     "tenantId": "abc123",
     "phoneNumber": "5511988888888",
     "message": "Seu agendamento foi confirmado!"
   }

3. Backend:
   a) Busca TenantEvolutionMapping do tenant
   b) Verifica se WhatsApp está conectado (isConnected = true)
   c) Chama Evolution API para enviar mensagem

4. Retorna resultado ao sistema
```

### 3. Tenant Desconecta WhatsApp

```
1. Cliente clica "Desconectar" no dashboard

2. Frontend chama: POST /api/whatsapp/disconnect
   Body: { "tenantId": "abc123" }

3. Backend:
   a) Busca TenantEvolutionMapping
   b) Chama Evolution para desconectar
   c) Deleta TenantEvolutionMapping
   d) Decrementa tenantCount

4. WhatsApp é desconectado
```

## Modelos Prisma

### EvolutionInstance

```prisma
model EvolutionInstance {
  id               Int       @id @default(autoincrement())
  name             String    @unique      // "evolution-1", "evolution-2", etc
  url              String                 // "http://evolution-1:8001"
  maxConnections   Int       @default(100)
  tenantCount      Int       @default(0)  // Quantos tenants estão nesta instância
  isActive         Boolean   @default(true)
  tenantMappings   TenantEvolutionMapping[]
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}
```

### TenantEvolutionMapping

```prisma
model TenantEvolutionMapping {
  tenantId              String    @id
  tenant                Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  evolutionInstanceId   Int
  evolutionInstance     EvolutionInstance @relation(fields: [evolutionInstanceId], references: [id], onDelete: Restrict)
  
  whatsappPhoneNumber   String?
  isConnected           Boolean   @default(false)
  connectedAt           DateTime?
  disconnectedAt        DateTime?
  
  lastQRCodeGeneratedAt DateTime?
  reconnectAttempts     Int       @default(0)
  lastReconnectAttempt  DateTime?
  
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
}
```

## Endpoints da API

### 1. Setup/Conectar WhatsApp

```
POST /api/whatsapp/setup
Content-Type: application/json

{
  "tenantId": "string"
}

Response 200:
{
  "success": true,
  "qr": "base64 image",
  "code": "unique code",
  "base64": "data:image/png;base64,..."
  "evolutionId": 1,
  "message": "QR Code gerado com sucesso. Escaneie com seu WhatsApp."
}

Response 400:
{
  "success": false,
  "error": "Nenhuma Evolution disponível com espaço"
}
```

### 2. Regenerar QR Code

```
POST /api/whatsapp/refresh-qr
Content-Type: application/json

{
  "tenantId": "string"
}

Response 200:
{
  "success": true,
  "qr": "base64 image",
  "code": "unique code",
  "base64": "data:image/png;base64,..."
  "message": "QR Code regenerado com sucesso"
}
```

### 3. Verificar Status

```
GET /api/whatsapp/status/:tenantId

Response 200:
{
  "success": true,
  "isConnected": true,
  "evolutionId": 1,
  "whatsappPhone": "5511999999999",
  "connectedAt": "2024-01-15T10:30:00Z"
}

Response 404:
{
  "success": false,
  "error": "Tenant não está alocado"
}
```

### 4. Enviar Mensagem

```
POST /api/whatsapp/send-message
Content-Type: application/json

{
  "tenantId": "string",
  "phoneNumber": "5511988888888",
  "message": "Sua mensagem aqui"
}

Response 200:
{
  "success": true,
  "messageId": "message_id_from_evolution"
}

Response 400:
{
  "success": false,
  "error": "WhatsApp não está conectado"
}
```

### 5. Desconectar

```
POST /api/whatsapp/disconnect
Content-Type: application/json

{
  "tenantId": "string"
}

Response 200:
{
  "success": true,
  "message": "Desconectado com sucesso"
}
```

### 6. Listar Instâncias

```
GET /api/whatsapp/instances

Response 200:
{
  "success": true,
  "instances": [
    {
      "id": 1,
      "name": "evolution-1",
      "url": "http://evolution-1:8001",
      "tenantCount": 45,
      "isActive": true,
      "occupancyPercent": 45
    },
    ...
  ]
}
```

### 7. Health Check

```
GET /api/whatsapp/health

Response 200 (se todas online):
{
  "success": true,
  "instances": [
    { "id": 1, "healthy": true },
    { "id": 2, "healthy": true },
    ...
  ]
}

Response 503 (se alguma offline):
{
  "success": false,
  "instances": [
    { "id": 1, "healthy": true },
    { "id": 2, "healthy": false, "error": "Evolution não respondeu" },
    ...
  ]
}
```

## Webhooks da Evolution

A Evolution API chama esses webhooks quando eventos acontecem:

### Connected

```
POST /api/webhooks/evolution/connected
Content-Type: application/json

{
  "instance": "tenant-abc123",
  "data": {
    "instanceName": "tenant-abc123",
    "phoneNumber": "5511999999999"
  }
}
```

### Disconnected

```
POST /api/webhooks/evolution/disconnected
Content-Type: application/json

{
  "instance": "tenant-abc123",
  "data": {
    "instanceName": "tenant-abc123"
  }
}
```

### Mensagens Recebidas

```
POST /api/webhooks/evolution/messages
Content-Type: application/json

{
  "instance": "tenant-abc123",
  "data": {
    "key": { "remoteJid": "5511999999999@s.whatsapp.net", ... },
    "message": { "conversation": "Olá, quero agendar..." },
    "sender": "5511999999999",
    "senderName": "João Silva",
    "timestamp": 1705315800000
  }
}
```

## Variáveis de Ambiente

```bash
# Development (.env.local)
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/agende_ai_app
REDIS_URL=redis://localhost:6379
EVOLUTION_API_KEY=sua-chave-api-evolution
EVOLUTION_1_URL=http://localhost:8001
EVOLUTION_2_URL=http://localhost:8002
EVOLUTION_3_URL=http://localhost:8003
# ... até EVOLUTION_10_URL

# Production (EasyPanel)
DATABASE_URL=postgresql://user:password@db-app:5432/agende_ai_app
REDIS_URL=redis://redis-app:6379
EVOLUTION_API_KEY=sua-chave-api-evolution
EVOLUTION_1_URL=http://evolution-1:8001
EVOLUTION_2_URL=http://evolution-2:8002
# ... até EVOLUTION_10_URL
```

## Inicialização do Banco de Dados

### 1. Criar as Models

As models já estão no `prisma/schema.prisma`:
- `EvolutionInstance`
- `TenantEvolutionMapping`

### 2. Executar Migração

```bash
cd apps/api
pnpm db:push
```

### 3. Executar Seed

```bash
pnpm db:seed
```

Isso criará as 10 instâncias de Evolution no banco de dados.

## Desenvolvimento Local com Docker

### Iniciar Ambiente

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Verificar Saúde

```bash
# Testar se API está rodando
curl http://localhost:3001/health

# Testar health check das Evolutions
curl http://localhost:3001/api/whatsapp/health

# Listar instâncias
curl http://localhost:3001/api/whatsapp/instances
```

## Deployment em Produção

### 1. Configurar Variáveis no EasyPanel

Abra EasyPanel → Aplicações → Seu App → Variáveis de Ambiente

Adicione:
```
EVOLUTION_API_KEY=sua-chave
EVOLUTION_1_URL=http://evolution-1:8001
EVOLUTION_2_URL=http://evolution-2:8002
...
EVOLUTION_10_URL=http://evolution-10:8010
```

### 2. Deploy com Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Verificar Logs

```bash
# API
docker logs agende-ai-api

# Evolution 1
docker logs evolution-1

# Todos
docker-compose -f docker-compose.prod.yml logs -f
```

## Troubleshooting

### Evolution não responde

```bash
# Verificar se container está rodando
docker ps | grep evolution

# Ver logs da Evolution
docker logs evolution-1

# Executar health check
curl http://localhost:8001/health
```

### Webhook não funciona

1. Verificar URL do webhook na configuração Evolution API
   - Deve ser: `http://seu-api.com/api/webhooks/evolution/connected`

2. Verificar logs da API
   ```bash
   docker logs agende-ai-api | grep WEBHOOK
   ```

3. Testar webhook manualmente
   ```bash
   curl -X POST http://localhost:3001/api/webhooks/evolution/connected \
     -H "Content-Type: application/json" \
     -d '{
       "instance": "tenant-teste",
       "data": { "phoneNumber": "5511999999999" }
     }'
   ```

### QR Code não aparece

1. Verificar se Evolution consegue acessar:
   ```bash
   curl http://evolution-1:8001/qrcode/generate
   ```

2. Verificar EVOLUTION_API_KEY está correto

3. Verificar logs da Evolution

## Custo e Performance

- **Custo**: Uma Evolution por VPS custa ~$50-100/mês
- **Performance**: Cada Evolution suporta ~100-500 WhatsApps simultâneos
- **Nossa configuração**: 10 Evolution instances = até 1.000 tenants
- **Escalabilidade**: Fácil adicionar mais instances (mude `EVOLUTION_INSTANCES_COUNT` em allocation-service)

## Próximos Passos

1. ✅ Models Prisma criadas
2. ✅ Serviços de Evolution criados
3. ✅ Endpoints da API criados
4. ✅ Webhooks configurados
5. ⬜ Integrar com sistema de agendamentos
6. ⬜ Criar painel admin para gerenciar Evolutions
7. ⬜ Implementar templates de mensagens
8. ⬜ Adicionar fila de mensagens (Bull/RabbitMQ)
9. ⬜ Implementar AI para responder mensagens automaticamente
10. ⬜ Relatórios de uso de WhatsApp
