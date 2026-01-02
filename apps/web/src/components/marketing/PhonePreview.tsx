'use client'

import React from 'react'
import { Spin } from 'antd'
import { useAuthStore } from '@/stores/auth'
import LandingPageContent from './LandingPageContent'
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
  services?: Array<{
    id: string
    name: string
    description?: string
    price: number
    duration: number
  }>
  professionals?: Array<{
    id: string
    name: string
    avatar?: string
  }>
}

export default function PhonePreview({
  loading = false,
  tenantName,
  description,
  banner,
  phone,
  email,
  services = [],
  professionals = [],
}: PhonePreviewProps) {
  const { tenant } = useAuthStore()
  const tenantSlug = tenant?.slug

  // Usar dados passados por props ou do tenant
  const displayTenant = {
    name: tenantName || tenant?.name || 'Seu Negócio',
    description: description || 'Sua descrição aparecerá aqui...',
    banner: banner || tenant?.banner,
    phone: phone || tenant?.phone,
    email: email || tenant?.email,
    slug: tenantSlug || '',
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
            <LandingPageContent
              tenant={displayTenant}
              services={services}
              professionals={professionals}
              tenantSlug={tenantSlug || ''}
              isPreview={true}
            />
          )}
        </div>
        <div className="phone-button" />
      </div>
    </div>
  )
}
