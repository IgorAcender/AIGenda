import nodemailer from 'nodemailer';
import { Appointment, Professional, Service, Tenant } from '@prisma/client';

export class NotificationService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    // Verificar se as variáveis de ambiente estão configuradas
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
    ) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    }
  }

  /**
   * Enviar confirmação de agendamento
   */
  async sendBookingConfirmation(
    appointment: Appointment & {
      service?: Service | null;
      professional?: Professional | null;
    },
    tenant: Tenant
  ) {
    if (!appointment.customerEmail || !this.transporter) {
      console.warn('Email ou transporter não configurado');
      return;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>✅ Agendamento Confirmado!</h2>
        <p>Olá ${appointment.customerPhone},</p>
        <p>Seu agendamento foi realizado com sucesso em <strong>${tenant.name}</strong>.</p>
        
        <h3>📅 Detalhes do Agendamento:</h3>
        <ul>
          <li><strong>Serviço:</strong> ${appointment.service?.name || 'N/A'}</li>
          <li><strong>Data:</strong> ${new Date(appointment.date).toLocaleDateString('pt-BR')}</li>
          <li><strong>Horário:</strong> ${appointment.startTime}</li>
          ${appointment.professional ? `<li><strong>Profissional:</strong> ${appointment.professional.name}</li>` : ''}
          <li><strong>Duração:</strong> ${appointment.service?.duration || 30} minutos</li>
        </ul>

        <h3>📍 Local:</h3>
        <p>
          ${tenant.address}<br/>
          ${tenant.city}, ${tenant.state}
        </p>

        <h3>📞 Contato:</h3>
        <p>
          Telefone: ${tenant.phone}<br/>
          Email: ${tenant.email}
        </p>

        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">
          Este é um email automático. Não responda este email.
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || `${tenant.name} <noreply@aigenda.com>`,
        to: appointment.customerEmail,
        subject: `✅ Agendamento Confirmado - ${tenant.name}`,
        html,
      });

      console.log(`Email de confirmação enviado para ${appointment.customerEmail}`);
    } catch (error) {
      console.error('Erro ao enviar email de confirmação:', error);
    }
  }

  /**
   * Enviar lembrete de agendamento
   */
  async sendReminder(
    appointment: Appointment & {
      service?: Service | null;
      professional?: Professional | null;
    },
    tenant: Tenant
  ) {
    if (!appointment.customerEmail || !this.transporter) {
      return;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>⏰ Lembrete de Agendamento</h2>
        <p>Olá ${appointment.customerPhone},</p>
        <p>Este é um lembrete do seu agendamento de amanhã!</p>
        
        <h3>📅 Detalhes:</h3>
        <ul>
          <li><strong>Serviço:</strong> ${appointment.service?.name || 'N/A'}</li>
          <li><strong>Horário:</strong> ${appointment.startTime}</li>
          ${appointment.professional ? `<li><strong>Profissional:</strong> ${appointment.professional.name}</li>` : ''}
          <li><strong>Local:</strong> ${tenant.address}</li>
        </ul>

        <p style="color: #c41e3a; font-weight: bold;">
          ⚠️ Chegue com 10 minutos de antecedência
        </p>

        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">
          Este é um email automático. Não responda este email.
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || `${tenant.name} <noreply@aigenda.com>`,
        to: appointment.customerEmail,
        subject: `⏰ Lembrete - ${tenant.name}`,
        html,
      });

      console.log(`Email de lembrete enviado para ${appointment.customerEmail}`);
    } catch (error) {
      console.error('Erro ao enviar lembrete:', error);
    }
  }

  /**
   * Enviar cancelamento
   */
  async sendCancellationConfirmation(
    appointment: Appointment & {
      service?: Service | null;
      professional?: Professional | null;
    },
    tenant: Tenant,
    reason?: string
  ) {
    if (!appointment.customerEmail || !this.transporter) {
      return;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>❌ Agendamento Cancelado</h2>
        <p>Olá ${appointment.customerPhone},</p>
        <p>Seu agendamento foi cancelado com sucesso.</p>
        
        <h3>📅 Agendamento:</h3>
        <ul>
          <li><strong>Serviço:</strong> ${appointment.service?.name || 'N/A'}</li>
          <li><strong>Data:</strong> ${new Date(appointment.date).toLocaleDateString('pt-BR')}</li>
          <li><strong>Horário:</strong> ${appointment.startTime}</li>
        </ul>

        ${reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ''}

        <p>Para agendar novamente, <a href="#">clique aqui</a>.</p>

        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">
          Este é um email automático. Não responda este email.
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || `${tenant.name} <noreply@aigenda.com>`,
        to: appointment.customerEmail,
        subject: `❌ Agendamento Cancelado - ${tenant.name}`,
        html,
      });

      console.log(`Email de cancelamento enviado para ${appointment.customerEmail}`);
    } catch (error) {
      console.error('Erro ao enviar email de cancelamento:', error);
    }
  }
}

export const notificationService = new NotificationService();
