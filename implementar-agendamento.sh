#!/bin/bash

# =====================================================
# SCRIPT DE IMPLEMENTAÇÃO SISTEMA DE AGENDAMENTO
# AIGenda - Sistema Multi-tenant
# =====================================================

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funções auxiliares
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️ $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -f "turbo.json" ]; then
    print_error "Não está no diretório raiz do AIGenda!"
    exit 1
fi

print_header "FASE 1: VALIDAÇÃO DO AMBIENTE"

# Verificar dependências
if ! command -v node &> /dev/null; then
    print_error "Node.js não está instalado"
    exit 1
fi
print_success "Node.js encontrado: $(node -v)"

if ! command -v npx &> /dev/null; then
    print_error "npm/npx não está instalado"
    exit 1
fi
print_success "npm/npx encontrado: $(npm -v)"

# Verificar Prisma
cd apps/api
if [ ! -f "prisma/schema.prisma" ]; then
    print_error "Arquivo schema.prisma não encontrado"
    exit 1
fi
print_success "Schema Prisma encontrado"

print_header "FASE 2: PREPARAR PRISMA"

print_info "Instalando dependências..."
npm install 2>/dev/null || yarn install 2>/dev/null
print_success "Dependências instaladas"

print_info "Preparando cliente Prisma..."
npx prisma generate
print_success "Cliente Prisma preparado"

print_header "FASE 3: CRIAR MIGRATIONS"

print_info "Criando migration para novos modelos..."
npx prisma migrate create add_booking_system --create-only

# Informar ao usuário para editar o arquivo de migration
MIGRATION_FILE=$(find prisma/migrations -name "*add_booking_system*" -type d | head -1)

if [ -z "$MIGRATION_FILE" ]; then
    print_error "Falha ao criar migration"
    exit 1
fi

MIGRATION_SQL="$MIGRATION_FILE/migration.sql"
print_info "Arquivo de migration criado em: $MIGRATION_SQL"
print_info "Edite o arquivo e adicione os seguintes campos:"

cat << 'EOF'

-- ============= POLÍTICAS DE AGENDAMENTO =============
CREATE TABLE "BookingPolicy" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "tenantId" TEXT NOT NULL UNIQUE,
  "allowCancellation" BOOLEAN NOT NULL DEFAULT true,
  "minCancellationHours" INTEGER NOT NULL DEFAULT 24,
  "maxCancellationsPerMonth" INTEGER NOT NULL DEFAULT 3,
  "allowRescheduling" BOOLEAN NOT NULL DEFAULT true,
  "minReschedulingHours" INTEGER NOT NULL DEFAULT 24,
  "maxReschedulings" INTEGER NOT NULL DEFAULT 2,
  "minAdvanceBookingHours" INTEGER NOT NULL DEFAULT 1,
  "maxAdvanceBookingDays" INTEGER NOT NULL DEFAULT 90,
  "slotDurationMinutes" INTEGER NOT NULL DEFAULT 30,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "BookingPolicy_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE
);
CREATE INDEX "BookingPolicy_tenantId_idx" ON "BookingPolicy"("tenantId");

-- ============= REGRAS DE DISPONIBILIDADE =============
CREATE TABLE "AvailabilityRule" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "professionalId" TEXT NOT NULL,
  "dayOfWeek" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "AvailabilityRule_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional" ("id") ON DELETE CASCADE,
  UNIQUE("professionalId", "dayOfWeek")
);
CREATE INDEX "AvailabilityRule_professionalId_idx" ON "AvailabilityRule"("professionalId");

-- ============= ESTENDER APPOINTMENT =============
ALTER TABLE "Appointment" ADD COLUMN "customerPhone" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "customerEmail" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "originalAppointmentId" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "cancelledAt" DATETIME;
ALTER TABLE "Appointment" ADD COLUMN "cancellationReason" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "confirmedAt" DATETIME;
ALTER TABLE "Appointment" ADD COLUMN "confirmationToken" TEXT UNIQUE;
ALTER TABLE "Appointment" ADD COLUMN "rating" INTEGER;
ALTER TABLE "Appointment" ADD COLUMN "review" TEXT;

CREATE INDEX "Appointment_confirmationToken_idx" ON "Appointment"("confirmationToken");
CREATE INDEX "Appointment_originalAppointmentId_idx" ON "Appointment"("originalAppointmentId");

EOF

print_info "Aguardando edição do arquivo de migration..."
read -p "Pressione ENTER após editar e salvar o arquivo de migration: "

print_info "Aplicando migrations..."
npx prisma migrate deploy
print_success "Migrations aplicadas com sucesso!"

print_header "FASE 4: CRIAR ARQUIVOS DE SERVIÇO"

# Criar diretório de serviços
mkdir -p src/lib/services

# Criar arquivo de disponibilidade
cat > src/lib/services/availability.service.ts << 'EOF'
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { addDays, format, startOfDay, isBefore, isAfter, addMinutes } from 'date-fns';
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
  async getAvailableSlots(request: AvailabilityRequest): Promise<TimeSlot[]> {
    const { tenantId, serviceId, professionalId, startDate, endDate } = request;

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

    const now = new Date();
    const minDate = addDays(now, policy.minAdvanceBookingHours / 24);
    const maxDate = addDays(now, policy.maxAdvanceBookingDays);

    if (isBefore(startDate, minDate) || isAfter(endDate, maxDate)) {
      throw new Error('Data fora do período permitido');
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new Error('Serviço não encontrado');
    }

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

    const slots: TimeSlot[] = [];
    let currentDate = startOfDay(startDate);

    while (isBefore(currentDate, endDate)) {
      const dayOfWeek = currentDate.getDay();
      const dayLabel = format(currentDate, 'EEEE, dd/MM/yyyy', { locale: ptBR });

      const workDays = config?.workDays?.split(',').map(Number) || [1, 2, 3, 4, 5];
      if (!workDays.includes(dayOfWeek)) {
        currentDate = addDays(currentDate, 1);
        continue;
      }

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
        const slotEnd = new Date(slotTime);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

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

        slotTime.setMinutes(slotTime.getMinutes() + slotDuration);
      }

      currentDate = addDays(currentDate, 1);
    }

    return slots;
  }

  private async checkSlotAvailability(
    professionals: any[],
    startTime: Date,
    endTime: Date,
    serviceDuration: number
  ): Promise<boolean> {
    for (const prof of professionals) {
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

  async getProfessionalsForService(tenantId: string, serviceId: string) {
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
EOF

print_success "Arquivo availability.service.ts criado"

# Criar arquivo de notificações
cat > src/lib/services/notification.service.ts << 'EOF'
import nodemailer from 'nodemailer';

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

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: appointment.customerEmail,
        subject: `Agendamento Confirmado - ${tenant.name}`,
        html,
      });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
    }
  }

  async sendReminder(appointment: any, tenant: any) {
    if (!appointment.customerEmail) return;

    const html = `
      <h2>Lembrete de Agendamento</h2>
      <p>Olá ${appointment.customerName},</p>
      <p>Este é um lembrete do seu agendamento!</p>
      
      <h3>Detalhes:</h3>
      <ul>
        <li><strong>Serviço:</strong> ${appointment.service.name}</li>
        <li><strong>Horário:</strong> ${appointment.startTime}</li>
        <li><strong>Local:</strong> ${tenant.address}</li>
      </ul>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: appointment.customerEmail,
        subject: `Lembrete - ${tenant.name}`,
        html,
      });
    } catch (error) {
      console.error('Erro ao enviar lembrete:', error);
    }
  }
}

export const notificationService = new NotificationService();
EOF

print_success "Arquivo notification.service.ts criado"

print_header "FASE 5: CRIAR ROTAS DA API"

mkdir -p src/routes

cat > src/routes/bookings.ts << 'EOF'
import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { availabilityService } from '../lib/services/availability.service';
import { notificationService } from '../lib/services/notification.service';
import { addMinutes, format } from 'date-fns';

const router = Router({ mergeParams: true });

router.post('/', async (req, res) => {
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

    if (!serviceId || !date || !time || !customerName || !customerPhone) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    const [hours, minutes] = time.split(':').map(Number);
    const bookingDate = new Date(date);
    bookingDate.setHours(hours, minutes, 0, 0);

    const endTime = addMinutes(bookingDate, service.duration);

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

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (tenant) {
      await notificationService.sendBookingConfirmation(booking, tenant);
    }

    res.status(201).json(booking);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});

router.get('/', async (req, res) => {
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

router.patch('/:bookingId/cancel', async (req, res) => {
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

export default router;
EOF

print_success "Arquivo de rotas de agendamento criado"

print_header "FASE 6: CRIAR SEED PARA POLÍTICAS"

cat > prisma/seed-booking.ts << 'EOF'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany();

  for (const tenant of tenants) {
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

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
EOF

print_success "Seed de políticas criado"

print_header "FASE 7: FINALIZAÇÃO"

print_info "Instalando dependências adicionais..."
npm install date-fns nodemailer --save 2>/dev/null || echo "Dependências já instaladas"

print_success "✅ IMPLEMENTAÇÃO CONCLUÍDA!"

echo ""
echo -e "${BLUE}Próximos passos:${NC}"
echo "1. Edite o arquivo de migration: $MIGRATION_SQL"
echo "2. Execute: npx prisma migrate deploy"
echo "3. Execute seed: npx tsx prisma/seed-booking.ts"
echo "4. Integre as rotas no express"
echo "5. Crie os componentes React no frontend"
echo ""
echo -e "${GREEN}Documentação completa:${NC}"
echo "/Users/user/Desktop/Programação/AIGenda/IMPLEMENTACAO_SISTEMA_AGENDAMENTO.md"
echo ""

cd ../..
