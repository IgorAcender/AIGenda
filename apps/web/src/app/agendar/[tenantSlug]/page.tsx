'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceSelector } from '@/components/booking/ServiceSelector';
import { ProfessionalSelector } from '@/components/booking/ProfessionalSelector';
import { DateTimeSelector } from '@/components/booking/DateTimeSelector';
import { CalendarSelector } from '@/components/booking/CalendarSelector';
import { ConfirmationScreen } from '@/components/booking/ConfirmationScreen';
import { SuccessScreen } from '@/components/booking/SuccessScreen';
import { ChevronLeft } from 'lucide-react';
import { Service, Professional, BookingFormData } from '@/types/booking';
import './booking.css';

interface PageProps {
  params: {
    tenantSlug: string;
  };
}

type BookingStep = 'service' | 'datetime' | 'form' | 'success';

export default function BookingPage({ params }: PageProps) {
  const router = useRouter();
  const { tenantSlug } = params;

  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [isLoading, setIsLoading] = useState(false);

  // Estado do agendamento
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] =
    useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentId, setAppointmentId] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Estado dos dados do cliente
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');

  const handleServiceSelect = (serviceId: string, service: Service) => {
    setSelectedService(service);
    setCurrentStep('datetime');
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    // Limpa a seleção anterior de tempo
    setSelectedTime('');
  };

  const handleProfessionalSelect = (professional: Professional) => {
    setSelectedProfessional(professional);
    // Limpa a seleção anterior de tempo
    setSelectedTime('');
  };

  const handleTimeSelect = (date: string, time: string, professional: Professional) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setSelectedProfessional(professional);
    // Não muda de aba, fica na mesma
  };

  const handleContinueFromDateTime = () => {
    if (selectedDate && selectedTime && selectedProfessional) {
      setCurrentStep('form');
    }
  };

  const handleBookingSubmit = async (formData: BookingFormData) => {
    if (!selectedService || !selectedProfessional) {
      throw new Error('Serviço ou profissional não selecionado');
    }

    setIsLoading(true);

    try {
      const rawApi = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      // Rotas públicas ficam na raiz (sem /api); se a env vier com /api, removemos.
      const publicApiBase = rawApi.replace(/\/api\/?$/, '');
      const response = await fetch(
        `${publicApiBase}/${tenantSlug}/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serviceId: selectedService.id,
            professionalId: selectedProfessional.id,
            date: selectedDate, // formato: yyyy-MM-dd
            time: selectedTime, // formato: HH:mm
            customerName: formData.customerName,
            customerPhone: formData.customerPhone,
            notes: formData.notes || undefined,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao confirmar agendamento');
      }

      const data = await response.json();
      setAppointmentId(data.data.id);
      // Armazena dados do cliente antes de ir para a tela de sucesso
      setCustomerName(formData.customerName);
      setCustomerPhone(formData.customerPhone);
      setCurrentStep('success');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'datetime':
        setCurrentStep('service');
        setSelectedService(null);
        setSelectedProfessional(null);
        break;
      case 'form':
        setCurrentStep('datetime');
        setSelectedDate('');
        setSelectedTime('');
        break;
      case 'success':
        router.push(`/agendar/${tenantSlug}`);
        break;
    }
  };

  return (
    <div className="booking-container">
      <div className="booking-wrapper">
        {/* Header */}
        <div className="booking-header">
          <div className="booking-header-content">
            <h1>Agende seu horário</h1>
            <p>
              Passo{' '}
              {currentStep === 'service'
                ? 1
                : currentStep === 'datetime'
                  ? 2
                  : currentStep === 'form'
                    ? 3
                    : 4}{' '}
              de 4
            </p>
          </div>
          {currentStep !== 'success' && (
            <button onClick={handleBack} className="booking-back-btn">
              <ChevronLeft size={20} />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="booking-progress">
          {(['service', 'datetime', 'form', 'success'] as const).map((step, idx) => {
            const currentIdx = ['service', 'datetime', 'form', 'success'].indexOf(
              currentStep
            );
            const isActive = currentIdx >= idx;
            const isCompleted = currentIdx > idx;

            return (
              <div
                key={step}
                className={`booking-progress-item ${isActive ? 'active' : ''} ${
                  isCompleted ? 'completed' : ''
                }`}
              />
            );
          })}
        </div>

        {/* Content Card */}
        <div className="booking-card">
          {currentStep === 'service' && (
            <>
              <div className="booking-step-label">
                <div className="booking-step-label-icon">1</div>
                Selecione um Serviço
              </div>
              <ServiceSelector
                tenantSlug={tenantSlug}
                onServiceSelect={handleServiceSelect}
                onProfessionalSelect={() => {}}
              />
              {selectedService && selectedProfessional && (
                <button
                  onClick={() => setCurrentStep('datetime')}
                  className="booking-btn booking-btn-primary"
                  style={{ marginTop: '2rem' }}
                >
                  Continuar →
                </button>
              )}
            </>
          )}

          {currentStep === 'datetime' && selectedService && (
            <>
              <div className="booking-step-label">
                <div className="booking-step-label-icon">2</div>
                Data, Profissional e Horário
              </div>

              {/* 1. Seleção de Data */}
              <div className="booking-section">
                <h3 className="booking-section-title">1. Escolha uma Data</h3>
                <CalendarSelector
                  onSelectDate={handleDateSelect}
                  selectedDate={selectedDate}
                />
              </div>

              {/* 2. Seleção de Profissional - Aparece após data selecionada */}
              {selectedDate && (
                <div className="booking-section">
                  <h3 className="booking-section-title">2. Escolha um Profissional</h3>
                  <ProfessionalSelector
                    tenantSlug={tenantSlug}
                    serviceId={selectedService.id}
                    onProfessionalSelect={handleProfessionalSelect}
                  />
                </div>
              )}

              {/* 3. Seleção de Horário - Aparece após data E profissional selecionados */}
              {selectedDate && selectedProfessional && (
                <div className="booking-section">
                  <h3 className="booking-section-title">3. Escolha um Horário</h3>
                  <DateTimeSelector
                    tenantSlug={tenantSlug}
                    serviceId={selectedService.id}
                    onSelectDate={handleDateSelect}
                    onSelectTime={handleTimeSelect}
                    selectedDate={selectedDate}
                    selectedProfessional={selectedProfessional}
                  />
                </div>
              )}

              {/* Botão Continuar */}
              {selectedDate && selectedTime && selectedProfessional && (
                <button
                  onClick={handleContinueFromDateTime}
                  className="booking-btn booking-btn-primary"
                  style={{ marginTop: '2rem' }}
                >
                  Continuar →
                </button>
              )}
            </>
          )}

          {currentStep === 'form' && selectedService && (
            <>
              <div className="booking-step-label">
                <div className="booking-step-label-icon">3</div>
                Confirmar Agendamento
              </div>
              <ConfirmationScreen
                service={selectedService}
                professional={selectedProfessional}
                date={selectedDate}
                time={selectedTime}
                tenantSlug={tenantSlug}
                onSubmit={handleBookingSubmit}
                isLoading={isLoading}
              />
            </>
          )}

          {currentStep === 'success' && (
            <SuccessScreen
              appointmentId={appointmentId}
              service={selectedService}
              professional={selectedProfessional}
              date={selectedDate}
              time={selectedTime}
              customerName={customerName}
              customerPhone={customerPhone}
              onNewBooking={() => router.push(`/agendar/${tenantSlug}`)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
