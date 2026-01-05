'use client'

import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react'
import { Spin, Button, Tooltip } from 'antd'
import { ReloadOutlined, ExportOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/stores/auth'
import './PhonePreview.css'

interface PhonePreviewProps {
  tenantSlug?: string
  loading?: boolean
}

export interface PhonePreviewRef {
  refresh: () => void
}

const PhonePreview = forwardRef<PhonePreviewRef, PhonePreviewProps>(({
  loading = false,
}, ref) => {
  const { tenant } = useAuthStore()
  const tenantSlug = tenant?.slug
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeLoading, setIframeLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const previewUrl = tenantSlug ? `/${tenantSlug}?preview=1` : ''

  const handleRefresh = () => {
    setIframeLoading(true)
    setRefreshKey(prev => prev + 1)
  }

  // Expõe a função de refresh para o componente pai
  useImperativeHandle(ref, () => ({
    refresh: handleRefresh
  }))

  const handleOpenInNewTab = () => {
    if (tenantSlug) {
      window.open(`/${tenantSlug}`, '_blank')
    }
  }

  const handleIframeLoad = () => {
    setIframeLoading(false)
  }

  if (!tenantSlug) {
    return (
      <div className="phone-preview-container">
        <div className="phone-frame">
          <div className="phone-notch" />
          <div className="phone-screen">
            <div className="preview-loading">
              <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                Nenhum negócio selecionado
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="phone-preview-container">
      {/* Botões de ação */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '12px',
        justifyContent: 'center'
      }}>
        <Tooltip title="Atualizar preview">
          <Button 
            icon={<ReloadOutlined spin={iframeLoading} />} 
            onClick={handleRefresh}
            size="small"
          >
            Atualizar
          </Button>
        </Tooltip>
        <Tooltip title="Abrir em nova aba">
          <Button 
            icon={<ExportOutlined />} 
            onClick={handleOpenInNewTab}
            size="small"
          >
            Abrir
          </Button>
        </Tooltip>
      </div>

      <div className="phone-frame">
        <div className="phone-notch" />
        <div className="phone-screen">
          {(loading || iframeLoading) && (
            <div className="preview-loading" style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.9)',
              zIndex: 10
            }}>
              <Spin />
            </div>
          )}
          <iframe
            ref={iframeRef}
            key={refreshKey}
            src={previewUrl}
            onLoad={handleIframeLoad}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '35px',
              scrollbarWidth: 'none',
            }}
            title="Preview da Landing Page"
          />
        </div>
      </div>
      
      <p style={{ 
        textAlign: 'center', 
        fontSize: '11px', 
        color: '#999', 
        marginTop: '8px',
        maxWidth: '200px'
      }}>
        Salve as alterações e clique em "Atualizar"
      </p>
    </div>
  )
})

PhonePreview.displayName = 'PhonePreview'

export default PhonePreview
