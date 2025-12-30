'use client'

import React from 'react'
import { Spin } from 'antd'
import { useAuthStore } from '@/stores/auth'
import './PhonePreview.css'

interface PhonePreviewProps {
  tenantSlug?: string
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
  loading = false,
}: PhonePreviewProps) {
  const { tenant } = useAuthStore()
  const tenantSlug = tenant?.slug

  // Construir URL da landing page
  const landingPageUrl = tenantSlug 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${tenantSlug}`
    : null

  return (
    <div className="phone-preview-container">
      <div className="phone-frame">
        <div className="phone-notch" />
        <div className="phone-screen">
          {loading ? (
            <div className="preview-loading">
              <Spin />
            </div>
          ) : landingPageUrl ? (
            <iframe
              src={landingPageUrl}
              className="phone-iframe"
              title="Landing Page Preview"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          ) : (
            <div className="preview-no-tenant">
              <p>Nenhum tenant configurado</p>
            </div>
          )}
        </div>
        <div className="phone-button" />
      </div>
    </div>
  )
}
