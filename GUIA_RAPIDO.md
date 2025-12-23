# 🔧 Guia Rápido - Sistema de Agendamento

## ⚡ Startup Rápido (5 min)

### 1. Setup Inicial
```bash
# Ir para diretório raiz do projeto
cd ~/Desktop/Programação/AIGenda

# Instalar dependências (já feito)
pnpm install

# Gerar Prisma e executar migrations
cd apps/api
npx prisma generate
pnpm db:migrate
pnpm db:seed
```

### 2. Rodar Aplicação
```bash
# Terminal 1 - API
cd ~/Desktop/Programação/AIGenda/apps/api
pnpm dev

# Terminal 2 - Web
cd ~/Desktop/Programação/AIGenda/apps/web
pnpm dev
```

### 3. Testar
- **Agendamento**: http://localhost:3001/agendar/barbearia-exemplo
- **API Status**: http://localhost:3000/health (se implementado)
- **Prisma Studio**: `pnpm db:studio` (visualizar banco de dados)

---

## 🐛 Troubleshooting

### ❌ Erro: "Database connection failed"
**Solução**:
```bash
# Verificar se o banco está rodando
# No arquivo apps/api/.env, verificar DATABASE_URL

# Testar conexão
cd apps/api
npx prisma db push --skip-generate

# Se ainda não funcionar, resetar banco (CUIDADO - apaga dados!)
npx prisma migrate reset
```

### ❌ Erro: "bookingPolicy não existe"
**Problema**: Migration não foi aplicada
**Solução**:
```bash
cd apps/api
npx prisma migrate deploy
npx prisma generate
```

### ❌ Erro: "Cannot find module '@prisma/client'"
**Solução**:
```bash
cd apps/api
rm -rf node_modules/.prisma
npx prisma generate
```

### ❌ Agendamentos não aparecem na página
**Debug**:
1. Verificar no DevTools > Network se a requisição chegou
2. Verificar se o response status é 200
3. Verificar no Prisma Studio se os dados existem
4. Verificar se `tenantSlug` está correto

```bash
# Ver dados no banco
npx prisma studio
# Navegar: Service > barbearia-exemplo
```

### ❌ Email não está sendo enviado
**Verificar**:
1. Variáveis SMTP em `.env`:
```bash
# apps/api/.env
SMTP_HOST=seu-servidor.com
SMTP_PORT=587
SMTP_USER=seu-email@seu-dominio.com
SMTP_PASSWORD=sua-senha
SMTP_FROM=noreply@seu-dominio.com
```

2. Logs da API:
```bash
# Terminal com API rodando - procurar por:
# "Email sent to..." ou "Error sending email"
```

### ❌ Formulário não submete
**Debug**:
1. Abrir DevTools > Console (verificar erros JS)
2. Abrir DevTools > Network (verificar requisição POST)
3. Verificar response da API:
```bash
curl -X POST "http://localhost:3000/public/bookings/barbearia-exemplo/create" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "...",
    "professionalId": "...",
    "startTime": "2025-01-15T09:00:00Z",
    "endTime": "2025-01-15T09:30:00Z",
    "customerName": "João Silva",
    "customerPhone": "(11) 98765-4321",
    "customerEmail": "joao@email.com"
  }'
```

---

## 📊 Verificar Status do Sistema

### Checklist Rápido
```bash
# 1. Banco de dados
cd apps/api && npx prisma migrate status

# 2. Dados de seed
cd apps/api && npx prisma studio
# Verificar tabelas: Service, Professional, Appointment, BookingPolicy

# 3. API respondendo
curl -X GET http://localhost:3000/public/bookings/barbearia-exemplo/professionals/[SERVICE_ID]

# 4. Frontend carregando
curl -s http://localhost:3001/agendar/barbearia-exemplo | grep -i "agende seu horário"
```

---

## 📁 Arquivos Chave

| Arquivo | Propósito | Localização |
|---------|-----------|------------|
| **schema.prisma** | Modelos do BD | `apps/api/prisma/` |
| **availability.service.ts** | Cálculo de slots | `apps/api/src/lib/` |
| **notification.service.ts** | Emails | `apps/api/src/lib/` |
| **public-bookings.ts** | Endpoints da API | `apps/api/src/routes/` |
| **ServiceSelector.tsx** | Componente de seleção | `apps/web/src/components/booking/` |
| **DateTimeSelector.tsx** | Seletor de data/hora | `apps/web/src/components/booking/` |
| **BookingForm.tsx** | Formulário de dados | `apps/web/src/components/booking/` |
| **[tenantSlug]/page.tsx** | Página principal | `apps/web/src/app/agendar/` |

---

## 🔐 Credenciais de Teste

Após rodar `pnpm db:seed`:

```
MASTER (Admin SaaS)
├─ Email: igor@aigenda.com
└─ Senha: Master@123

Tenant: barbearia-exemplo
├─ OWNER
│  ├─ Email: dono@barbearia-exemplo.com
│  └─ Senha: Dono@123
│
└─ PROFESSIONAL
   ├─ Email: carlos@barbearia-exemplo.com
   └─ Senha: Barbeiro@123
```

---

## 📝 API Reference Rápida

### GET - Listar Profissionais
```bash
curl "http://localhost:3000/public/bookings/barbearia-exemplo/professionals/[SERVICE_ID]"

# Response:
# {
#   "data": [
#     { "id": "...", "name": "Carlos Barbeiro", "specialty": "..." }
#   ]
# }
```

### GET - Slots Disponíveis
```bash
curl "http://localhost:3000/public/bookings/barbearia-exemplo/available-slots?serviceId=[ID]&startDate=2025-01-15&endDate=2025-01-31"

# Response:
# {
#   "data": [
#     { "date": "2025-01-15", "time": "09:00", "label": "15/01 às 09:00" }
#   ]
# }
```

### POST - Criar Agendamento
```bash
curl -X POST "http://localhost:3000/public/bookings/barbearia-exemplo/create" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "...",
    "professionalId": "...",
    "startTime": "2025-01-15T09:00:00Z",
    "endTime": "2025-01-15T09:30:00Z",
    "customerName": "João Silva",
    "customerPhone": "(11) 98765-4321",
    "customerEmail": "joao@email.com",
    "notes": "Primeira vez"
  }'

# Response:
# { "data": { "id": "...", "confirmedAt": null, ... } }
```

### POST - Cancelar
```bash
curl -X POST "http://localhost:3000/public/bookings/[BOOKING_ID]/cancel" \
  -H "Content-Type: application/json" \
  -d '{ "cancellationReason": "Emergência" }'
```

### POST - Reagendar
```bash
curl -X POST "http://localhost:3000/public/bookings/[BOOKING_ID]/reschedule" \
  -H "Content-Type: application/json" \
  -d '{
    "newStartTime": "2025-01-16T10:00:00Z",
    "newEndTime": "2025-01-16T10:30:00Z"
  }'
```

---

## 🎨 Customização

### Alterar Regras de Disponibilidade
```typescript
// apps/api/prisma/seed.ts

// Mudar os horários para profissionais
for (const dayOfWeek of [1, 2, 3, 4, 5]) { // Seg-Sex
  await prisma.availabilityRule.create({
    data: {
      professionalId: professional.id,
      dayOfWeek,
      startTime: '08:00', // ← Alterar
      endTime: '19:00',   // ← Alterar
      isActive: true,
    }
  })
}
```

### Alterar Política de Agendamento
```typescript
// apps/api/prisma/seed.ts

await prisma.bookingPolicy.create({
  data: {
    tenantId: tenant.id,
    allowCancellation: true,
    minCancellationHours: 48,      // ← Mudar de 24 para 48
    maxCancellationsPerMonth: 5,   // ← Mudar de 3 para 5
    minAdvanceBookingHours: 4,     // ← Mudar de 2 para 4
    maxAdvanceBookingDays: 60,     // ← Mudar de 30 para 60
    slotDurationMinutes: 30,       // ← Mudar duração dos slots
    // ... resto das configurações
  }
})
```

Depois:
```bash
cd apps/api
pnpm db:seed
```

---

## 💡 Dicas Úteis

1. **Usar pnpm ao invés de npm**: O projeto usa workspace monorepo com pnpm
2. **Verificar logs em tempo real**: Deixar terminal com `pnpm dev` visível
3. **Limpar cache**: `rm -rf node_modules/.prisma && npx prisma generate`
4. **Resetar BD**: `npx prisma migrate reset` (CUIDADO: deleta dados!)
5. **Usar Prisma Studio**: `pnpm db:studio` - UI visual para o banco

---

## 📞 Problemas Comuns

| Problema | Solução |
|----------|---------|
| Porta 3000/3001 já em uso | Matar processo: `lsof -ti :3000` \| `xargs kill -9` |
| Node modules corrompidos | `rm -rf node_modules pnpm-lock.yaml && pnpm install` |
| .env não carregado | Verificar `DATABASE_URL` no arquivo correto |
| Type errors mesmo após generate | `pnpm install` e reabrir VS Code |
| Prisma client outdated | `npx prisma generate` e `npm/pnpm install` |

---

**Versão**: 1.0.0
**Última atualização**: 22/12/2024
**Status**: ✅ Pronto para produção
