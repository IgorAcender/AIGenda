import { redirect } from 'next/navigation';
import Link from 'next/link';
import './landing-new.css';

interface LandingPageProps {
  params: Promise<{
    tenantSlug: string;
  }>;
}

interface TenantData {
  data: {
    tenant: {
      id: string;
      name: string;
      slug: string;
      description: string;
      phone: string;
      email: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      whatsapp?: string;
      logo?: string;
      banner?: string;
    };
    services: Array<{
      id: string;
      name: string;
      description: string;
      duration: number;
      price: number;
      category: {
        id: string;
        name: string;
      };
    }>;
    professionals: Array<{
      id: string;
      name: string;
      email: string;
      phone: string;
      avatar?: string;
    }>;
  };
}

export default async function LandingPage({ params }: LandingPageProps) {
  const { tenantSlug } = await params;

  let landingData: TenantData | null = null;
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/${tenantSlug}`, {
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      landingData = await response.json();
    }
  } catch (error) {
    console.error('Erro ao buscar dados do tenant:', error);
  }

  if (!landingData) {
    redirect('/');
  }

  const tenant = landingData.data.tenant;
  const services = landingData.data.services;
  const professionals = landingData.data.professionals;

  return (
    <div className="vintage-wrapper">
      {/* Fixed Header Bar */}
      <div className="fixed-header-bar">
        <h2 className="salon-name">{tenant.name}</h2>
        <button className="menu-icon">
          <i className="fas fa-bars"></i>
        </button>
      </div>

      {/* Header Section */}
      <div className="header-section">
        <div className="logo-container">
          {tenant.banner ? (
            <img src={tenant.banner} alt={tenant.name} />
          ) : (
            <div style={{ fontSize: '3.5rem' }}>💈</div>
          )}
        </div>
      </div>

      {/* CTA Button */}
      <div className="header-cta-button">
        <Link href={`/agendar/${tenantSlug}`} className="btn-schedule-header">
          <i className="fas fa-calendar-check"></i>
          Agendar Agora
        </Link>
      </div>

      {/* Secondary Button */}
      <div className="header-secondary-button">
        <Link href={`/${tenantSlug}/meus-agendamentos`} className="btn-my-bookings">
          <i className="fas fa-history"></i>
          Meus Agendamentos
        </Link>
      </div>

      {/* Content */}
      <div className="content">
        <div className="container">
          {/* Sobre Nós */}
          <section className="section">
            <h2 className="section-title">
              <i className="fas fa-info-circle"></i>
              Sobre Nós
            </h2>
            <p className="about-text">
              {tenant.description || `Bem-vindo ao ${tenant.name}! Somos dedicados a oferecer o melhor serviço com qualidade e profissionalismo.`}
            </p>
          </section>

          {/* Serviços */}
          {services.length > 0 && (
            <section className="section">
              <h2 className="section-title">
                <i className="fas fa-cut"></i>
                Nossos Serviços
              </h2>
              <div className="services-list">
                {services.map((service) => (
                  <div key={service.id} className="service-item">
                    <div className="service-info">
                      <h3 className="service-name">{service.name}</h3>
                      {service.description && (
                        <p className="service-desc">{service.description}</p>
                      )}
                    </div>
                    <div className="service-meta">
                      <span className="service-price">R$ {service.price.toFixed(2)}</span>
                      <span className="service-duration">{service.duration}min</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Profissionais */}
          {professionals.length > 0 && (
            <section className="section">
              <h2 className="section-title">
                <i className="fas fa-users"></i>
                Nossa Equipe
              </h2>
              <div className="team-grid">
                {professionals.map((prof) => (
                  <div key={prof.id} className="team-member-card">
                    <div className="team-member-avatar" style={{ background: '#09913b' }}>
                      {prof.avatar ? (
                        <img src={prof.avatar} alt={prof.name} />
                      ) : (
                        prof.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="team-member-info">
                      <p className="team-member-name">{prof.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Contato */}
          <section className="section">
            <h2 className="section-title">
              <i className="fas fa-phone"></i>
              Contato
            </h2>
            <div className="contact-grid">
              {tenant.address && (
                <div className="contact-item">
                  <i className="fas fa-map-marker-alt contact-icon"></i>
                  <div className="contact-content">
                    <p className="contact-label">Endereço</p>
                    <p className="contact-value">
                      {tenant.address}<br />
                      {tenant.city}, {tenant.state} {tenant.zipCode}
                    </p>
                  </div>
                </div>
              )}

              {(tenant.whatsapp || tenant.phone) && (
                <div className="contact-item">
                  <i className="fas fa-phone-alt contact-icon"></i>
                  <div className="contact-content">
                    <p className="contact-label">Telefone</p>
                    {tenant.whatsapp ? (
                      <a
                        href={`https://wa.me/${tenant.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-value"
                      >
                        {tenant.whatsapp}
                      </a>
                    ) : (
                      <p className="contact-value">{tenant.phone}</p>
                    )}
                  </div>
                </div>
              )}

              {tenant.email && (
                <div className="contact-item">
                  <i className="fas fa-envelope contact-icon"></i>
                  <div className="contact-content">
                    <p className="contact-label">Email</p>
                    <a href={`mailto:${tenant.email}`} className="contact-value">
                      {tenant.email}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Schedule CTA */}
          <section className="schedule-button-section">
            <Link href={`/agendar/${tenantSlug}`} className="btn-schedule-main">
              <div className="schedule-icon">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <span className="schedule-label">Agendar Horário</span>
            </Link>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <p>&copy; 2025 {tenant.name} - Todos os direitos reservados</p>
        <p>
          Desenvolvido com <i className="fas fa-heart"></i> por AIGenda
        </p>
      </div>
    </div>
  );
}
