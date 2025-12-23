'use client';

import { useState, useEffect } from 'react';
import {ChevronDown } from 'lucide-react';
import { Professional, Service } from '@/types/booking';
import { getApiUrl } from '@/lib/api-config';

interface ServiceSelectorProps {
  tenantSlug: string;
  onServiceSelect: (serviceId: string, service: Service) => void;
  onProfessionalSelect: (professionalId: string | undefined, professional: Professional | undefined) => void;
}

export function ServiceSelector({
  tenantSlug,
  onServiceSelect,
  onProfessionalSelect,
}: ServiceSelectorProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Carregar serviços
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const apiUrl = getApiUrl();
        console.log('[SERVICE SELECTOR] API URL:', apiUrl);
        console.log('[SERVICE SELECTOR] Fetching:', `${apiUrl}/${tenantSlug}`);
        const res = await fetch(`${apiUrl}/${tenantSlug}`);
        console.log('[SERVICE SELECTOR] Response status:', res.status);
        if (!res.ok) throw new Error('Erro ao carregar serviços');
        const data = await res.json();
        console.log('[SERVICE SELECTOR] Data received:', data);
        setServices(data.data?.services || []);
        console.log('[SERVICE SELECTOR] Services set:', data.data?.services?.length || 0);
      } catch (err) {
        console.error('[SERVICE SELECTOR] Error:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar serviços');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [tenantSlug]);

  // 2. Carregar profissionais quando serviço é selecionado
  const handleServiceChange = async (service: Service) => {
    setSelectedService(service);
    setSelectedProfessional(null);
    setProfessionals([]);
    onServiceSelect(service.id, service);

    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(
        `${apiUrl}/${tenantSlug}/professionals/${service.id}`
      );
      if (!res.ok) throw new Error('Erro ao carregar profissionais');
      const data = await res.json();
      const profs = data.data || [];
      setProfessionals(profs);

      if (profs.length > 0) {
        setSelectedProfessional(profs[0]);
        onProfessionalSelect(profs[0].id, profs[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar profissionais');
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionalChange = (professional: Professional) => {
    setSelectedProfessional(professional);
    onProfessionalSelect(professional.id, professional);
  };

  return (
    <div>
      {error && (
        <div className="booking-error">
          {error}
        </div>
      )}

      {/* Seleção de Serviço */}
      <div>
        <h3 className="booking-section-title">Selecione um Serviço</h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="booking-loading" style={{ margin: '0 auto' }}></div>
          </div>
        ) : services.length === 0 ? (
          <div className="booking-warning">Nenhum serviço disponível</div>
        ) : (
          <div className="booking-services-grid">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => handleServiceChange(service)}
                className={`booking-service-card ${
                  selectedService?.id === service.id ? 'selected' : ''
                }`}
              >
                <div className="booking-service-info">
                  <div className="booking-service-name">{service.name}</div>
                  {service.description && (
                    <div className="booking-service-desc">{service.description}</div>
                  )}
                  {service.category && (
                    <div className="booking-service-meta">
                      <span>{service.category.name}</span>
                      <span>{service.duration} min</span>
                    </div>
                  )}
                </div>
                <div className="booking-service-price">
                  R$ {service.price.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seleção de Profissional */}
      {selectedService && (
        <div>
          <div className="booking-professional-label">
            Profissional Preferido (opcional)
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="booking-loading" style={{ margin: '0 auto' }}></div>
            </div>
          ) : professionals.length === 0 ? (
            <div className="booking-warning">Nenhum profissional disponível</div>
          ) : (
            <div className="booking-professionals-grid">
              {professionals.map((prof) => (
                <button
                  key={prof.id}
                  onClick={() => handleProfessionalChange(prof)}
                  className={`booking-professional-btn ${
                    selectedProfessional?.id === prof.id ? 'selected' : ''
                  }`}
                  type="button"
                >
                  <div className="booking-professional-avatar">
                    {prof.avatar ? (
                      <img src={prof.avatar} alt={prof.name} />
                    ) : (
                      prof.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="booking-professional-name">{prof.name}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Próximo Passo */}
      {selectedService && selectedProfessional && (
        <div style={{ marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          ✓ Pronto! Clique em "Continuar" abaixo.
        </div>
      )}
    </div>
  );
}
