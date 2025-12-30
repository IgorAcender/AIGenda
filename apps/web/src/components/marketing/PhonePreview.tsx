'use client'

import React, { useMemo } from 'react'
import { Spin } from 'antd'
import './PhonePreview.css'

interface PhonePreviewProps {
  businessHours?: { [key: string]: string }
  paymentMethods?: string[] | string
  amenities?: string[] | string
  socialMedia?: {
    instagram?: string
    facebook?: string
    twitter?: string
  }
  tenantName?: string
  about?: string
  description?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  banner?: string
  phone?: string
  email?: string
  loading?: boolean
}

export default function PhonePreview({
  businessHours = {},
  paymentMethods = [],
  amenities = [],
  socialMedia = {},
  tenantName = 'Barbearia Vintage',
  about = 'Bem-vindo à nossa barbearia!',
  description,
  address = 'Rua Pau Brasil 381',
  city = 'Divinópolis',
  state = 'MG',
  zipCode = '35501576',
  banner,
  phone,
  email,
  loading = false,
}: PhonePreviewProps) {
  const parsedPaymentMethods = useMemo(() => {
    if (typeof paymentMethods === 'string') {
      return paymentMethods
        .split(/[,\n]/)
        .map(m => m.trim())
        .filter(m => m)
    }
    return Array.isArray(paymentMethods) ? paymentMethods : []
  }, [paymentMethods])

  const parsedAmenities = useMemo(() => {
    if (typeof amenities === 'string') {
      return amenities
        .split(/[,\n]/)
        .map(a => a.trim())
        .filter(a => a)
    }
    return Array.isArray(amenities) ? amenities : []
  }, [amenities])

  // Traduzir dias da semana
  const dayNames: { [key: string]: string } = {
    monday: 'Segunda',
    tuesday: 'Terça',
    wednesday: 'Quarta',
    thursday: 'Quinta',
    friday: 'Sexta',
    saturday: 'Sábado',
    sunday: 'Domingo',
  }

  return (
    <div className="phone-preview-container">
      <div className="phone-frame">
        <div className="phone-notch" />
        <div className="phone-screen">
          {loading ? (
            <div className="preview-loading">
              <Spin />
            </div>
          ) : (
            <div className="preview-content">
              {/* Header com Banner */}
              <div className="preview-header" style={{ background: banner ? `url(${banner})` : '#09913b' }}>
                <h1 className="preview-tenant-name">{tenantName}</h1>
              </div>

              {/* Agendar Agora Button */}
              <div className="preview-cta-button">
                <button className="btn-schedule">📅 Agendar Agora</button>
              </div>

              {/* Sobre Nós Section */}
              <div className="preview-section">
                <h2 className="preview-section-title">ℹ️ Sobre Nós</h2>
                <p className="preview-text">
                  {about || 'Bem-vindo ao nosso estabelecimento!'}
                </p>
              </div>

              {/* Horário de Funcionamento */}
              {Object.keys(businessHours).length > 0 && (
                <div className="preview-section">
                  <h2 className="preview-section-title">🕐 Horário de Funcionamento</h2>
                  <div className="preview-hours-list">
                    {Object.entries(businessHours)
                      .sort(([a], [b]) => {
                        const order = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                        return order.indexOf(a) - order.indexOf(b)
                      })
                      .map(([day, hours]) => (
                        <div key={day} className="preview-hour-row">
                          <span className="preview-hour-day">{dayNames[day] || day}</span>
                          <span className="preview-hour-time">{hours}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Endereço Section */}
              <div className="preview-section">
                <h2 className="preview-section-title">📍 Endereço</h2>
                <div className="preview-contact-item">
                  <p className="preview-text">
                    {address}<br />
                    {city}, {state} {zipCode}
                  </p>
                </div>
              </div>

              {/* Contato Section */}
              {(phone || email) && (
                <div className="preview-section">
                  <h2 className="preview-section-title">☎️ Contato</h2>
                  {phone && (
                    <div className="preview-contact-item">
                      <span className="preview-contact-label">Telefone:</span>
                      <p className="preview-text">{phone}</p>
                    </div>
                  )}
                  {email && (
                    <div className="preview-contact-item">
                      <span className="preview-contact-label">Email:</span>
                      <p className="preview-text">{email}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Redes Sociais */}
              {(socialMedia?.instagram || socialMedia?.facebook || socialMedia?.twitter) && (
                <div className="preview-section">
                  <h2 className="preview-section-title">🔗 Redes Sociais</h2>
                  <div className="preview-social-links">
                    {socialMedia?.instagram && (
                      <a href="#" className="preview-social-link">📷 Instagram: @{socialMedia.instagram}</a>
                    )}
                    {socialMedia?.facebook && (
                      <a href="#" className="preview-social-link">👍 Facebook: {socialMedia.facebook}</a>
                    )}
                    {socialMedia?.twitter && (
                      <a href="#" className="preview-social-link">🐦 Twitter: @{socialMedia.twitter}</a>
                    )}
                  </div>
                </div>
              )}

              {/* Formas de Pagamento */}
              {parsedPaymentMethods.length > 0 && (
                <div className="preview-section">
                  <h2 className="preview-section-title">💳 Formas de Pagamento</h2>
                  <div className="preview-payment-methods">
                    {parsedPaymentMethods.map((method, idx) => (
                      <div key={idx} className="preview-payment-item">
                        💰 {method}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comodidades */}
              {parsedAmenities.length > 0 && (
                <div className="preview-section">
                  <h2 className="preview-section-title">✨ Comodidades</h2>
                  <div className="preview-amenities-list">
                    {parsedAmenities.map((amenity, idx) => (
                      <div key={idx} className="preview-amenity-item">
                        ✓ {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="preview-footer">
                <p>© 2025 {tenantName}</p>
                <p>Desenvolvido por Agende AI</p>
              </div>
            </div>
          )}
        </div>
        <div className="phone-button" />
      </div>
    </div>
  )
}
