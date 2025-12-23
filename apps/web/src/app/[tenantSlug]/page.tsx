import { redirect } from 'next/navigation';
import Link from 'next/link';
import './landing-elegant.css';

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
      latitude?: number;
      longitude?: number;
      socialMedia?: {
        instagram?: string;
        facebook?: string;
        twitter?: string;
      };
      paymentMethods?: string[];
      amenities?: string[];
      businessHours?: {
        monday?: string;
        tuesday?: string;
        wednesday?: string;
        thursday?: string;
        friday?: string;
        saturday?: string;
        sunday?: string;
      };
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
      email?: string;
      phone?: string;
      avatar?: string;
    }>;
  };
}

export default async function BarbershopLanding({ params }: LandingPageProps) {
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

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const daysLabel = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  return (
    <div>
      {/* Header Fixo */}
      <header className="landing-header">
        <div className="landing-logo">
          {tenant.logo ? (
            <img src={tenant.logo} alt={tenant.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
          ) : (
            <span>✂️</span>
          )}
          <span>{tenant.name}</span>
        </div>
        <button className="landing-menu-btn">☰</button>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        {tenant.banner ? (
          <img src={tenant.banner} alt={tenant.name} className="landing-hero-image" />
        ) : (
          <div className="landing-hero-image" style={{ background: 'linear-gradient(135deg, #09913b, #0aae46)' }} />
        )}
        <div className="landing-hero-content">
          <h1 className="landing-hero-title">{tenant.name}</h1>
          <p className="landing-hero-subtitle">Agendamento Online Facilitado ✨</p>
          <Link href={`/agendar/${tenantSlug}`} className="landing-cta-primary">
            ✓ Agendar Agora
          </Link>
          <Link href={`/agendar/${tenantSlug}?view=my-bookings`} className="landing-cta-secondary">
            📅 Meus Agendamentos
          </Link>
        </div>
      </section>

      <div className="landing-container">
        {/* Sobre */}
        <section className="landing-section">
          <h2 className="landing-section-title">
            <span className="landing-section-icon">ℹ️</span>
            Sobre Nós
          </h2>
          <p className="landing-about-text">
            {tenant.description || `Bem-vindo ao ${tenant.name}! Somos dedicados a oferecer os melhores serviços com profissionais experientes e ambiente acolhedor.`}
          </p>
          <div className="landing-stats">
            <div className="landing-stat">
              <div className="landing-stat-number">{professionals.length}+</div>
              <div className="landing-stat-label">Profissionais</div>
            </div>
            <div className="landing-stat">
              <div className="landing-stat-number">{services.length}+</div>
              <div className="landing-stat-label">Serviços</div>
            </div>
          </div>
        </section>

        {/* Profissionais */}
        {professionals.length > 0 && (
          <section className="landing-section">
            <h2 className="landing-section-title">
              <span className="landing-section-icon">👥</span>
              Profissionais
            </h2>
            <div className="landing-professionals-grid">
              {professionals.map((prof) => (
                <div key={prof.id} className="landing-professional">
                  <div className="landing-professional-avatar">
                    {prof.avatar ? (
                      <img src={prof.avatar} alt={prof.name} />
                    ) : (
                      <span>{prof.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <p className="landing-professional-name">{prof.name.split(' ')[0]}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Horários */}
        <section className="landing-section">
          <h2 className="landing-section-title">
            <span className="landing-section-icon">🕐</span>
            Horário de Funcionamento
          </h2>
          <div className="landing-hours-list">
            {tenant.businessHours ? (
              days.map((day, index) => (
                <div key={day} className="landing-hour-item">
                  <span className="landing-hour-day">{daysLabel[index]}</span>
                  <span className="landing-hour-time">
                    {tenant.businessHours?.[day as keyof typeof tenant.businessHours] || 'Fechado'}
                  </span>
                </div>
              ))
            ) : (
              <>
                <div className="landing-hour-item">
                  <span className="landing-hour-day">Seg-Sex</span>
                  <span className="landing-hour-time">08:00 - 18:00</span>
                </div>
                <div className="landing-hour-item">
                  <span className="landing-hour-day">Sábado</span>
                  <span className="landing-hour-time">08:00 - 14:00</span>
                </div>
                <div className="landing-hour-item">
                  <span className="landing-hour-day">Domingo</span>
                  <span className="landing-hour-time">Fechado</span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Contato */}
        <section className="landing-section">
          <h2 className="landing-section-title">
            <span className="landing-section-icon">📞</span>
            Contato
          </h2>
          <div className="landing-contact-section">
            {tenant.whatsapp && (
              <a
                href={`https://wa.me/${tenant.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="landing-whatsapp-btn"
              >
                💬 WhatsApp
              </a>
            )}

            {tenant.phone && (
              <div className="landing-contact-item">
                <div className="landing-contact-icon">📱</div>
                <div className="landing-contact-content">
                  <h3>Telefone</h3>
                  <p>
                    <a href={`tel:${tenant.phone}`} className="landing-contact-link">
                      {tenant.phone}
                    </a>
                  </p>
                </div>
              </div>
            )}

            {tenant.email && (
              <div className="landing-contact-item">
                <div className="landing-contact-icon">📧</div>
                <div className="landing-contact-content">
                  <h3>Email</h3>
                  <p>
                    <a href={`mailto:${tenant.email}`} className="landing-contact-link">
                      {tenant.email}
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Endereço */}
        <section className="landing-section">
          <h2 className="landing-section-title">
            <span className="landing-section-icon">📍</span>
            Endereço
          </h2>
          <div className="landing-address-info">
            {tenant.address && <p>{tenant.address}</p>}
            {tenant.city && tenant.state && <p>{tenant.city} - {tenant.state}</p>}
            {tenant.zipCode && <p>CEP: {tenant.zipCode}</p>}
            {tenant.latitude && tenant.longitude && (
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(tenant.address || `${tenant.city}, ${tenant.state}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="landing-maps-btn"
              >
                🗺️ Google Maps
              </a>
            )}
          </div>
        </section>

        {/* Redes Sociais */}
        {tenant.socialMedia && (Object.values(tenant.socialMedia).some(v => v)) && (
          <section className="landing-section">
            <h2 className="landing-section-title">
              <span className="landing-section-icon">🔗</span>
              Redes Sociais
            </h2>
            <div className="landing-social-grid">
              {tenant.socialMedia.instagram && (
                <a
                  href={`https://instagram.com/${tenant.socialMedia.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-social-btn"
                >
                  📷 Instagram
                </a>
              )}
              {tenant.socialMedia.facebook && (
                <a
                  href={`https://facebook.com/${tenant.socialMedia.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-social-btn"
                >
                  👍 Facebook
                </a>
              )}
              {tenant.socialMedia.twitter && (
                <a
                  href={`https://twitter.com/${tenant.socialMedia.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-social-btn"
                >
                  𝕏 Twitter
                </a>
              )}
            </div>
          </section>
        )}

        {/* Formas de Pagamento */}
        {tenant.paymentMethods && tenant.paymentMethods.length > 0 && (
          <section className="landing-section">
            <h2 className="landing-section-title">
              <span className="landing-section-icon">💳</span>
              Formas de Pagamento
            </h2>
            <div className="landing-payment-grid">
              {tenant.paymentMethods.map((method, index) => (
                <div key={index} className="landing-payment-item">
                  {method}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Comodidades */}
        {tenant.amenities && tenant.amenities.length > 0 && (
          <section className="landing-section">
            <h2 className="landing-section-title">
              <span className="landing-section-icon">✨</span>
              Comodidades
            </h2>
            <div className="landing-amenities-grid">
              {tenant.amenities.map((amenity, index) => (
                <div key={index} className="landing-amenity-item">
                  <span className="landing-amenity-icon">✓</span>
                  <span className="landing-amenity-text">{amenity}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="landing-footer">
        <p className="landing-footer-text">© 2025 {tenant.name}. Todos os direitos reservados.</p>
        <p className="landing-footer-text">Desenvolvido com ❤️ por Bora Agendar</p>
      </footer>
    </div>
  );
}
