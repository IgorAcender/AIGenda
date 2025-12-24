'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Phone, User, CheckCircle } from 'lucide-react';
import { Service, Professional, BookingFormData } from '@/types/booking';
import { getApiUrl } from '@/lib/api-config';

interface ConfirmationScreenProps {
  service: Service | null;
  professional: Professional | null;
  date: string;
  time: string;
  tenantSlug: string;
  onSubmit: (formData: BookingFormData) => Promise<void>;
  isLoading?: boolean;
}

export function ConfirmationScreen({
  service,
  professional,
  date,
  time,
  tenantSlug,
  onSubmit,
  isLoading = false,
}: ConfirmationScreenProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    customerName: '',
    customerPhone: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<BookingFormData>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState<boolean>(true);
  const [showNameField, setShowNameField] = useState(false);
  const [phoneSearched, setPhoneSearched] = useState(false);

  // Buscar cliente quando o telefone é digitado (com debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.customerPhone.length >= 10) {
        searchCustomer(formData.customerPhone);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [formData.customerPhone]);

  const searchCustomer = async (phone: string) => {
    if (!phone || phone.length < 10) return;

    setIsLoadingCustomer(true);
    setPhoneSearched(true);

    try {
      const url = `${getApiUrl()}/${tenantSlug}/customer/${phone}`;
      console.log('[SEARCH] URL:', url);
      
      const response = await fetch(url);
      const result = await response.json();
      
      console.log('[SEARCH] Result:', result);

      if (result.data?.isNewCustomer) {
        // Cliente novo
        console.log('[SEARCH] New customer detected');
        setIsNewCustomer(true);
        setShowNameField(true);
        setFormData((prev) => ({
          ...prev,
          customerName: '',
        }));
      } else if (result.data?.customer) {
        // Cliente retornando
        console.log('[SEARCH] Returning customer detected', result.data.customer);
        setIsNewCustomer(false);
        setShowNameField(false);
        setFormData((prev) => ({
          ...prev,
          customerName: result.data.customer.name || '',
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
    } finally {
      setIsLoadingCustomer(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BookingFormData> = {};

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Telefone é obrigatório';
    } else if (!/^[0-9\-\s\+\(\)]+$/.test(formData.customerPhone)) {
      newErrors.customerPhone = 'Telefone inválido';
    }

    if (showNameField && !formData.customerName.trim()) {
      newErrors.customerName = 'Nome é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpa erros de campo específico
    if (errors[name as keyof BookingFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    // Limpa erro geral de submit quando usuário começa a digitar
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Erro ao confirmar agendamento'
      );
    }
  };

  const formattedDate = new Date(date).toLocaleDateString('pt-BR');
  const serviceDuration = service?.duration ? `${service.duration} minutos` : '';
  const servicePrice = service?.price
    ? `R$ ${service.price.toFixed(2).replace('.', ',')}`
    : '';

  return (
    <div className="booking-confirmation-screen">
      {/* Header */}
      <div className="booking-confirmation-header">
        <h1>Confirmar agendamento</h1>
        <p>Verifique os detalhes e preencha suas informações para finalizar</p>
      </div>

      {/* Caixa de Detalhes */}
      <div className="booking-confirmation-details">
        <div className="booking-confirmation-row">
          <span className="booking-confirmation-label">Serviço</span>
          <span className="booking-confirmation-value">{service?.name}</span>
        </div>

        <div className="booking-confirmation-row">
          <span className="booking-confirmation-label">Professional</span>
          <span className="booking-confirmation-value">{professional?.name}</span>
        </div>

        <div className="booking-confirmation-row">
          <span className="booking-confirmation-label">Data</span>
          <span className="booking-confirmation-value">{formattedDate}</span>
        </div>

        <div className="booking-confirmation-row">
          <span className="booking-confirmation-label">Horário</span>
          <span className="booking-confirmation-value">{time}</span>
        </div>

        <div className="booking-confirmation-row">
          <span className="booking-confirmation-label">Duração</span>
          <span className="booking-confirmation-value">{serviceDuration}</span>
        </div>

        <div className="booking-confirmation-row">
          <span className="booking-confirmation-label">Valor</span>
          <span className="booking-confirmation-value booking-confirmation-price">
            {servicePrice}
          </span>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="booking-confirmation-form" noValidate>
        {submitError && (
          <div className="booking-error">
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <p>{submitError}</p>
          </div>
        )}

        <div className="booking-confirmation-form-title">Suas informações</div>

          {/* Campo Telefone - Sempre visível */}
        <div className="booking-confirmation-field">
          <label className="booking-confirmation-field-label">
            <Phone size={18} />
            Telefone/WhatsApp *
          </label>
          <div className="booking-confirmation-input-wrapper">
            <input
              type="text"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              className={`booking-confirmation-input ${
                errors.customerPhone ? 'error' : ''
              }`}
              maxLength={15}
            />
            {isLoadingCustomer && (
              <div className="booking-confirmation-loading">
                <div className="booking-confirmation-spinner"></div>
              </div>
            )}
          </div>
          {errors.customerPhone && (
            <p className="booking-error-text">{errors.customerPhone}</p>
          )}
          {phoneSearched && !isNewCustomer && (
            <p className="booking-confirmation-info">
              ✓ Cliente retornando - nome preenchido automaticamente
            </p>
          )}
          {phoneSearched && isNewCustomer && (
            <p className="booking-confirmation-info">
              Novo cliente - preencha os dados abaixo
            </p>
          )}
        </div>

        {/* Campos que aparecem após busca */}
        {phoneSearched && (
          <>
            {/* Campo Nome - Editável para novo cliente */}
            {showNameField && (
              <div className="booking-confirmation-field">
                <label className="booking-confirmation-field-label">
                  <User size={18} />
                  Nome *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                  className={`booking-confirmation-input ${
                    errors.customerName ? 'error' : ''
                  }`}
                />
                {errors.customerName && (
                  <p className="booking-error-text">{errors.customerName}</p>
                )}
              </div>
            )}

            {/* Campo Nome - Somente leitura para cliente retornando */}
            {!showNameField && formData.customerName && (
              <div className="booking-confirmation-field">
                <label className="booking-confirmation-field-label">
                  <User size={18} />
                  Nome
                </label>
                <div className="booking-confirmation-input-readonly">
                  {formData.customerName}
                </div>
              </div>
            )}

            {/* Campo Observações - Sempre visível após busca */}
            <div className="booking-confirmation-field">
              <label className="booking-confirmation-field-label">
                Observações (opcional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Alguma informação especial que devemos saber?"
                rows={3}
                className="booking-confirmation-textarea"
              />
            </div>
          </>
        )}

        {/* Botão */}
        {phoneSearched && (
          <button
            type="submit"
            disabled={isLoading}
            className="booking-confirmation-btn"
          >
            <CheckCircle size={20} />
            {isLoading ? 'Confirmando...' : 'Confirmar agendamento'}
          </button>
        )}
      </form>
    </div>
  );
}
