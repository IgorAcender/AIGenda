'use client';

import { useState, useEffect } from 'react';
import { Professional } from '@/types/booking';
import { getApiUrl } from '@/lib/api-config';

interface ProfessionalSelectorProps {
  tenantSlug: string;
  serviceId: string;
  onProfessionalSelect: (professional: Professional) => void;
}

export function ProfessionalSelector({
  tenantSlug,
  serviceId,
  onProfessionalSelect,
}: ProfessionalSelectorProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);

  // Carregar profissionais do serviço
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/${tenantSlug}/professionals/${serviceId}`);
        if (!res.ok) throw new Error('Erro ao carregar profissionais');
        const data = await res.json();
        const profs = data.data || [];
        setProfessionals(profs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar profissionais');
        setProfessionals([]);
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchProfessionals();
    }
  }, [tenantSlug, serviceId]);

  const handleSelectProfessional = (professional: Professional) => {
    setSelectedProfessional(professional);
    onProfessionalSelect(professional);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-error">
        {error}
      </div>
    );
  }

  if (professionals.length === 0) {
    return (
      <div className="booking-warning">
        Nenhum profissional disponível para este serviço
      </div>
    );
  }

  return (
    <div className="booking-professionals-grid">
      {professionals.map((professional) => (
        <button
          key={professional.id}
          onClick={() => handleSelectProfessional(professional)}
          className={`booking-professional-card ${
            selectedProfessional?.id === professional.id ? 'selected' : ''
          }`}
        >
          {professional.avatar && (
            <img src={professional.avatar} alt={professional.name} className="booking-professional-avatar" />
          )}
          <div className="booking-professional-info">
            <h4 className="booking-professional-name">{professional.name}</h4>
            {professional.specialty && (
              <p className="booking-professional-specialty">{professional.specialty}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
