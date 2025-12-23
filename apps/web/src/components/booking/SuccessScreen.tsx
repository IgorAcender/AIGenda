'use client';

import { CheckCircle } from 'lucide-react';
import { Service, Professional } from '@/types/booking';

interface SuccessScreenProps {
  appointmentId: string;
  service: Service | null;
  professional: Professional | null;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  onNewBooking: () => void;
}

export function SuccessScreen({
  appointmentId,
  service,
  professional,
  date,
  time,
  customerName,
  customerPhone,
  onNewBooking,
}: SuccessScreenProps) {
  const formattedDate = new Date(date).toLocaleDateString('pt-BR');
  const serviceDuration = service?.duration ? `${service.duration} minutos` : '';
  const servicePrice = service?.price
    ? `R$ ${service.price.toFixed(2).replace('.', ',')}`
    : '';

  return (
    <div className="booking-success-screen">
      {/* Ícone e mensagem de sucesso */}
      <div className="booking-success-header">
        <div className="booking-success-icon">
          <CheckCircle size={60} color="#10b981" />
        </div>
        <h1>Agendamento Confirmado!</h1>
        <p>Seu agendamento foi registrado com sucesso. Você receberá uma confirmação por email/WhatsApp.</p>
      </div>

      {/* Número do agendamento */}
      {appointmentId && (
        <div className="booking-success-appointment-box">
          <p className="booking-success-appointment-label">Número do Agendamento</p>
          <p className="booking-success-appointment-id">{appointmentId}</p>
        </div>
      )}

      {/* Caixa de detalhes do agendamento */}
      <div className="booking-success-details-box">
        <div className="booking-success-detail-row">
          <span className="booking-success-detail-label">Serviço</span>
          <span className="booking-success-detail-value">{service?.name}</span>
        </div>

        <div className="booking-success-detail-row">
          <span className="booking-success-detail-label">Professional</span>
          <span className="booking-success-detail-value">{professional?.name}</span>
        </div>

        <div className="booking-success-detail-row">
          <span className="booking-success-detail-label">Data</span>
          <span className="booking-success-detail-value">{formattedDate}</span>
        </div>

        <div className="booking-success-detail-row">
          <span className="booking-success-detail-label">Horário</span>
          <span className="booking-success-detail-value">{time}</span>
        </div>

        <div className="booking-success-detail-row">
          <span className="booking-success-detail-label">Duração</span>
          <span className="booking-success-detail-value">{serviceDuration}</span>
        </div>

        <div className="booking-success-detail-row">
          <span className="booking-success-detail-label">Valor</span>
          <span className="booking-success-detail-value booking-success-price">
            {servicePrice}
          </span>
        </div>
      </div>

      {/* Caixa com informações do cliente */}
      <div className="booking-success-customer-box">
        <h3 className="booking-success-section-title">Suas informações</h3>

        <div className="booking-success-customer-field">
          <label>Telefone/WhatsApp *</label>
          <div className="booking-success-customer-value">{customerPhone}</div>
        </div>

        <div className="booking-success-customer-field">
          <label>Nome *</label>
          <div className="booking-success-customer-value">{customerName}</div>
        </div>
      </div>

      {/* Botão de nova ação */}
      <button onClick={onNewBooking} className="booking-btn booking-btn-primary booking-success-btn">
        <CheckCircle size={20} />
        Agendar Outro Horário
      </button>

      {/* Link para voltar */}
      <button 
        onClick={() => window.location.href = '/'} 
        className="booking-btn booking-btn-secondary booking-success-btn-secondary"
      >
        Voltar ao Início
      </button>
    </div>
  );
}
