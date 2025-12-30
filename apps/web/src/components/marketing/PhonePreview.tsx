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
  }
  tenantName?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  description?: string
  loading?: boolean
}

export default function PhonePreview({
  businessHours = {},
  paymentMethods = [],
  amenities = [],
  socialMedia = {},
  tenantName = 'Vintage',
  address = 'Rua Pau Brasil 381',
  city = 'Divinópolis',
  state = 'MG',
  zipCode = '35501576',
  description = 'Somos uma barbearia com profissionais experientes.',
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
              {/* Header */}
              <div className="preview-header">
                <h2 className="preview-title">{tenantName}</h2>
              </div>

              {/* About Section */}
              <div className="preview-section">
                <h3 className="preview-section-title">ℹ️ Sobre Nós</h3>
                <p className="preview-text">{description}</p>
              </div>

              {/* Business Hours */}
              {Object.keys(businessHours).length > 0 && (
                <div className="preview-section">
                  <h3 className="preview-section-title">🕐 Horários</h3>
                  <div className="preview-hours">
                    {Object.entries(businessHours).map(([day, hours]) => (
                      <div key={day} className="preview-hour-item">
                        <span className="preview-hour-day">
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </span>
                        <span className="preview-hour-time">{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Section */}
              <div className="preview-section">
                <h3 className="preview-section-title">📍 Endereço</h3>
                <p className="preview-text">
                  {address}<br />
                  {city}, {state} {zipCode}
                </p>
              </div>

              {/* Social Media */}
              {(socialMedia?.instagram || socialMedia?.facebook) && (
                <div className="preview-section">
                  <h3 className="preview-section-title">🔗 Redes</h3>
                  <div className="preview-social">
                    {socialMedia?.instagram && (
                      <a href="#" className="preview-social-link">📷 Instagram</a>
                    )}
                    {socialMedia?.facebook && (
                      <a href="#" className="preview-social-link">👍 Facebook</a>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Methods */}
              {parsedPaymentMethods.length > 0 && (
                <div className="preview-section">
                  <h3 className="preview-section-title">💳 Pagamento</h3>
                  <div className="preview-payments">
                    {parsedPaymentMethods.map((method, idx) => (
                      <div key={idx} className="preview-payment-item">
                        {method}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities */}
              {parsedAmenities.length > 0 && (
                <div className="preview-section">
                  <h3 className="preview-section-title">✨ Comodidades</h3>
                  <div className="preview-amenities">
                    {parsedAmenities.map((amenity, idx) => (
                      <div key={idx} className="preview-amenity-item">
                        ✓ {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="phone-button" />
      </div>
    </div>
  )
}
