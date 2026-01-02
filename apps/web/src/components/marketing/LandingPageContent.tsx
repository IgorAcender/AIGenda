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
      fontFamily: 'system-ui, -apple-system, sans-serif',
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        backgroundColor: '#1a1a1a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #333',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        margin: 0
      }}>
        <h1 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          margin: 0 
        }}>
          {tenant.name}
        </h1>
        <button style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          fontSize: '24px',
          cursor: 'pointer'
        }}>
          ☰
        </button>
      </div>

      {/* Hero Banner */}
      <div style={{
        width: '100%',
        height: isPreview ? '150px' : '200px',
        backgroundColor: '#333',
        backgroundImage: tenant.banner ? `url(${tenant.banner})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        {!tenant.banner && (
          <span style={{ fontSize: '48px' }}>💈</span>
        )}
      </div>

      {/* CTA Button */}
      <div style={{ padding: '0 16px', marginBottom: '16px' }}>
        <Link href={`/agendar/${tenantSlug}`} style={{
          display: 'block',
          backgroundColor: '#4CAF50',
          color: '#fff',
          textAlign: 'center',
          padding: '14px 24px',
          borderRadius: '25px',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '16px',
          marginBottom: '12px',
          border: 'none',
          cursor: 'pointer'
        }}>
          📅 Agendar Agora
        </Link>
      </div>

      {/* Secondary Button */}
      <div style={{ padding: '0 16px', marginBottom: '20px' }}>
        <Link href={`/${tenantSlug}/meus-agendamentos`} style={{
          display: 'block',
          backgroundColor: 'transparent',
          color: '#fff',
          border: '2px solid #4CAF50',
          textAlign: 'center',
          padding: '12px 24px',
          borderRadius: '25px',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          📋 Meus Agendamentos
        </Link>
      </div>

      {/* Main Content */}
      <div style={{ padding: '0 16px', paddingBottom: '40px', flex: 1 }}>
        {/* Sobre Nós */}
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <h2 style={{
            fontSize: '16px',
            marginTop: 0,
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ℹ️ Sobre Nós
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
            marginBottom: '16px'
          }}>
            <h2 style={{
              fontSize: '16px',
              marginTop: 0,
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ✂️ Nossos Serviços
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
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    R$ {service.price.toFixed(2)} • {service.duration}min
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
            marginBottom: '16px'
          }}>
            <h2 style={{
              fontSize: '16px',
              marginTop: 0,
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              👥 Nossa Equipe
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
                    backgroundColor: '#4CAF50',
                    margin: '0 auto 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    fontSize: '28px',
                    fontWeight: 'bold'
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
                    fontSize: '12px',
                    margin: 0,
                    color: '#aaa'
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
          marginBottom: '16px'
        }}>
          <h2 style={{
            fontSize: '16px',
            marginTop: 0,
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📞 Contato
          </h2>
          <div style={{ fontSize: '14px', color: '#aaa' }}>
            {tenant.phone && (
              <div style={{ marginBottom: '12px' }}>
                <a 
                  href={`https://wa.me/${tenant.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#4CAF50',
                    textDecoration: 'none',
                    fontWeight: '500'
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
                    color: '#4CAF50',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}
                >
                  ✉️ {tenant.email}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
