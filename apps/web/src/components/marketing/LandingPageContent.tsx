'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Service {
  id: string
  name: string
  description?: string
  price: number
  duration: number
}

interface Professional {
  id: string
  name: string
  avatar?: string
}

interface Tenant {
  name: string
  description?: string
  banner?: string
  phone?: string
  email?: string
  slug?: string
  landingBlocks?: LandingBlock[]
  businessHours?: { [key: string]: string }
  // Cores do tema
  themeTemplate?: string
  backgroundColor?: string
  textColor?: string
  buttonColorPrimary?: string
  buttonTextColor?: string
}

interface LandingBlock {
  id: string
  name: string
  label: string
  enabled: boolean
  order: number
}

interface LandingPageContentProps {
  tenant: Tenant
  services?: Service[]
  professionals?: Professional[]
  tenantSlug?: string
  isPreview?: boolean
}

export default function LandingPageContent({
  tenant,
  services = [],
  professionals = [],
  tenantSlug = '',
  isPreview: isPreviewProp = false
}: LandingPageContentProps) {
  // Detecta se está em modo preview via prop OU via URL param (?preview=1)
  const [isPreview, setIsPreview] = useState(isPreviewProp)
  const [showBannerOverlay, setShowBannerOverlay] = useState(true)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const previewParam = urlParams.get('preview')
      const overlayParam = urlParams.get('showBannerOverlay')
      
      if (previewParam === '1') {
        setIsPreview(true)
      }
      
      // Controlar o overlay baseado no parâmetro
      if (overlayParam !== null) {
        setShowBannerOverlay(overlayParam === 'true')
      }
    }
  }, [])

  const defaultBlocks: LandingBlock[] = [
    { id: 'sobre-nos', name: 'sobre-nos', label: 'Sobre Nós', enabled: true, order: 1 },
    { id: 'equipe', name: 'equipe', label: 'Profissionais', enabled: true, order: 2 },
    { id: 'horarios', name: 'horarios', label: 'Horário de Funcionamento', enabled: true, order: 3 },
    { id: 'contato', name: 'contato', label: 'Contato', enabled: true, order: 4 },
  ]

  // Função para fazer merge dos blocos salvos com os padrão
  const mergeBlocks = (savedBlocks: LandingBlock[] | undefined): LandingBlock[] => {
    if (!savedBlocks || savedBlocks.length === 0) {
      return defaultBlocks
    }
    
    const savedBlockIds = savedBlocks.map(b => b.id)
    const mergedBlocks = [...savedBlocks]
    
    // Adicionar blocos que não existem nos salvos
    defaultBlocks.forEach(defaultBlock => {
      if (!savedBlockIds.includes(defaultBlock.id)) {
        mergedBlocks.push({
          ...defaultBlock,
          order: mergedBlocks.length + 1
        })
      }
    })
    
    // Ordenar por order
    mergedBlocks.sort((a, b) => a.order - b.order)
    return mergedBlocks
  }

  const initialBlocks = mergeBlocks(tenant.landingBlocks)

  const [blocks, setBlocks] = useState<LandingBlock[]>(initialBlocks)

  // Cores do tema (com fallback para tema escuro)
  const theme = {
    backgroundColor: tenant.backgroundColor || '#000000',
    textColor: tenant.textColor || '#ffffff',
    buttonColor: tenant.buttonColorPrimary || '#22c55e',
    buttonTextColor: tenant.buttonTextColor || '#ffffff',
    // Cores derivadas
    cardBackground: tenant.backgroundColor === '#ffffff' || tenant.backgroundColor === '#FFFFFF' 
      ? 'rgba(0, 0, 0, 0.03)' 
      : 'rgba(255, 255, 255, 0.05)',
    borderColor: tenant.backgroundColor === '#ffffff' || tenant.backgroundColor === '#FFFFFF'
      ? 'rgba(0, 0, 0, 0.1)'
      : 'rgba(255, 255, 255, 0.1)',
    subtextColor: tenant.backgroundColor === '#ffffff' || tenant.backgroundColor === '#FFFFFF'
      ? '#666666'
      : '#cccccc',
  }

  useEffect(() => {
    // Atualiza blocos se vierem do tenant (SSR) ou volta ao padrão
    const nextBlocks = mergeBlocks(tenant.landingBlocks)
    setBlocks(nextBlocks)
  }, [tenant.landingBlocks])

  useEffect(() => {
    // Sempre carregar blocos da API pública para garantir dados atualizados
    // Isso é importante para o preview em tempo real funcionar corretamente
    if (tenantSlug) {
      console.log('🔄 LandingPageContent: Carregando blocos da API pública', tenantSlug, isPreview ? '(preview)' : '')
      loadBlocks(tenantSlug)
    } else {
      console.log('⚠️ LandingPageContent: Sem tenantSlug, usando blocos padrão')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantSlug])

  const loadBlocks = async (slug: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      
      const response = await fetch(`${baseUrl}/api/tenants/landing-blocks/${slug}`)
      
      console.log('📡 Resposta do GET /landing-blocks:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Blocos carregados da API:', JSON.stringify(data.blocks, null, 2))
        if (data.blocks && Array.isArray(data.blocks)) {
          // Log detalhado de cada bloco
          data.blocks.forEach((b: LandingBlock) => {
            console.log(`📦 Bloco ${b.id}: enabled=${b.enabled}, order=${b.order}`)
          })
          setBlocks(data.blocks)
        }
      } else {
        console.error('❌ Erro ao carregar blocos:', response.status)
        const error = await response.json()
        console.error('Detalhes:', error)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar blocos:', error)
    }
  }

  const getSortedBlocks = () => {
    return [...blocks].sort((a, b) => a.order - b.order)
  }

  const isBlockEnabled = (blockId: string) => {
    return blocks.find(b => b.id === blockId)?.enabled ?? true
  }

  const renderBlock = (blockId: string) => {
    switch (blockId) {
      case 'sobre-nos':
        if (!isBlockEnabled('sobre-nos')) return null
        return (
          <div key="sobre-nos" style={{
            background: theme.cardBackground,
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: `1px solid ${theme.borderColor}`,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}>
            <h2 style={{
              fontSize: '18px',
              marginTop: 0,
              marginBottom: '14px',
              fontWeight: '700',
              letterSpacing: '-0.2px',
              color: theme.textColor
            }}>
              Sobre Nós
            </h2>
            <p style={{
              fontSize: '15px',
              color: theme.subtextColor,
              lineHeight: '1.7',
              margin: 0,
              fontWeight: '400'
            }}>
              {tenant.description || `Bem-vindo ao ${tenant.name}!`}
            </p>
          </div>
        )

      case 'equipe':
        if (!isBlockEnabled('equipe') || !professionals || professionals.length === 0) return null
        return (
          <div key="equipe" style={{
            background: theme.cardBackground,
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: `1px solid ${theme.borderColor}`,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}>
            <h2 style={{
              fontSize: '18px',
              marginTop: 0,
              marginBottom: '14px',
              fontWeight: '700',
              letterSpacing: '-0.2px',
              color: theme.textColor
            }}>
              Nossa Equipe
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
              gap: '14px'
            }}>
              {professionals.map((prof) => (
                <div 
                  key={prof.id} 
                  style={{ textAlign: 'center' }}
                >
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    background: theme.cardBackground,
                    margin: '0 auto 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    border: `2px solid ${theme.borderColor}`,
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)'
                  }}>
                    {prof.avatar ? (
                      <img src={prof.avatar} alt={prof.name} style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }} />
                    ) : (
                      <span style={{ color: theme.textColor }}>
                        {prof.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p style={{
                    fontSize: '13px',
                    margin: 0,
                    color: theme.subtextColor,
                    fontWeight: '600',
                    lineHeight: '1.4'
                  }}>
                    {prof.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )

      case 'horarios':
        if (!isBlockEnabled('horarios')) return null
        const daysConfig = [
          { key: 'sunday', label: 'Domingo' },
          { key: 'monday', label: 'Segunda' },
          { key: 'tuesday', label: 'Terça' },
          { key: 'wednesday', label: 'Quarta' },
          { key: 'thursday', label: 'Quinta' },
          { key: 'friday', label: 'Sexta' },
          { key: 'saturday', label: 'Sábado' },
        ]
        return (
          <div key="horarios" style={{
            background: theme.cardBackground,
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '16px',
            border: `1px solid ${theme.borderColor}`,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}>
            <h2 style={{
              fontSize: '18px',
              marginTop: 0,
              marginBottom: '14px',
              fontWeight: '700',
              letterSpacing: '-0.2px',
              color: theme.textColor
            }}>
              Horário de Funcionamento
            </h2>
            <div style={{ fontSize: '14px' }}>
              {tenant.businessHours && Object.keys(tenant.businessHours).length > 0 ? (
                daysConfig.map((day, index) => {
                  const hours = tenant.businessHours?.[day.key]
                  if (!hours) return null
                  
                  // Separar horário e intervalo
                  const isClosed = hours === 'Fechado'
                  let mainHours = hours
                  let interval = ''
                  
                  if (!isClosed && hours.includes('(Intervalo:')) {
                    const match = hours.match(/^([\d:]+\s*-\s*[\d:]+)\s*\(Intervalo:\s*([\d:-]+)\)$/)
                    if (match) {
                      mainHours = match[1]
                      interval = match[2]
                    }
                  }
                  
                  return (
                    <div key={day.key} style={{ 
                      padding: '8px 0',
                      borderBottom: index < 6 ? `1px solid ${theme.borderColor}` : 'none'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontWeight: 500, color: theme.textColor }}>{day.label}</span>
                        <span style={{ color: theme.textColor, fontWeight: 500 }}>
                          {isClosed ? 'Fechado' : mainHours}
                        </span>
                      </div>
                      {interval && (
                        <div style={{ 
                          textAlign: 'right',
                          fontSize: '12px',
                          color: theme.subtextColor,
                          marginTop: '2px'
                        }}>
                          Intervalo: {interval}
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <p style={{ color: theme.subtextColor, fontStyle: 'italic' }}>
                  Horários não configurados
                </p>
              )}
            </div>
          </div>
        )

      case 'contato':
        if (!isBlockEnabled('contato')) return null
        return (
          <div key="contato" style={{
            background: theme.cardBackground,
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '16px',
            border: `1px solid ${theme.borderColor}`,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}>
            <h2 style={{
              fontSize: '18px',
              marginTop: 0,
              marginBottom: '14px',
              fontWeight: '700',
              letterSpacing: '-0.2px',
              color: theme.textColor
            }}>
              Contato
            </h2>
            <div style={{ fontSize: '15px', color: theme.subtextColor }}>
              {tenant.phone && (
                <div style={{ marginBottom: '12px' }}>
                  <a 
                    href={`https://wa.me/${tenant.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: theme.subtextColor,
                      textDecoration: 'none',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    📱 {tenant.phone}
                  </a>
                </div>
              )}
              {tenant.email && (
                <div>
                  <a 
                    href={`mailto:${tenant.email}`}
                    style={{
                      color: theme.subtextColor,
                      textDecoration: 'none',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    ✉️ {tenant.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Conteúdo mobile da landing page
  const MobileContent = () => (
    <div style={{
      backgroundColor: theme.backgroundColor,
      color: theme.textColor,
      fontFamily: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Premium Header */}
      <div style={{
        padding: '12px 20px',
        backgroundColor: theme.backgroundColor,
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${theme.borderColor}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        margin: 0,
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
      }}>
        <h1 style={{ 
          fontSize: '20px', 
          fontWeight: '700', 
          margin: 0,
          letterSpacing: '-0.5px',
          color: theme.textColor,
        }}>
          {tenant.name}
        </h1>
        <button style={{
          background: theme.cardBackground,
          border: `1px solid ${theme.borderColor}`,
          color: theme.textColor,
          cursor: 'pointer',
          padding: '10px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Hero Banner */}
      <div className="hero-banner-container" style={{
        width: '100%',
        backgroundColor: '#111',
        display: 'block',
        marginBottom: '20px',
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {tenant.banner ? (
          <>
            <img
              src={tenant.banner}
              alt="Banner do estabelecimento"
              className="hero-banner-image"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'contain',
                backgroundColor: '#111'
              }}
            />
            {/* Overlay com gradiente dinâmico */}
            {showBannerOverlay && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                width: '100%',
                height: '30%',
                background: `linear-gradient(to bottom, transparent 0%, ${theme.backgroundColor} 100%)`,
                pointerEvents: 'none',
                zIndex: 10
              }} />
            )}
          </>
        ) : (
          <div style={{
            width: '100%',
            padding: isPreview ? '40px 0' : '56px 0',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)'
          }}>
          </div>
        )}
      </div>

      {/* Premium CTA Section */}
      <div style={{ 
        padding: '24px 16px 20px 16px',
        background: `linear-gradient(135deg, ${theme.buttonColor}10 0%, transparent 100%)`,
        borderBottom: `1px solid ${theme.borderColor}`
      }}>
        <Link href={`/agendar/${tenantSlug}`} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          backgroundColor: theme.buttonColor,
          color: theme.buttonTextColor,
          textAlign: 'center',
          padding: '16px 32px',
          borderRadius: '10px',
          textDecoration: 'none',
          fontWeight: '700',
          fontSize: '16px',
          marginBottom: '12px',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: `0 8px 24px ${theme.buttonColor}40`,
          letterSpacing: '0.3px'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 5 7 13 17 13 17 5"></polyline>
          </svg>
          Agendar Agora
        </Link>

        {/* Secondary Button */}
        <div style={{ paddingTop: '8px', textAlign: 'center' }}>
          <Link href={`/${tenantSlug}/meus-agendamentos`} style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: 'transparent',
            color: theme.buttonColor,
            border: `1.5px solid ${theme.buttonColor}60`,
            textAlign: 'center',
            padding: '10px 18px',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.3s ease',
            letterSpacing: '0.2px'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Meus Agendamentos
          </Link>
        </div>
      </div>

      {/* Main Content - Premium */}
      <div style={{ padding: '24px 16px 40px 16px', flex: 1 }}>
        {/* Renderizar blocos em ordem */}
        {(() => {
          const sortedBlocks = getSortedBlocks()
          console.log('🎨 Renderizando blocos. Total carregados:', blocks.length)
          console.log('📊 Ordem dos blocos:', sortedBlocks.map(b => ({ id: b.id, enabled: b.enabled, order: b.order })))
          return sortedBlocks.map((block) => renderBlock(block.id))
        })()}

        {/* Serviços */}
        {services && services.length > 0 && (
          <div style={{
            background: theme.cardBackground,
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: `1px solid ${theme.borderColor}`,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}>
            <h2 style={{
              fontSize: '18px',
              marginTop: 0,
              marginBottom: '14px',
              fontWeight: '700',
              letterSpacing: '-0.2px',
              color: theme.textColor,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                background: theme.cardBackground,
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.subtextColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </span>
              Nossos Serviços
            </h2>
            <div style={{ fontSize: '15px', color: theme.subtextColor }}>
              {services.map((service, idx) => (
                <div 
                  key={service.id} 
                  style={{
                    padding: '12px 0',
                    borderBottom: idx < services.length - 1 ? `1px solid ${theme.borderColor}` : 'none'
                  }}
                >
                  <div style={{ fontWeight: '600', color: theme.textColor, fontSize: '15px' }}>
                    {service.name}
                  </div>
                  <div style={{ fontSize: '13px', marginTop: '4px', color: theme.subtextColor }}>
                    R$ {service.price.toFixed(2)} • {service.duration} min
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Se for preview (iframe no admin), mostra direto o conteúdo mobile sem wrapper
  if (isPreview) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: `
          /* Esconde scrollbar no preview */
          html, body {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          html::-webkit-scrollbar,
          body::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
        `}} />
        <MobileContent />
      </>
    )
  }

  // Wrapper para desktop - simula tela de celular
  return (
    <>
      {/* Estilos CSS para responsividade - carrega ANTES do JS */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Esconde tudo até CSS carregar - evita flash */
        .desktop-phone-wrapper { display: none !important; }
        .mobile-direct { display: none !important; }
        
        @media (min-width: 768px) {
          .desktop-phone-wrapper { display: flex !important; }
          .mobile-direct { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-phone-wrapper { display: none !important; }
          .mobile-direct { display: block !important; }
        }
      `}} />

      {/* Versão Desktop - Simula celular */}
      <div 
        className="desktop-phone-wrapper"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Efeitos de fundo */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle at 30% 20%, rgba(9, 145, 59, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          right: '-30%',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 70% 80%, rgba(9, 145, 59, 0.08) 0%, transparent 40%)',
          pointerEvents: 'none'
        }} />

        {/* Informações laterais */}
        <div style={{
          position: 'absolute',
          left: '5%',
          top: '50%',
          transform: 'translateY(-50%)',
          maxWidth: '300px',
          color: '#fff',
          zIndex: 10
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #fff 0%, #09913b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {tenant.name}
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: '1.6',
            marginBottom: '24px'
          }}>
            Agende seus serviços de forma rápida e prática pelo celular ou desktop.
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '14px'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
            Visualização otimizada para mobile
          </div>
        </div>

        {/* Frame do celular */}
        <div style={{
          position: 'relative',
          width: '375px',
          height: '812px',
          background: '#000',
          borderRadius: '50px',
          padding: '12px',
          boxShadow: '0 50px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1), inset 0 0 0 1px rgba(255,255,255,0.05)',
          zIndex: 20
        }}>
          {/* Notch do iPhone */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '150px',
            height: '30px',
            background: '#000',
            borderRadius: '0 0 20px 20px',
            zIndex: 30
          }} />
          
          {/* Dynamic Island */}
          <div style={{
            position: 'absolute',
            top: '18px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '120px',
            height: '35px',
            background: '#1a1a1a',
            borderRadius: '20px',
            zIndex: 31,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: '12px'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              background: '#1a3a2a',
              borderRadius: '50%',
              boxShadow: '0 0 4px rgba(9, 145, 59, 0.5)'
            }} />
          </div>

          {/* Tela do celular */}
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '40px',
            overflow: 'hidden',
            background: '#000'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              overflow: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}>
              <MobileContent />
            </div>
          </div>

          {/* Barra inferior (home indicator) */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '134px',
            height: '5px',
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '3px'
          }} />
        </div>

        {/* QR Code ou link */}
        <div style={{
          position: 'absolute',
          right: '5%',
          top: '50%',
          transform: 'translateY(-50%)',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.6)',
          zIndex: 10
        }}>
          <div style={{
            width: '140px',
            height: '140px',
            background: '#fff',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            padding: '10px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            {/* QR Code gerado via API externa - em dev usa IP local, em prod usa URL real */}
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                typeof window !== 'undefined' 
                  ? (window.location.hostname === 'localhost' 
                      ? window.location.href.replace('localhost', '172.20.10.2')
                      : window.location.href)
                  : `https://agende.ai/${tenantSlug}`
              )}&bgcolor=ffffff&color=000000&margin=0`}
              alt="QR Code para acessar no celular"
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '8px'
              }}
            />
          </div>
          <p style={{ fontSize: '13px', margin: 0, fontWeight: '500' }}>
            Escaneie para acessar<br/>no seu celular
          </p>
        </div>
      </div>

      {/* Versão Mobile - Direto */}
      <div className="mobile-direct">
        <MobileContent />
      </div>
    </>
  )
}
