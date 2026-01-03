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

interface LandingPagePremiumProps {
  tenant: Tenant
  services?: Service[]
  professionals?: Professional[]
  tenantSlug?: string
  isPreview?: boolean
}

export default function LandingPagePremium({
  tenant,
  services = [],
  professionals = [],
  tenantSlug = '',
  isPreview = false
}: LandingPagePremiumProps) {
  return (
    <div style={{
      backgroundColor: '#000',
      color: '#fff',
      fontFamily: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Animated Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(9, 145, 59, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(9, 145, 59, 0.05) 0%, transparent 50%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Premium Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        background: 'rgba(0, 0, 0, 0.6)',
        padding: '16px 20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '800',
            margin: 0,
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #fff 0%, #ccc 100%)',
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
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}>
            Menu
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        zIndex: 1,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto'
      }}>
        {/* Banner com Gradiente */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '280px',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
          overflow: 'hidden'
        }}>
          {tenant.banner ? (
            <>
              <img
                src={tenant.banner}
                alt="Banner"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              {/* Gradiente de Fade Out */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '100px',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.4))',
                pointerEvents: 'none'
              }} />
            </>
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '64px'
            }}>
              🏢
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '40px 20px',
          flex: 1
        }}>
          {/* CTA Buttons - Premium Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '12px',
            marginBottom: '48px',
            alignItems: 'start'
          }}>
            <Link href={`/agendar/${tenantSlug}`} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              backgroundColor: '#09913b',
              color: '#fff',
              padding: '18px 32px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '16px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 12px 30px rgba(9, 145, 59, 0.4)',
              letterSpacing: '0.3px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Agendar Agora
            </Link>
            <Link href={`/${tenantSlug}/meus-agendamentos`} style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: 'transparent',
              color: '#09913b',
              padding: '16px 20px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '14px',
              border: '2px solid #09913b',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              letterSpacing: '0.2px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z"></path>
              </svg>
              Meus Agendamentos
            </Link>
          </div>

          {/* Description Section */}
          {tenant.description && (
            <div style={{
              marginBottom: '48px',
              paddingBottom: '32px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                marginTop: 0,
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>
                Bem-vindo
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#ccc',
                lineHeight: '1.8',
                margin: 0,
                maxWidth: '600px'
              }}>
                {tenant.description}
              </p>
            </div>
          )}

          {/* Services Grid */}
          {services && services.length > 0 && (
            <div style={{ marginBottom: '48px' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                marginTop: 0,
                marginBottom: '24px',
                letterSpacing: '-0.3px'
              }}>
                Nossos Serviços
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px'
              }}>
                {services.map((service) => (
                  <div key={service.id} style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%)',
                    border: '1px solid rgba(9, 145, 59, 0.2)',
                    borderRadius: '12px',
                    padding: '20px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      margin: '0 0 8px 0',
                      color: '#fff'
                    }}>
                      {service.name}
                    </h3>
                    {service.description && (
                      <p style={{
                        fontSize: '14px',
                        color: '#aaa',
                        margin: '0 0 12px 0',
                        lineHeight: '1.6'
                      }}>
                        {service.description}
                      </p>
                    )}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#09913b'
                      }}>
                        R$ {service.price.toFixed(2)}
                      </span>
                      <span style={{
                        fontSize: '13px',
                        color: '#888'
                      }}>
                        {service.duration} min
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Section */}
          {professionals && professionals.length > 0 && (
            <div style={{ marginBottom: '48px' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                marginTop: 0,
                marginBottom: '24px',
                letterSpacing: '-0.3px'
              }}>
                Nossa Equipe
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '20px'
              }}>
                {professionals.map((prof) => (
                  <div key={prof.id} style={{
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '16px',
                      background: prof.avatar ? 'transparent' : '#1a1a1a',
                      margin: '0 auto 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      border: '2px solid rgba(9, 145, 59, 0.3)',
                      fontSize: '40px',
                      fontWeight: 'bold',
                      color: '#09913b'
                    }}>
                      {prof.avatar ? (
                        <img src={prof.avatar} alt={prof.name} style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }} />
                      ) : (
                        prof.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <p style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      margin: 0,
                      color: '#fff',
                      lineHeight: '1.4'
                    }}>
                      {prof.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Section */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(9, 145, 59, 0.1) 0%, rgba(9, 145, 59, 0.03) 100%)',
            border: '1px solid rgba(9, 145, 59, 0.2)',
            borderRadius: '16px',
            padding: '32px',
            marginTop: '48px'
          }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: '700',
              marginTop: 0,
              marginBottom: '20px',
              letterSpacing: '-0.2px'
            }}>
              Fale Conosco
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {tenant.phone && (
                <a href={`https://wa.me/${tenant.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#09913b',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 10.5V7a1 1 0 0 0-1-1H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6.5"></path>
                    <path d="M16 8h3m-3 4h3m-3 4h3"></path>
                  </svg>
                  {tenant.phone}
                </a>
              )}
              {tenant.email && (
                <a href={`mailto:${tenant.email}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#09913b',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                  {tenant.email}
                </a>
              )}
            </div>
          </div>

          {/* Footer Spacing */}
          <div style={{ height: '40px' }} />
        </div>
      </section>
    </div>
  )
}
