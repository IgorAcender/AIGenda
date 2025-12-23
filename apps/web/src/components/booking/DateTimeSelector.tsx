'use client';

import { useState, useEffect } from 'react';
import { format, addDays, parse, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Clock, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { TimeSlot, Professional } from '@/types/booking';
import { getApiUrl } from '@/lib/api-config';

interface DateTimeSelectorProps {
  tenantSlug: string;
  serviceId: string;
  onSelectDate: (date: string) => void;
  onSelectTime: (date: string, time: string, professional: Professional) => void;
  selectedDate?: string;
  selectedProfessional?: Professional;
}

export function DateTimeSelector({
  tenantSlug,
  serviceId,
  onSelectDate,
  onSelectTime,
  selectedDate = '',
  selectedProfessional,
}: DateTimeSelectorProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Carregar slots disponíveis quando uma data é selecionada
  useEffect(() => {
    if (!selectedDate) {
      setSlots([]);
      setSelectedTime('');
      return;
    }

    const fetchSlots = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = getApiUrl();
        const endDate = addDays(parse(selectedDate, 'yyyy-MM-dd', new Date()), 1);

        const params = new URLSearchParams({
          serviceId,
          startDate: selectedDate,
          endDate: format(endDate, 'yyyy-MM-dd'),
          ...(selectedProfessional?.id && { professionalId: selectedProfessional.id }),
        });

        const res = await fetch(
          `${apiUrl}/${tenantSlug}/available-slots?${params}`
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Erro ao carregar horários');
        }

        const data = await res.json();
        setSlots(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar horários');
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchSlots();
    }
  }, [tenantSlug, serviceId, selectedDate, selectedProfessional?.id]);

  const handleTimeSelect = (date: string, time: string) => {
    setSelectedTime(time);
    if (selectedProfessional) {
      onSelectTime(date, time, selectedProfessional);
    }
  };

  // Agrupar slots por data
  const slotsByDate = slots.reduce(
    (acc, slot) => {
      if (!acc[slot.date]) acc[slot.date] = [];
      acc[slot.date].push(slot);
      return acc;
    },
    {} as Record<string, TimeSlot[]>
  );

  // Calcular datas mínima e máxima para o calendário
  const today = new Date();
  const minDateObj = today;

  // Gerar dias do mês atual
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Gerar dias dos meses anteriores e seguintes para preenchimento
  const firstDayOfWeek = monthStart.getDay();
  const previousDays = Array.from({ length: firstDayOfWeek }, (_, i) =>
    addDays(monthStart, -(firstDayOfWeek - i))
  );
  const lastDayOfWeek = monthEnd.getDay();
  const nextDays = Array.from({ length: 6 - lastDayOfWeek }, (_, i) =>
    addDays(monthEnd, i + 1)
  );

  const calendarDays = [...previousDays, ...daysInMonth, ...nextDays];

  return (
    <div className="space-y-6">
      {/* Horários disponíveis */}
      {error && (
        <div className="booking-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
        </div>
      ) : slots.length === 0 ? (
        <div className="booking-warning">
          Nenhum horário disponível para {selectedDate ? format(parse(selectedDate, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy', { locale: pt }) : 'esta data'}
        </div>
      ) : (
        <div className="booking-time-slots">
          {slotsByDate[selectedDate]?.map((slot) => (
            <button
              key={`${slot.date}-${slot.time}`}
              onClick={() => handleTimeSelect(slot.date, slot.time)}
              className={`booking-time-slot ${
                selectedTime === slot.time ? 'selected' : ''
              }`}
            >
              {slot.time}
            </button>
          ))}
        </div>
      )}

      {selectedTime && (
        <div className="booking-success">
          ✓ Horário selecionado: <strong>{selectedTime}</strong>
        </div>
      )}
    </div>
  );
}
