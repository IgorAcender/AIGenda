import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { availabilityService } from '../lib/availability.service';
import { notificationService } from '../lib/notification.service';
import { addMinutes, format } from 'date-fns';

// Schemas de validação
const createPublicBookingSchema = z.object({
  serviceId: z.string(),
  professionalId: z.string().optional(),
  date: z.string(), // formato: yyyy-MM-dd
  time: z.string(), // formato: HH:mm
  customerName: z.string().min(3),
  customerPhone: z.string().min(10),
  customerEmail: z.string().email().optional(),
  notes: z.string().optional(),
});

const availableSlotsSchema = z.object({
  serviceId: z.string(),
  professionalId: z.string().optional(),
  startDate: z.string(), // yyyy-MM-dd
  endDate: z.string(),   // yyyy-MM-dd
});

export async function publicBookingRoutes(app: FastifyInstance) {
  /**
   * GET /:tenantSlug
   * Landing page pública do tenant
   */
  app.get<{ Params: { tenantSlug: string } }>(
    '/:tenantSlug',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { tenantSlug } = request.params;

        // Buscar tenant com include (traz todos os campos escalares + relacionamentos)
        const tenant = await prisma.tenant.findUnique({
          where: { slug: tenantSlug },
          include: {
            services: true,
            categories: true,
            professionals: true,
            businessHours: {
              orderBy: {
                dayOfWeek: 'asc' as const,
              },
            },
            configs: true,
          },
        });

        if (!tenant) {
          return reply.status(404).send({ 
            error: 'Tenant não encontrado',
            statusCode: 404,
          });
        }

        // Retornar dados da landing page
        // Transformar businessHours em um objeto com dias da semana
        const businessHoursMap: { [key: string]: string } = {};
        const daysMap = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        if (tenant.businessHours && tenant.businessHours.length > 0) {
          tenant.businessHours.forEach((bh: any) => {
            const dayName = daysMap[bh.dayOfWeek];
            if (bh.isClosed) {
              businessHoursMap[dayName] = 'Fechado';
            } else {
              let time = `${bh.openTime} - ${bh.closeTime}`;
              if (bh.interval) {
                time += ` (Intervalo: ${bh.interval})`;
              }
              businessHoursMap[dayName] = time;
            }
          });
        }

        // Parsear paymentMethods e amenities de JSON
        let paymentMethods: string[] = [];
        let amenities: string[] = [];
        
        try {
          if (tenant.paymentMethods) {
            paymentMethods = JSON.parse(tenant.paymentMethods);
          }
          if (tenant.amenities) {
            amenities = JSON.parse(tenant.amenities);
          }
        } catch (e) {
          // Se não for JSON válido, trata como string normal
          if (tenant.paymentMethods) paymentMethods = [tenant.paymentMethods];
          if (tenant.amenities) amenities = [tenant.amenities];
        }

        return {
          data: {
            tenant: {
              id: tenant.id,
              name: tenant.name,
              slug: tenant.slug,
              description: tenant.description,
              phone: tenant.phone,
              email: tenant.email,
              address: tenant.address,
              city: tenant.city,
              state: tenant.state,
              zipCode: tenant.zipCode,
              website: tenant.website,
              logo: tenant.logo,
              banner: tenant.banner,
              latitude: tenant.latitude,
              longitude: tenant.longitude,
              socialMedia: {
                instagram: tenant.instagram,
                facebook: tenant.facebook,
                twitter: tenant.twitter,
              },
              paymentMethods,
              amenities,
              businessHours: businessHoursMap,
              whatsapp: tenant.whatsapp || tenant.phone, // Preferir whatsapp, fallback para phone
              about: tenant.about,
            },
            services: tenant.services,
            categories: tenant.categories,
            professionals: tenant.professionals,
            config: tenant.configs?.[0] || null,
          },
        };
      } catch (error) {
        const err = error as Error;
        return reply.status(500).send({ 
          error: 'Erro ao buscar landing page',
          details: err.message 
        });
      }
    }
  );

  /**
   * GET /:tenantSlug/professionals/:serviceId
   * Listar profissionais que oferecem um serviço
   */
  app.get<{ Params: { tenantSlug: string; serviceId: string } }>(
    '/:tenantSlug/professionals/:serviceId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { tenantSlug, serviceId } = request.params;

        const tenant = await prisma.tenant.findUnique({
          where: { slug: tenantSlug },
        });

        if (!tenant) {
          return reply.status(404).send({ error: 'Tenant não encontrado' });
        }

        const professionals =
          await availabilityService.getProfessionalsForService(
            tenant.id,
            serviceId
          );

        return { data: professionals };
      } catch (error) {
        const err = error as Error;
        return reply.status(400).send({ error: err.message });
      }
    }
  );

  /**
   * GET /:tenantSlug/available-slots
   * Listar horários disponíveis
   */
  app.get<{ Params: { tenantSlug: string } }>(
    '/:tenantSlug/available-slots',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { tenantSlug } = request.params;
        const query = availableSlotsSchema.parse(request.query);

        console.log('[SLOTS] Query recebido:', query);

        const tenant = await prisma.tenant.findUnique({
          where: { slug: tenantSlug },
        });

        if (!tenant) {
          return reply.status(404).send({ error: 'Tenant não encontrado' });
        }

        const [startYear, startMonth, startDay] = query.startDate.split('-').map(Number);
        const [endYear, endMonth, endDay] = query.endDate.split('-').map(Number);

        console.log('[SLOTS] Datas parseadas:', { startYear, startMonth, startDay, endYear, endMonth, endDay });

        // Usar horário local (00:00) sem problemas de timezone
        const startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
        const endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

        console.log('[SLOTS] Datas criadas:', { startDate, endDate });

        const slots = await availabilityService.getAvailableSlots({
          tenantId: tenant.id,
          serviceId: query.serviceId,
          professionalId: query.professionalId,
          startDate,
          endDate,
        });

        console.log('[SLOTS] Slots retornados:', slots.length);
        return { data: slots };
      } catch (error) {
        const err = error as Error;
        console.error('[SLOTS] Erro:', err.message);
        return reply.status(400).send({ error: err.message });
      }
    }
  );

  /**
   * GET /:tenantSlug/customer/:phone
   * Busca cliente existente pelo telefone
   */
  app.get<{ Params: { tenantSlug: string; phone: string } }>(
    '/:tenantSlug/customer/:phone',
    async (request: FastifyRequest<{ Params: { tenantSlug: string; phone: string } }>, reply: FastifyReply) => {
      try {
        const { tenantSlug, phone } = request.params;

        const tenant = await prisma.tenant.findUnique({
          where: { slug: tenantSlug },
        });

        if (!tenant) {
          return reply.status(404).send({ 
            error: 'Tenant não encontrado',
            statusCode: 404,
          });
        }

        // Buscar cliente pelo telefone (normalizado)
        const normalizedPhone = phone.replace(/\D/g, '');
        console.log(`[CUSTOMER SEARCH] Phone: ${phone} → Normalized: ${normalizedPhone}`);

        const appointment = await prisma.appointment.findFirst({
          where: {
            tenantId: tenant.id,
            customerPhone: normalizedPhone,
          },
          orderBy: {
            createdAt: 'desc', // Pega o agendamento mais recente
          },
        });

        console.log(`[CUSTOMER SEARCH] Result:`, appointment ? 'FOUND' : 'NOT FOUND');

        if (!appointment) {
          return {
            data: {
              isNewCustomer: true,
              customer: null,
            },
          };
        }

        return {
          data: {
            isNewCustomer: false,
            customer: {
              name: appointment.customerName,
              email: appointment.customerEmail,
              phone: appointment.customerPhone,
            },
          },
        };
      } catch (error) {
        const err = error as Error;
        return reply.status(400).send({ error: err.message });
      }
    }
  );

  /**
   * POST /:tenantSlug/create
   * Criar novo agendamento público
   */
  app.post<{ Params: { tenantSlug: string }; Body: any }>(
    '/:tenantSlug/create',
    async (request: FastifyRequest<{ Params: { tenantSlug: string }; Body: any }>, reply: FastifyReply) => {
      try {
        const { tenantSlug } = request.params;
        console.log('[CREATE BOOKING] Request body:', JSON.stringify(request.body, null, 2));
        const data = createPublicBookingSchema.parse(request.body);
        console.log('[CREATE BOOKING] Parsed data:', data);

        const tenant = await prisma.tenant.findUnique({
          where: { slug: tenantSlug },
          include: { bookingPolicy: true, configs: true },
        });

        if (!tenant) {
          return reply.status(404).send({ error: 'Tenant não encontrado' });
        }

        // Verificar se serviço existe
        const service = await prisma.service.findUnique({
          where: { id: data.serviceId },
        });

        if (!service) {
          return reply
            .status(404)
            .send({ error: 'Serviço não encontrado' });
        }

        // Montar data e hora
        const [year, month, day] = data.date.split('-').map(Number);
        const [hours, minutes] = data.time.split(':').map(Number);

        const bookingDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
        const endDate = addMinutes(bookingDate, service.duration);

        // Criar agendamento
        const appointment = await prisma.appointment.create({
          data: {
            tenantId: tenant.id,
            serviceId: data.serviceId,
            professionalId: data.professionalId || null,
            date: bookingDate,
            startTime: data.time,
            endTime: format(endDate, 'HH:mm'),
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            customerEmail: data.customerEmail || null,
            status: 'SCHEDULED',
            notes: data.notes || null,
            // clientId será null para agendamentos públicos sem cadastro
          },
          include: {
            service: true,
            professional: true,
            tenant: true,
          },
        });

        // Enviar email de confirmação
        await notificationService.sendBookingConfirmation(appointment, tenant);

        return {
          data: {
            id: appointment.id,
            status: 'success',
            message: 'Agendamento criado com sucesso!',
          },
        };
      } catch (error) {
        const err = error as Error;

        // Se for erro de validação Zod
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            error: 'Dados inválidos',
            details: error.errors,
          });
        }

        return reply.status(400).send({ error: err.message });
      }
    }
  );

  /**
   * POST /public/bookings/:bookingId/cancel
   * Cancelar agendamento (público - por telefone)
   */
  app.post<{ Params: { bookingId: string } }>(
    '/public/bookings/:bookingId/cancel',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { bookingId } = request.params;
        const { customerPhone, reason } = request.body as {
          customerPhone: string;
          reason?: string;
        };

        const appointment = await prisma.appointment.findUnique({
          where: { id: bookingId },
          include: {
            tenant: { include: { bookingPolicy: true } },
            service: true,
          },
        });

        if (!appointment) {
          return reply
            .status(404)
            .send({ error: 'Agendamento não encontrado' });
        }

        // Verificar se o telefone coincide
        if (appointment.customerPhone !== customerPhone) {
          return reply.status(403).send({
            error: 'Telefone não corresponde ao do agendamento',
          });
        }

        const policy = appointment.tenant.bookingPolicy;
        if (!policy?.allowCancellation) {
          return reply.status(400).send({
            error: 'Cancelamento não permitido para este tenant',
          });
        }

        // Verificar se pode cancelar (horas mínimas)
        const hoursUntilBooking =
          (appointment.date.getTime() - new Date().getTime()) / (1000 * 60 * 60);

        if (hoursUntilBooking < policy.minCancellationHours) {
          return reply.status(400).send({
            error: `Cancele com pelo menos ${policy.minCancellationHours} horas de antecedência`,
          });
        }

        // Cancelar agendamento
        const updated = await prisma.appointment.update({
          where: { id: bookingId },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
            cancellationReason: reason || null,
          },
          include: {
            tenant: true,
            service: true,
          },
        });

        // Enviar email de cancelamento
        await notificationService.sendCancellationConfirmation(
          updated,
          appointment.tenant,
          reason
        );

        return {
          data: {
            id: updated.id,
            status: 'CANCELLED',
            message: 'Agendamento cancelado com sucesso!',
          },
        };
      } catch (error) {
        const err = error as Error;
        return reply.status(400).send({ error: err.message });
      }
    }
  );

  /**
   * POST /public/bookings/:bookingId/reschedule
   * Reagendar agendamento (público)
   */
  app.post<{ Params: { bookingId: string } }>(
    '/public/bookings/:bookingId/reschedule',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { bookingId } = request.params;
        const { customerPhone, newDate, newTime } = request.body as {
          customerPhone: string;
          newDate: string;
          newTime: string;
        };

        const appointment = await prisma.appointment.findUnique({
          where: { id: bookingId },
          include: {
            tenant: { include: { bookingPolicy: true } },
            service: true,
          },
        });

        if (!appointment) {
          return reply
            .status(404)
            .send({ error: 'Agendamento não encontrado' });
        }

        // Verificar telefone
        if (appointment.customerPhone !== customerPhone) {
          return reply
            .status(403)
            .send({ error: 'Telefone não corresponde' });
        }

        const policy = appointment.tenant.bookingPolicy;
        if (!policy?.allowRescheduling) {
          return reply.status(400).send({
            error: 'Reagendamento não permitido',
          });
        }

        // Verificar horas mínimas
        const hoursUntilBooking =
          (appointment.date.getTime() - new Date().getTime()) / (1000 * 60 * 60);

        if (hoursUntilBooking < policy.minReschedulingHours) {
          return reply.status(400).send({
            error: `Reagende com pelo menos ${policy.minReschedulingHours} horas de antecedência`,
          });
        }

        // Criar novo agendamento
        const [year, month, day] = newDate.split('-').map(Number);
        const [hours, minutes] = newTime.split(':').map(Number);

        const newBookingDate = new Date(
          year,
          month - 1,
          day,
          hours,
          minutes,
          0,
          0
        );
        const newEndDate = addMinutes(newBookingDate, appointment.service.duration);

        // Criar novo agendamento
        const newBooking = await prisma.appointment.create({
          data: {
            tenantId: appointment.tenantId,
            serviceId: appointment.serviceId,
            professionalId: appointment.professionalId,
            date: newBookingDate,
            startTime: newTime,
            endTime: format(newEndDate, 'HH:mm'),
            customerPhone: appointment.customerPhone,
            customerEmail: appointment.customerEmail,
            status: 'SCHEDULED',
            notes: appointment.notes,
            originalAppointmentId: bookingId,
            clientId: appointment.clientId,
          },
          include: {
            tenant: true,
            service: true,
          },
        });

        // Cancelar agendamento anterior
        await prisma.appointment.update({
          where: { id: bookingId },
          data: {
            status: 'CANCELLED',
            cancellationReason: `Reagendado para ${format(
              newBookingDate,
              'dd/MM/yyyy HH:mm'
            )}`,
          },
        });

        // Enviar email de confirmação
        await notificationService.sendBookingConfirmation(
          newBooking,
          appointment.tenant
        );

        return {
          data: {
            id: newBooking.id,
            status: 'SCHEDULED',
            message: 'Agendamento reagendado com sucesso!',
          },
        };
      } catch (error) {
        const err = error as Error;
        return reply.status(400).send({ error: err.message });
      }
    }
  );
}
