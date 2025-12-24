'use client';

import { useState } from 'react';
import { AlertCircle, Mail, Phone, User } from 'lucide-react';
import { BookingFormData } from '@/types/booking';

interface BookingFormProps {
  serviceId: string;
  selectedDate: string;
  selectedTime: string;
  onSubmit: (data: BookingFormData) => Promise<void>;
  isLoading?: boolean;
}

export function BookingForm({
  serviceId,
  selectedDate,
  selectedTime,
  onSubmit,
  isLoading = false,
}: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<BookingFormData>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<BookingFormData> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Nome é obrigatório';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Telefone é obrigatório';
    } else if (!/^[0-9\-\s\+\(\)]+$/.test(formData.customerPhone)) {
      newErrors.customerPhone = 'Telefone inválido';
    }

    if (formData.customerEmail && !formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email é obrigatório';
    } else if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Email inválido';
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
    if (errors[name as keyof BookingFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="booking-error">
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <p>{submitError}</p>
        </div>
      )}

      <div className="booking-info-box">
        <p>
          <strong>Confirmando para:</strong> {new Date(selectedDate).toLocaleDateString('pt-BR')} às {selectedTime}
        </p>
      </div>

      <div>
        <label className="booking-label">
          <User size={18} />
          Nome completo
        </label>
        <input
          type="text"
          name="customerName"
          value={formData.customerName}
          onChange={handleChange}
          placeholder="Seu nome completo"
          className={`booking-input ${errors.customerName ? 'error' : ''}`}
        />
        {errors.customerName && (
          <p className="booking-error-text">{errors.customerName}</p>
        )}
      </div>

      <div>
        <label className="booking-label">
          <Phone size={18} />
          Telefone
        </label>
        <input
          type="tel"
          name="customerPhone"
          value={formData.customerPhone}
          onChange={handleChange}
          placeholder="(11) 99999-9999"
          className={`booking-input ${errors.customerPhone ? 'error' : ''}`}
        />
        {errors.customerPhone && (
          <p className="booking-error-text">{errors.customerPhone}</p>
        )}
      </div>

      <div>
        <label className="booking-label">
          <Mail size={18} />
          Email
        </label>
        <input
          type="email"
          name="customerEmail"
          value={formData.customerEmail}
          onChange={handleChange}
          placeholder="seu.email@exemplo.com"
          className={`booking-input ${errors.customerEmail ? 'error' : ''}`}
        />
        {errors.customerEmail && (
          <p className="booking-error-text">{errors.customerEmail}</p>
        )}
      </div>

      <div>
        <label className="booking-label">
          Observações (opcional)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Alguma informação especial que devemos saber?"
          rows={4}
          className="booking-textarea"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="booking-btn booking-btn-primary w-full"
      >
        {isLoading ? 'Confirmando...' : 'Confirmar Agendamento'}
      </button>
    </form>
  );
}
