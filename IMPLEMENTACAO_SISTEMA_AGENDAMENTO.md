# 📅 GUIA DE IMPLEMENTAÇÃO - SISTEMA DE AGENDAMENTO AVANÇADO PARA AIGENDA

> **Baseado em:** Documentação "Bora agendar exemplo"  
> **Data:** 22 de dezembro de 2025  
> **Stack:** Node.js + TypeScript + Prisma + Next.js  
> **Tempo estimado:** 8-12 horas

---

## 📋 VISÃO GERAL

Este guia adapta o sistema de agendamento do "Bora agendar exemplo" para a arquitetura atual do AIGenda, mantendo a estrutura multi-tenant e integrando com os modelos existentes.

### ✅ O que será implementado:

1. **Models Aprimorados** - Expandir o modelo `Appointment` com novos campos
2. **Sistema de Disponibilidade** - Cálculo automático de horários livres
3. **Políticas de Cancelamento/Reagendamento** - Regras por tenant
4. **API REST** - Endpoints para agendamento público
5. **Templates/Componentes** - UI para booking (cliente + admin)
6. **Notificações** - Email e WhatsApp para confirmações
7. **Sistema de Pagamento** - Integração com transações

---

## 🔧 FASE 1: ATUALIZAR SCHEMA PRISMA (30 min)

### 1.1 - Adicionar modelo `BookingPolicy`

Este modelo armazena as regras de cancelamento e reagendamento por tenant.

**Arquivo:** `apps/api/prisma/schema.prisma`

```prisma
// ============= POLÍTICAS DE AGENDAMENTO =============
model BookingPolicy {
  id        String   @id @default(cuid())
  tenantId  String   @unique
  
  // Cancelamento
  allowCancellation       Boolean @default(true)
  minCancellationHours    Int     @default(24)
  maxCancellationsPerMonth Int     @default(3)
  
  // Reagendamento
  allowRescheduling       Boolean @default(true)
  minReschedulingHours    Int     @default(24)
  maxReschedulings        Int     @default(2)
  
  // Geral
  minAdvanceBookingHours  Int     @default(1)
  maxAdvanceBookingDays   Int     @default(90)
  slotDurationMinutes     Int     @default(30)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  @@index([tenantId])
}
```

**Adicione também a relação em `Tenant`:**

```prisma
model Tenant {
  // ... campos existentes ...
  bookingPolicy   BookingPolicy?
}
```

### 1.2 - Adicionar modelo `AvailabilityRule`

Para regras customizadas de disponibilidade por profissional.

```prisma
// ============= REGRAS DE DISPONIBILIDADE =============
model AvailabilityRule {
  id             String  @id @default(cuid())
  professionalId String
  dayOfWeek      Int     // 0-6 (domingo-sábado)
  startTime      String  // "09:00"
  endTime        String  // "18:00"
  isActive       Boolean @default(true)
  
  professional Professional @relation(fields: [professionalId], references: [id], onDelete: Cascade)
  
  @@unique([professionalId, dayOfWeek])
  @@index([professionalId])
}
```

**Adicione também a relação em `Professional`:**

```prisma
model Professional {
  // ... campos existentes ...
  availabilityRules  AvailabilityRule[]
}
```

### 1.3 - Estender modelo `Appointment`

Adicione novos campos ao modelo existente:

```prisma
model Appointment {
  // ... campos existentes ...
  
  // Dados do cliente (para agendamentos públicos)
  customerPhone   String?
  customerEmail   String?
  
  // Reagendamento
  originalAppointmentId String?
  rescheduledFrom       Appointment?  @relation("AppointmentReschedules", fields: [originalAppointmentId], references: [id])
  rescheduledTo         Appointment[] @relation("AppointmentReschedules")
  
  // Cancelamento
  cancelledAt       DateTime?
  cancellationReason String?
  
  // Confirmação
  confirmedAt       DateTime?
  confirmationToken String? @unique
  
  // Avaliação
  rating            Int? // 1-5
  review            String?
  
  @@index([confirmationToken])
  @@index([originalAppointmentId])
}
```

### 1.4 - Executar Migrations

```bash
cd apps/api
npx prisma migrate dev --name add_booking_features
```

---

## 🎯 FASE 2: SERVIÇO DE DISPONIBILIDADE (1.5 horas)

### 2.1 - Criar arquivo de serviço

**Arquivo:** `apps/api/src/lib/services/availability.service.ts`

```typescript
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { addDays, format, startOfDay, isBefore, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimeSlot {
  date: string;
  time: string;
  label: string;
}

interface AvailabilityRequest {
  tenantId: string;
  serviceId: string;
  professionalId?: string;
  startDate: Date;
  endDate: Date;
}

export class AvailabilityService {
  /**
   * Calcula slots disponíveis para um serviço/profissional
   */
  async getAvailableSlots(
    request: AvailabilityRequest
  ): Promise<TimeSlot[]> {
    const { tenantId, serviceId, professionalId, startDate, endDate } = request;

    // 1. Buscar configurações
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { bookingPolicy: true, configs: true },
    });

    if (!tenant?.bookingPolicy) {
      throw new Error('Política de agendamento não configurada');
    }

    const policy = tenant.bookingPolicy;
    const config = tenant.configs;
    const slotDuration = policy.slotDurationMinutes;

    // 2. Validar datas
    const now = new Date();
    const minDate = addDays(now, policy.minAdvanceBookingHours / 24);
    const maxDate = addDays(now, policy.maxAdvanceBookingDays);

    if (isBefore(startDate, minDate) || isAfter(endDate, maxDate)) {
      throw new Error('Data fora do período permitido');
    }

    // 3. Buscar serviço
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new Error('Serviço não encontrado');
    }

    // 4. Buscar profissionais disponíveis
    let professionals: any[] = [];

    if (professionalId) {
      const prof = await prisma.professional.findUnique({
        where: { id: professionalId },
        include: { services: true, availabilityRules: true },
      });

      if (!prof?.services.some(s => s.serviceId === serviceId)) {
        throw new Error('Profissional não oferece este serviço');
      }

      professionals = [prof];
    } else {
      professionals = await prisma.professional.findMany({
        where: {
          tenantId,
          isActive: true,
          services: {
            some: { serviceId },
          },
        },
        include: { services: true, availabilityRules: true },
      });
    }

    if (professionals.length === 0) {
      throw new Error('Nenhum profissional disponível');
    }

    // 5. Calcular slots
    const slots: TimeSlot[] = [];
    let currentDate = startOfDay(startDate);

    while (isBefore(currentDate, endDate)) {
      const dayOfWeek = currentDate.getDay();
      const dayLabel = format(currentDate, 'EEEE, dd/MM/yyyy', { locale: ptBR });

      // 5.1 - Verificar horário de funcionamento
      const workDays = config?.workDays?.split(',').map(Number) || [1, 2, 3, 4, 5];
      if (!workDays.includes(dayOfWeek)) {
        currentDate = addDays(currentDate, 1);
        continue;
      }

      // 5.2 - Gerar slots para o dia
      const startTime = config?.workStartTime || '08:00';
      const endTime = config?.workEndTime || '18:00';

      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);

      const dayStart = new Date(currentDate);
      dayStart.setHours(startHour, startMin, 0, 0);

      const dayEnd = new Date(currentDate);
      dayEnd.setHours(endHour, endMin, 0, 0);

      let slotTime = new Date(dayStart);

      while (isBefore(slotTime, dayEnd)) {
        const slotEnd = addDays(slotTime, 0);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

        // 5.3 - Verificar se horário está disponível
        const isAvailable = await this.checkSlotAvailability(
          professionals,
          slotTime,
          slotEnd,
          service.duration
        );

        if (isAvailable) {
          slots.push({
            date: format(currentDate, 'yyyy-MM-dd'),
            time: format(slotTime, 'HH:mm'),
            label: `${dayLabel} às ${format(slotTime, 'HH:mm')}`,
          });
        }

        slotTime = addDays(slotTime, 0);
        slotTime.setMinutes(slotTime.getMinutes() + slotDuration);
      }

      currentDate = addDays(currentDate, 1);
    }

    return slots;
  }

  /**
   * Verifica se um slot está disponível para todos os profissionais
   */
  private async checkSlotAvailability(
    professionals: any[],
    startTime: Date,
    endTime: Date,
    serviceDuration: number
  ): Promise<boolean> {
    for (const prof of professionals) {
      // 1. Verificar regras de disponibilidade
      const dayOfWeek = startTime.getDay();
      const availRule = prof.availabilityRules?.find(
        (r: any) => r.dayOfWeek === dayOfWeek && r.isActive
      );

      if (availRule) {
        const [ruleStartHour, ruleStartMin] = availRule.startTime.split(':').map(Number);
        const [ruleEndHour, ruleEndMin] = availRule.endTime.split(':').map(Number);

        const ruleStart = new Date(startTime);
        ruleStart.setHours(ruleStartHour, ruleStartMin, 0, 0);

        const ruleEnd = new Date(startTime);
        ruleEnd.setHours(ruleEndHour, ruleEndMin, 0, 0);

        if (isBefore(startTime, ruleStart) || isAfter(endTime, ruleEnd)) {
          return false;
        }
      }

      // 2. Verificar agendamentos conflitantes
      const conflict = await prisma.appointment.findFirst({
        where: {
          professionalId: prof.id,
          date: {
            gte: startTime,
            lt: endTime,
          },
          status: {
            in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'],
          },
        },
      });

      if (conflict) return false;
    }

    return true;
  }

  /**
   * Obtém profissionais que podem fazer um serviço
   */
  async getProfessionalsForService(
    tenantId: string,
    serviceId: string
  ) {
    return prisma.professional.findMany({
      where: {
        tenantId,
        isActive: true,
        services: {
          some: { serviceId },
        },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        specialty: true,
      },
    });
  }
}

export const availabilityService = new AvailabilityService();
```

### 2.2 - Integrar com a API

**Arquivo:** `apps/api/src/routes/booking.routes.ts` (criar novo)

```typescript
import { Router, Request, Response } from 'express';
import { availabilityService } from '../lib/services/availability.service';

const router = Router({ mergeParams: true });

/**
 * GET /api/tenants/:tenantId/bookings/professionals
 * Profissionais que oferecem um serviço
 */
router.get('/professionals/:serviceId', async (req: Request, res: Response) => {
  try {
    const { tenantId, serviceId } = req.params;

    const professionals = await availabilityService.getProfessionalsForService(
      tenantId,
      serviceId
    );

    res.json(professionals);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/tenants/:tenantId/bookings/available-slots
 * Horários disponíveis
 */
router.get('/available-slots', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { serviceId, professionalId, startDate, endDate } = req.query;

    if (!serviceId || !startDate || !endDate) {
      return res.status(400).json({
        error: 'serviceId, startDate e endDate são obrigatórios',
      });
    }

    const slots = await availabilityService.getAvailableSlots({
      tenantId,
      serviceId: serviceId as string,
      professionalId: professionalId as string | undefined,
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
    });

    res.json(slots);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
```

---

## 🎨 FASE 3: COMPONENTES FRONT-END (2 horas)

### 3.1 - Componente de Seleção de Serviço

**Arquivo:** `apps/web/src/components/booking/ServiceSelector.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Service } from '@/types';

interface ServiceSelectorProps {
  tenantSlug: string;
  onServiceSelect: (serviceId: string) => void;
  onProfessionalSelect: (professionalId: string) => void;
}

export function ServiceSelector({
  tenantSlug,
  onServiceSelect,
  onProfessionalSelect,
}: ServiceSelectorProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // 1. Carregar serviços
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`/api/services?tenantSlug=${tenantSlug}`);
        const data = await res.json();
        setServices(data);
      } catch (error) {
        console.error('Erro ao carregar serviços:', error);
      }
    };

    fetchServices();
  }, [tenantSlug]);

  // 2. Carregar profissionais quando serviço é selecionado
  const handleServiceChange = async (serviceId: string) => {
    setSelectedService(serviceId);
    onServiceSelect(serviceId);
    setLoading(true);

    try {
      const res = await fetch(
        `/api/tenants/${tenantSlug}/bookings/professionals/${serviceId}`
      );
      const data = await res.json();
      setProfessionals(data);
      
      if (data.length > 0) {
        onProfessionalSelect(data[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Seleção de Serviço */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Serviço
        </label>
        <select
          value={selectedService}
          onChange={(e) => handleServiceChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Selecione um serviço</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} - R$ {service.price.toFixed(2)} ({service.duration}min)
            </option>
          ))}
        </select>
      </div>

      {/* Seleção de Profissional */}
      {selectedService && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profissional
          </label>
          {loading ? (
            <p className="text-gray-500">Carregando profissionais...</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {professionals.map((prof) => (
                <button
                  key={prof.id}
                  onClick={() => onProfessionalSelect(prof.id)}
                  className="p-3 border border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 transition"
                >
                  {prof.avatar && (
                    <img
                      src={prof.avatar}
                      alt={prof.name}
                      className="w-12 h-12 rounded-full mb-2"
                    />
                  )}
                  <p className="font-medium text-sm">{prof.name}</p>
                  {prof.specialty && (
                    <p className="text-xs text-gray-500">{prof.specialty}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### 3.2 - Componente de Seleção de Data/Hora

**Arquivo:** `apps/web/src/components/booking/DateTimeSelector.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { addDays } from 'date-fns';

interface TimeSlot {
  date: string;
  time: string;
  label: string;
}

interface DateTimeSelectorProps {
  tenantSlug: string;
  serviceId: string;
  professionalId?: string;
  onDateTimeSelect: (date: string, time: string) => void;
}

export function DateTimeSelector({
  tenantSlug,
  serviceId,
  professionalId,
  onDateTimeSelect,
}: DateTimeSelectorProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Carregar slots disponíveis
  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      try {
        const startDate = new Date();
        const endDate = addDays(startDate, 30);

        const params = new URLSearchParams({
          serviceId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          ...(professionalId && { professionalId }),
        });

        const res = await fetch(
          `/api/tenants/${tenantSlug}/bookings/available-slots?${params}`
        );
        const data = await res.json();
        setSlots(data);
      } catch (error) {
        console.error('Erro ao carregar horários:', error);
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchSlots();
    }
  }, [tenantSlug, serviceId, professionalId]);

  const handleTimeSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    onDateTimeSelect(date, time);
  };

  const slotsByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  return (
    <div className="space-y-4">
      {loading ? (
        <p className="text-gray-500">Carregando horários disponíveis...</p>
      ) : slots.length === 0 ? (
        <p className="text-red-500">Nenhum horário disponível</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(slotsByDate).map(([date, daySlots]) => (
            <div key={date}>
              <h4 className="font-medium text-gray-900 mb-2">
                {daySlots[0].label.split(' às ')[0]}
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {daySlots.map((slot) => (
                  <button
                    key={`${slot.date}-${slot.time}`}
                    onClick={() => handleTimeSelect(slot.date, slot.time)}
                    className={`py-2 px-3 rounded border text-sm font-medium transition ${
                      selectedDate === slot.date && selectedTime === slot.time
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 3.3 - Página de Agendamento Pública

**Arquivo:** `apps/web/src/app/agendar/[tenantSlug]/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { ServiceSelector } from '@/components/booking/ServiceSelector';
import { DateTimeSelector } from '@/components/booking/DateTimeSelector';
import { BookingForm } from '@/components/booking/BookingForm';

type Step = 'service' | 'datetime' | 'confirm' | 'success';

export default function BookingPage({
  params: { tenantSlug },
}: {
  params: { tenantSlug: string };
}) {
  const [step, setStep] = useState<Step>('service');
  const [serviceId, setServiceId] = useState<string>('');
  const [professionalId, setProfessionalId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');

  const handleServiceSelect = (id: string) => {
    setServiceId(id);
  };

  const handleProfessionalSelect = (id: string) => {
    setProfessionalId(id);
  };

  const handleDateTimeSelect = (selectedDate: string, selectedTime: string) => {
    setDate(selectedDate);
    setTime(selectedTime);
    setStep('confirm');
  };

  const handleBookingConfirm = () => {
    setStep('success');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Agendar Serviço</h1>

          {/* Etapa 1: Serviço */}
          {step === 'service' && (
            <>
              <ServiceSelector
                tenantSlug={tenantSlug}
                onServiceSelect={handleServiceSelect}
                onProfessionalSelect={handleProfessionalSelect}
              />
              <button
                onClick={() => setStep('datetime')}
                disabled={!serviceId}
                className="w-full mt-6 bg-blue-500 text-white py-2 rounded-md disabled:opacity-50"
              >
                Próximo
              </button>
            </>
          )}

          {/* Etapa 2: Data/Hora */}
          {step === 'datetime' && (
            <>
              <DateTimeSelector
                tenantSlug={tenantSlug}
                serviceId={serviceId}
                professionalId={professionalId}
                onDateTimeSelect={handleDateTimeSelect}
              />
              <button
                onClick={() => setStep('service')}
                className="w-full mt-6 bg-gray-300 text-gray-900 py-2 rounded-md"
              >
                Voltar
              </button>
            </>
          )}

          {/* Etapa 3: Confirmação */}
          {step === 'confirm' && (
            <BookingForm
              tenantSlug={tenantSlug}
              serviceId={serviceId}
              professionalId={professionalId}
              date={date}
              time={time}
              onConfirm={handleBookingConfirm}
              onBack={() => setStep('datetime')}
            />
          )}

          {/* Etapa 4: Sucesso */}
          {step === 'success' && (
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Agendamento Confirmado!
              </h2>
              <p className="text-gray-600 mb-6">
                Um email de confirmação foi enviado para você.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-blue-500 text-white py-2 rounded-md"
              >
                Voltar ao Início
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 🔌 FASE 4: ENDPOINTS DA API (1.5 horas)

### 4.1 - CRUD de Agendamentos

**Arquivo:** `apps/api/src/routes/bookings.routes.ts`

```typescript
import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { format, addMinutes } from 'date-fns';

const router = Router({ mergeParams: true });

/**
 * POST /api/tenants/:tenantId/bookings
 * Criar agendamento
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const {
      serviceId,
      professionalId,
      date,
      time,
      customerName,
      customerPhone,
      customerEmail,
      notes,
    } = req.body;

    // Validações
    if (!serviceId || !date || !time || !customerName || !customerPhone) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    // Criar DateTime
    const [hours, minutes] = time.split(':').map(Number);
    const bookingDate = new Date(date);
    bookingDate.setHours(hours, minutes, 0, 0);

    const endTime = addMinutes(bookingDate, service.duration);

    // Salvar agendamento
    const booking = await prisma.appointment.create({
      data: {
        tenantId,
        serviceId,
        professionalId: professionalId || null,
        date: bookingDate,
        startTime: time,
        endTime: format(endTime, 'HH:mm'),
        customerPhone,
        customerEmail,
        status: 'SCHEDULED',
        notes,
      },
      include: {
        service: true,
        professional: true,
      },
    });

    // TODO: Enviar email de confirmação

    res.status(201).json(booking);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});

/**
 * GET /api/tenants/:tenantId/bookings
 * Listar agendamentos
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { status, professionalId, startDate, endDate } = req.query;

    const where: any = { tenantId };

    if (status) where.status = status;
    if (professionalId) where.professionalId = professionalId;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const bookings = await prisma.appointment.findMany({
      where,
      include: {
        client: true,
        service: true,
        professional: true,
      },
      orderBy: { date: 'asc' },
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar agendamentos' });
  }
});

/**
 * PATCH /api/tenants/:tenantId/bookings/:bookingId/cancel
 * Cancelar agendamento
 */
router.patch('/:bookingId/cancel', async (req: Request, res: Response) => {
  try {
    const { tenantId, bookingId } = req.params;
    const { reason } = req.body;

    const booking = await prisma.appointment.findUnique({
      where: { id: bookingId },
      include: { tenant: { include: { bookingPolicy: true } } },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    // Verificar política
    const policy = booking.tenant.bookingPolicy;
    if (!policy?.allowCancellation) {
      return res.status(400).json({ error: 'Cancelamento não permitido' });
    }

    const hoursUntilBooking =
      (booking.date.getTime() - new Date().getTime()) / (1000 * 60 * 60);

    if (hoursUntilBooking < policy.minCancellationHours) {
      return res.status(400).json({
        error: `Cancele com pelo menos ${policy.minCancellationHours} horas de antecedência`,
      });
    }

    // Atualizar agendamento
    const updated = await prisma.appointment.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cancelar agendamento' });
  }
});

/**
 * PATCH /api/tenants/:tenantId/bookings/:bookingId/reschedule
 * Reagendar agendamento
 */
router.patch('/:bookingId/reschedule', async (req: Request, res: Response) => {
  try {
    const { tenantId, bookingId } = req.params;
    const { newDate, newTime } = req.body;

    const booking = await prisma.appointment.findUnique({
      where: { id: bookingId },
      include: { tenant: { include: { bookingPolicy: true } }, service: true },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    // Verificar política
    const policy = booking.tenant.bookingPolicy;
    if (!policy?.allowRescheduling) {
      return res.status(400).json({ error: 'Reagendamento não permitido' });
    }

    const hoursUntilBooking =
      (booking.date.getTime() - new Date().getTime()) / (1000 * 60 * 60);

    if (hoursUntilBooking < policy.minReschedulingHours) {
      return res.status(400).json({
        error: `Reagende com pelo menos ${policy.minReschedulingHours} horas de antecedência`,
      });
    }

    // Criar novo agendamento
    const [hours, minutes] = newTime.split(':').map(Number);
    const newBookingDate = new Date(newDate);
    newBookingDate.setHours(hours, minutes, 0, 0);

    const newBooking = await prisma.appointment.create({
      data: {
        tenantId,
        serviceId: booking.serviceId,
        professionalId: booking.professionalId,
        date: newBookingDate,
        startTime: newTime,
        endTime: format(
          addMinutes(newBookingDate, booking.service.duration),
          'HH:mm'
        ),
        customerPhone: booking.customerPhone,
        customerEmail: booking.customerEmail,
        status: 'SCHEDULED',
        originalAppointmentId: bookingId,
      },
    });

    // Cancelar agendamento anterior
    await prisma.appointment.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancellationReason: 'Reagendado para ' + format(newBookingDate, 'dd/MM/yyyy HH:mm'),
      },
    });

    res.json(newBooking);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao reagendar agendamento' });
  }
});

export default router;
```

---

## 📧 FASE 5: NOTIFICAÇÕES (1 hora)

### 5.1 - Serviço de Notificações

**Arquivo:** `apps/api/src/lib/services/notification.service.ts`

```typescript
import nodemailer from 'nodemailer';
import { Appointment } from '@prisma/client';

export class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  /**
   * Enviar confirmação de agendamento
   */
  async sendBookingConfirmation(appointment: any, tenant: any) {
    if (!appointment.customerEmail) return;

    const html = `
      <h2>Agendamento Confirmado!</h2>
      <p>Olá ${appointment.customerName},</p>
      <p>Seu agendamento foi realizado com sucesso.</p>
      
      <h3>Detalhes do Agendamento:</h3>
      <ul>
        <li><strong>Serviço:</strong> ${appointment.service.name}</li>
        <li><strong>Data:</strong> ${new Date(appointment.date).toLocaleDateString('pt-BR')}</li>
        <li><strong>Horário:</strong> ${appointment.startTime}</li>
        ${appointment.professional ? `<li><strong>Profissional:</strong> ${appointment.professional.name}</li>` : ''}
        <li><strong>Valor:</strong> R$ ${appointment.service.price.toFixed(2)}</li>
      </ul>

      <p>Qualquer dúvida, entre em contato: ${tenant.phone}</p>
    `;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: appointment.customerEmail,
      subject: `Agendamento Confirmado - ${tenant.name}`,
      html,
    });
  }

  /**
   * Enviar lembrete
   */
  async sendReminder(appointment: any, tenant: any) {
    if (!appointment.customerEmail) return;

    const html = `
      <h2>Lembrete de Agendamento</h2>
      <p>Olá ${appointment.customerName},</p>
      <p>Este é um lembrete do seu agendamento amanhã!</p>
      
      <h3>Detalhes:</h3>
      <ul>
        <li><strong>Serviço:</strong> ${appointment.service.name}</li>
        <li><strong>Horário:</strong> ${appointment.startTime}</li>
        <li><strong>Local:</strong> ${tenant.address}</li>
      </ul>

      <p>Endereço: ${tenant.address}, ${tenant.city} - ${tenant.state}</p>
    `;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: appointment.customerEmail,
      subject: `Lembrete - ${tenant.name}`,
      html,
    });
  }
}

export const notificationService = new NotificationService();
```

---

## ⚙️ FASE 6: CONFIGURAÇÕES E POLICIASPHP (1 hora)

### 6.1 - Seed para Políticas

**Arquivo:** `apps/api/prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Encontrar primeiro tenant
  const tenants = await prisma.tenant.findMany();

  for (const tenant of tenants) {
    // Criar policy se não existir
    const existingPolicy = await prisma.bookingPolicy.findUnique({
      where: { tenantId: tenant.id },
    });

    if (!existingPolicy) {
      await prisma.bookingPolicy.create({
        data: {
          tenantId: tenant.id,
          allowCancellation: true,
          minCancellationHours: 24,
          maxCancellationsPerMonth: 3,
          allowRescheduling: true,
          minReschedulingHours: 24,
          maxReschedulings: 2,
          minAdvanceBookingHours: 1,
          maxAdvanceBookingDays: 90,
          slotDurationMinutes: 30,
        },
      });

      console.log(`✅ Policy criada para ${tenant.name}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

Executar:
```bash
npx prisma db seed
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Banco de Dados
- [ ] Adicionar modelos `BookingPolicy` e `AvailabilityRule`
- [ ] Estender modelo `Appointment`
- [ ] Criar migrations
- [ ] Executar migrations
- [ ] Seed de políticas padrão

### Backend API
- [ ] Criar `AvailabilityService`
- [ ] Criar endpoints de agendamento
- [ ] Implementar validações
- [ ] Teste de conflitos de horários
- [ ] Setup de notificações por email

### Frontend
- [ ] Componente `ServiceSelector`
- [ ] Componente `DateTimeSelector`
- [ ] Componente `BookingForm`
- [ ] Página pública de agendamento
- [ ] Dashboard de agendamentos do cliente
- [ ] Painel admin de gerenciamento

### Testes
- [ ] Testes unitários do `AvailabilityService`
- [ ] Testes de API
- [ ] Testes de fluxo completo de agendamento
- [ ] Testes de cancelamento/reagendamento

### Deployment
- [ ] Variáveis de ambiente (.env)
- [ ] Testes em staging
- [ ] Deploy em produção

---

## 🚀 PRÓXIMOS PASSOS

1. **Pagamento Online** - Integrar com Stripe/MercadoPago
2. **WhatsApp** - Notificações e confirmação por WhatsApp
3. **Avaliações** - Sistema de review e rating
4. **Relatórios** - Dashboard com métricas
5. **Automação** - Fluxos automáticos (lembretes, follow-ups)
6. **Mobile** - App nativa (React Native)

---

## 📚 REFERÊNCIAS

- **Pasta:** `/Users/user/Desktop/Programação/AIGenda/Bora agendar exemplo/`
- **Documentação Django:** Arquivos de referência
- **Stack:** Node.js, TypeScript, Prisma, Next.js, React

---

**Criado em:** 22 de dezembro de 2025  
**Última atualização:** Esta documentação
