'use client';

import { useState, useEffect, useMemo } from 'react';
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

  // Carregar slots APENAS do dia selecionado (quando data OU profissional mudar)
  useEffect(() => {
    if (!selectedProfessional?.id || !serviceId || !selectedDate) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      console.log(`[SLOTS] Carregando horários para ${selectedDate}...`);
      setLoading(true);
      setError(null);

      try {
        const apiUrl = getApiUrl();
        // API exige startDate e endDate - enviar o mesmo dia para ambos
        const response = await fetch(
          `${apiUrl}/${tenantSlug}/available-slots?serviceId=${serviceId}&professionalId=${selectedProfessional.id}&startDate=${selectedDate}&endDate=${selectedDate}`
        );

        if (!response.ok) {
          throw new Error('Erro ao carregar horários disponíveis');
        }

        const data = await response.json();
        console.log(`[SLOTS] ${data.length} horários carregados para ${selectedDate}`);
        setSlots(data);
      } catch (err) {
        console.error('[SLOTS] Erro:', err);
        setError('Erro ao carregar horários. Tente novamente.');
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [tenantSlug, serviceId, selectedDate, selectedProfessional?.id]);

  const handleTimeSelect = (date: string, time: string) => {
    setSelectedTime(time);
    if (selectedProfessional) {
      onSelectTime(date, time, selectedProfessional);
    }
  };

  // Agrupar slots por data COM MEMOIZAÇÃO (otimização de performance)
  const slotsByDate = useMemo(() => {
    return slots.reduce(
      (acc, slot) => {
        if (!acc[slot.date]) acc[slot.date] = [];
        acc[slot.date].push(slot);
        return acc;
      },
      {} as Record<string, TimeSlot[]>
    );
  }, [slots]);

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
