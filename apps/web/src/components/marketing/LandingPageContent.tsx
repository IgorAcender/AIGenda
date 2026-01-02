'use client'

import Link from 'next/link'

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
          background: 'rgba(9, 145, 59, 0.1)',
          border: '1px solid rgba(9, 145, 59, 0.2)',
          color: '#09913b',
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
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '48px' }}>💈</span>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div style={{ padding: '0 16px', marginBottom: '16px' }}>
        <Link href={`/agendar/${tenantSlug}`} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          backgroundColor: '#09913b',
          color: '#fff',
          textAlign: 'center',
          padding: '14px 24px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '16px',
          marginBottom: '12px',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(9, 145, 59, 0.3)'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 5 7 13 17 13 17 5"></polyline>
          </svg>
          Agendar Agora
        </Link>
      </div>

      {/* Secondary Button */}
      <div style={{ padding: '0 16px', marginBottom: '20px', textAlign: 'center' }}>
        <Link href={`/${tenantSlug}/meus-agendamentos`} style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          backgroundColor: 'transparent',
          color: '#09913b',
          border: '1.5px solid #09913b',
          textAlign: 'center',
          padding: '8px 16px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '14px',
          transition: 'all 0.3s ease'
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

      {/* Main Content */}
      <div style={{ padding: '0 16px', paddingBottom: '40px', flex: 1 }}>
        {/* Sobre Nós */}
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px',
          borderLeft: '4px solid #09913b'
        }}>
          <h2 style={{
            fontSize: '16px',
            marginTop: 0,
            marginBottom: '12px',
            fontWeight: '600',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              backgroundColor: '#09913b',
              borderRadius: '6px'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </span>
            Sobre Nós
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#aaa',
            lineHeight: '1.6',
            margin: 0
          }}>
            {tenant.description || `Bem-vindo ao ${tenant.name}!`}
          </p>
        </div>

        {/* Serviços */}
        {services && services.length > 0 && (
          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
            borderLeft: '4px solid #09913b'
          }}>
            <h2 style={{
              fontSize: '16px',
              marginTop: 0,
              marginBottom: '12px',
              fontWeight: '600',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                backgroundColor: '#09913b',
                borderRadius: '6px'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </span>
              Nossos Serviços
            </h2>
            <div style={{ fontSize: '14px', color: '#aaa' }}>
              {services.map((service, idx) => (
                <div 
                  key={service.id} 
                  style={{
                    padding: '10px 0',
                    borderBottom: idx < services.length - 1 ? '1px solid #333' : 'none'
                  }}
                >
                  <div style={{ fontWeight: '500', color: '#fff' }}>
                    {service.name}
                  </div>
                  <div style={{ fontSize: '12px', marginTop: '4px', color: '#888' }}>
                    R$ {service.price.toFixed(2)} • {service.duration} min
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipe */}
        {professionals && professionals.length > 0 && (
          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
            borderLeft: '4px solid #09913b'
          }}>
            <h2 style={{
              fontSize: '16px',
              marginTop: 0,
              marginBottom: '12px',
              fontWeight: '600',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                backgroundColor: '#09913b',
                borderRadius: '6px'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </span>
              Nossa Equipe
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
              gap: '12px'
            }}>
              {professionals.map((prof) => (
                <div 
                  key={prof.id} 
                  style={{ textAlign: 'center' }}
                >
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    backgroundColor: '#09913b',
                    margin: '0 auto 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    border: '2px solid #1a1a1a'
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
                    fontSize: '12px',
                    margin: 0,
                    color: '#aaa',
                    fontWeight: '500'
                  }}>
                    {prof.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contato */}
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px',
          borderLeft: '4px solid #09913b'
        }}>
          <h2 style={{
            fontSize: '16px',
            marginTop: 0,
            marginBottom: '12px',
            fontWeight: '600',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              backgroundColor: '#09913b',
              borderRadius: '6px'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </span>
            Contato
          </h2>
          <div style={{ fontSize: '14px', color: '#aaa' }}>
            {tenant.phone && (
              <div style={{ marginBottom: '12px' }}>
                <a 
                  href={`https://wa.me/${tenant.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#09913b',
                    textDecoration: 'none',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.707 12.293l-5-5a1 1 0 00-1.414 1.414L15.586 11H6a1 1 0 000 2h9.586l-4.293 4.293a1 1 0 101.414 1.414l5-5a1 1 0 000-1.414z"></path>
                  </svg>
                  {tenant.phone}
                </a>
              </div>
            )}
            {tenant.email && (
              <div>
                <a 
                  href={`mailto:${tenant.email}`}
                  style={{
                    color: '#09913b',
                    textDecoration: 'none',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="m22 7-10 5L2 7"></path>
                  </svg>
                  {tenant.email}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
