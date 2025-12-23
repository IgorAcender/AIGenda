'use client';

import { useState } from 'react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarSelectorProps {
  onSelectDate: (date: string) => void;
  selectedDate?: string;
}

export function CalendarSelector({
  onSelectDate,
  selectedDate = '',
}: CalendarSelectorProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
    <div className="booking-calendar-container">
      <div className="booking-calendar-header">
        <button
          onClick={() => setCurrentMonth(addDays(currentMonth, -32))}
          className="booking-calendar-nav-btn"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="booking-calendar-month">
          {format(currentMonth, 'MMMM yyyy', { locale: pt })}
        </h3>
        <button
          onClick={() => setCurrentMonth(addDays(currentMonth, 32))}
          className="booking-calendar-nav-btn"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Dias da semana */}
      <div className="booking-calendar-weekdays">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
          <div key={day} className="booking-calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      {/* Dias do calendário */}
      <div className="booking-calendar-days">
        {calendarDays.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);
          const isBeforeMin = isBefore(day, minDateObj);
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={idx}
              onClick={() => !isBeforeMin && isCurrentMonth && onSelectDate(dateStr)}
              disabled={isBeforeMin || !isCurrentMonth}
              className={`booking-calendar-day ${!isCurrentMonth ? 'booking-calendar-day-other' : ''} ${
                isTodayDate ? 'booking-calendar-day-today' : ''
              } ${isSelected ? 'booking-calendar-day-selected' : ''}`}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
