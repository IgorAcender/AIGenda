import { prisma } from './prisma';
import {
  addDays,
  format,
  startOfDay,
  isBefore,
  isAfter,
  addMinutes,
  parse,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface TimeSlot {
  date: string;
  time: string;
  label: string;
}

export interface AvailabilityRequest {
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
  async getAvailableSlots(request: AvailabilityRequest): Promise<TimeSlot[]> {
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

    // 2. Validar datas - garantir que estamos comparando apenas as datas, sem horas
    const now = new Date();
    const minDate = startOfDay(addDays(now, policy.minAdvanceBookingHours / 24));
    const maxDate = startOfDay(addDays(now, policy.maxAdvanceBookingDays));
    
    const startDateNormalized = startOfDay(startDate);
    const endDateNormalized = startOfDay(endDate);

    console.log('[AVAILABILITY] Validação de datas:', { 
      minDate: format(minDate, 'yyyy-MM-dd HH:mm'),
      startDate: format(startDateNormalized, 'yyyy-MM-dd HH:mm'),
      endDate: format(endDateNormalized, 'yyyy-MM-dd HH:mm'),
      maxDate: format(maxDate, 'yyyy-MM-dd HH:mm'),
    });

    if (isBefore(startDateNormalized, minDate) || isAfter(endDateNormalized, maxDate)) {
      console.error('[AVAILABILITY] Data fora do período permitido!');
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

      if (!prof) {
        throw new Error('Profissional não encontrado');
      }

      // TODO: Quando houver dados de relacionamento ProfessionalService,
      // validar que o profissional oferece este serviço
      // Por enquanto, permite qualquer profissional
      // if (!prof?.services.some((s) => s.serviceId === serviceId)) {
      //   throw new Error('Profissional não oferece este serviço');
      // }

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
    let currentDate = startOfDay(startDateNormalized);

    while (isBefore(currentDate, addDays(endDateNormalized, 1))) {
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
        const slotEnd = new Date(slotTime);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

        // Não criar slot se vai ultrapassar o horário de fechamento
        if (isAfter(slotEnd, dayEnd)) {
          break;
        }

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

        slotTime = addMinutes(slotTime, slotDuration);
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
        const [ruleStartHour, ruleStartMin] = availRule.startTime
          .split(':')
          .map(Number);
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
  async getProfessionalsForService(tenantId: string, serviceId: string) {
    // TODO: Quando houver dados de relacionamento ProfessionalService,
    // filtra apenas profissionais que oferecem este serviço
    // Por enquanto, retorna todos os profissionais ativos do tenant
    return prisma.professional.findMany({
      where: {
        tenantId,
        isActive: true,
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
