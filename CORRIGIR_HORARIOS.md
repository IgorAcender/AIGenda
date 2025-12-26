# 🔧 CORRIGIR: Horários não aparecem no agendamento

## ❌ Problema
O calendário de agendamento não mostra horários disponíveis porque faltam as configurações de `TenantConfig` e `BookingPolicy` no banco de dados.

## ✅ Solução

### Opção 1: Via Easypanel (RECOMENDADO)

1. Acesse o Easypanel
2. Vá no service **PostgreSQL**
3. Clique em **Console** ou **pgAdmin**
4. Execute o SQL abaixo:

```sql
-- 1. Criar TenantConfig para todos os tenants
INSERT INTO "TenantConfig" (
  id,
  "tenantId",
  "workStartTime",
  "workEndTime",
  "workDays",
  "slotDuration",
  "bufferTime",
  "maxAdvanceBooking",
  "createdAt",
  "updatedAt"
)
SELECT 
  gen_random_uuid(),
  t.id,
  '08:00',
  '18:00',
  '1,2,3,4,5',
  30,
  0,
  60,
  NOW(),
  NOW()
FROM "Tenant" t
WHERE NOT EXISTS (
  SELECT 1 FROM "TenantConfig" tc WHERE tc."tenantId" = t.id
);

-- 2. Criar BookingPolicy para todos os tenants
INSERT INTO "BookingPolicy" (
  id,
  "tenantId",
  "slotDurationMinutes",
  "bufferBetweenSlots",
  "maxConcurrentBookings",
  "requiresApproval",
  "allowCancellation",
  "cancellationDeadlineHours",
  "minAdvanceBookingHours",
  "maxAdvanceBookingDays",
  "createdAt",
  "updatedAt"
)
SELECT 
  gen_random_uuid(),
  t.id,
  30,
  0,
  1,
false,
  true,
  24,
  1,
  90,
  NOW(),
  NOW()
FROM "Tenant" t
WHERE NOT EXISTS (
  SELECT 1 FROM "BookingPolicy" bp WHERE bp."tenantId" = t.id
);

-- 3. Verificar (deve mostrar os dados)
SELECT 
  t.name AS tenant_name,
  tc."workStartTime",
  tc."workEndTime",
  bp."slotDurationMinutes"
FROM "Tenant" t
LEFT JOIN "TenantConfig" tc ON tc."tenantId" = t.id
LEFT JOIN "BookingPolicy" bp ON bp."tenantId" = t.id;
```

### Opção 2: Via comando no terminal do Easypanel

```bash
# Conectar no service da API e executar
cd /app/apps/api
npx prisma db execute --file prisma/seed-booking-config.sql
```

## 📋 Configurações que serão criadas

- **Horário de funcionamento**: 08:00 às 18:00
- **Dias de trabalho**: Segunda a Sexta (1,2,3,4,5)
- **Duração do slot**: 30 minutos
- **Buffer entre slots**: 0 minutos
- **Antecedência mínima**: 1 hora
- **Antecedência máxima**: 90 dias

## ✅ Como testar

Depois de executar o SQL:

1. Acesse: https://seu-dominio.com/agendar/barbearia-exemplo
2. Selecione um serviço
3. Selecione um profissional
4. Selecione uma data
5. **Os horários devem aparecer agora!** ⏰

## 🔍 Se ainda não funcionar

Verifique os logs da API:
```bash
# No Easypanel, vá em Logs do service da API
# Procure por: [AVAILABILITY] ou [SLOTS]
```

Possíveis problemas:
- [ ] TenantConfig não foi criado → Execute o SQL novamente
- [ ] BookingPolicy não foi criado → Execute o SQL novamente
- [ ] Professional não está ativo → Ative no cadastro
- [ ] Service não existe → Crie um serviço

---

**Arquivo**: `apps/api/prisma/seed-booking-config.sql` (já commitado)
