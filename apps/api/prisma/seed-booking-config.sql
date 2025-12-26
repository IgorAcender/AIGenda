-- Script SQL para criar configurações de agendamento para todos os tenants

-- 1. Inserir TenantConfig para cada tenant (se não existir)
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

-- 2. Inserir BookingPolicy para cada tenant (se não existir)
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

-- 3. Verificar resultados
SELECT 
  t.name AS tenant_name,
  tc."workStartTime",
  tc."workEndTime",
  bp."slotDurationMinutes"
FROM "Tenant" t
LEFT JOIN "TenantConfig" tc ON tc."tenantId" = t.id
LEFT JOIN "BookingPolicy" bp ON bp."tenantId" = t.id;
