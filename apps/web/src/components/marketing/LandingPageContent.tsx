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
  isPreview = false
}: LandingPageContentProps) {
  const [blocks, setBlocks] = useState<LandingBlock[]>([
    { id: 'sobre-nos', name: 'Sobre Nós', label: 'Sobre Nós', enabled: true, order: 1 },
    { id: 'equipe', name: 'Profissionais', label: 'Profissionais', enabled: true, order: 2 },
    { id: 'contato', name: 'Horário', label: 'Horário de Funcionamento', enabled: true, order: 3 },
  ])

  useEffect(() => {
    // Carregar configurações de blocos
    if (!isPreview) {
      console.log('🔄 LandingPageContent: Carregando blocos da API (isPreview=false)')
      loadBlocks()
    } else {
      console.log('⏭️ LandingPageContent: Preview mode ativado, usando blocos padrão')
    }
  }, [isPreview])

  const loadBlocks = async () => {
    try {
      const token = localStorage.getItem('token')
      console.log('🔐 Token disponível:', !!token)
      
      const response = await fetch(`http://localhost:3001/api/tenants/landing-blocks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      console.log('📡 Resposta do GET /landing-blocks:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Blocos carregados da API:', data.blocks)
        if (data.blocks && Array.isArray(data.blocks)) {
          console.log('📦 Atualizando estado com blocos:', data.blocks)
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
            background: 'linear-gradient(135deg, rgba(42, 42, 42, 0.4) 0%, rgba(42, 42, 42, 0.2) 100%)',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}>
            <h2 style={{
              fontSize: '18px',
              marginTop: 0,
              marginBottom: '14px',
              fontWeight: '700',
              letterSpacing: '-0.2px'
            }}>
              Sobre Nós
            </h2>
            <p style={{
              fontSize: '15px',
              color: '#ccc',
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
            background: 'linear-gradient(135deg, rgba(42, 42, 42, 0.4) 0%, rgba(42, 42, 42, 0.2) 100%)',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}>
            <h2 style={{
              fontSize: '18px',
              marginTop: 0,
              marginBottom: '14px',
              fontWeight: '700',
              letterSpacing: '-0.2px'
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
                    background: '#2a2a2a',
                    margin: '0 auto 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)'
                  }}>
                    {prof.avatar ? (
                      <img src={prof.avatar} alt={prof.name} style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }} />
                    ) : (
                      <span style={{ color: '#fff' }}>
                        {prof.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p style={{
                    fontSize: '13px',
                    margin: 0,
                    color: '#ccc',
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

      case 'contato':
        if (!isBlockEnabled('contato')) return null
        return (
          <div key="contato" style={{
            background: 'linear-gradient(135deg, rgba(42, 42, 42, 0.4) 0%, rgba(42, 42, 42, 0.2) 100%)',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '16px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}>
            <h2 style={{
              fontSize: '18px',
              marginTop: 0,
              marginBottom: '14px',
              fontWeight: '700',
              letterSpacing: '-0.2px'
            }}>
              Contato
            </h2>
            <div style={{ fontSize: '15px', color: '#ccc' }}>
              {tenant.phone && (
                <div style={{ marginBottom: '12px' }}>
                  <a 
                    href={`https://wa.me/${tenant.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#ccc',
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
                      color: '#ccc',
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
  return (
    <div style={{
      backgroundColor: '#000',
      color: '#fff',
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
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(9, 145, 59, 0.1)',
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
          background: 'linear-gradient(135deg, #fff 0%, #aaa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          {tenant.name}
        </h1>
        <button style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#fff',
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
        overflow: 'hidden'
      }}>
        {tenant.banner ? (
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
        background: 'linear-gradient(135deg, rgba(9, 145, 59, 0.05) 0%, rgba(9, 145, 59, 0) 100%)',
        borderBottom: '1px solid rgba(9, 145, 59, 0.1)'
      }}>
        <Link href={`/agendar/${tenantSlug}`} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          backgroundColor: '#09913b',
          color: '#fff',
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
          boxShadow: '0 8px 24px rgba(9, 145, 59, 0.3)',
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
            color: '#09913b',
            border: '1.5px solid rgba(9, 145, 59, 0.4)',
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
            background: 'linear-gradient(135deg, rgba(42, 42, 42, 0.4) 0%, rgba(42, 42, 42, 0.2) 100%)',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}>
            <h2 style={{
              fontSize: '18px',
              marginTop: 0,
              marginBottom: '14px',
              fontWeight: '700',
              letterSpacing: '-0.2px',
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
                background: '#2a2a2a',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </span>
              Nossos Serviços
            </h2>
            <div style={{ fontSize: '15px', color: '#ccc' }}>
              {services.map((service, idx) => (
                <div 
                  key={service.id} 
                  style={{
                    padding: '12px 0',
                    borderBottom: idx < services.length - 1 ? '1px solid rgba(9, 145, 59, 0.1)' : 'none'
                  }}
                >
                  <div style={{ fontWeight: '600', color: '#fff', fontSize: '15px' }}>
                    {service.name}
                  </div>
                  <div style={{ fontSize: '13px', marginTop: '4px', color: '#999' }}>
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
}
