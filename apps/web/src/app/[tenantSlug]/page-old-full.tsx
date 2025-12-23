import { redirect } from 'next/navigation';
import Link from 'next/link';
import './landing.css';

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

  return (
    <div>
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-container">
          <div className="landing-nav-brand">
            {tenant.logo ? (
              <img src={tenant.logo} alt={tenant.name} className="landing-nav-logo" />
            ) : (
              <div className="landing-nav-logo-placeholder">✂️</div>
            )}
            <span className="landing-nav-title">{tenant.name}</span>
          </div>
          <Link href={`/agendar/${tenantSlug}`} className="landing-btn">
            Agendar Agora
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-container">
          <div className="landing-hero-grid">
            <div className="landing-hero-content">
              <div>
                <h1 className="landing-hero-title">{tenant.name}</h1>
                <p className="landing-hero-subtitle">Agendamentos online facilitados ✨</p>
              </div>

              <p className="landing-hero-description">
                {tenant.description || 'Confira nossa página e agende seu horário de forma rápida e fácil! Profissionais experientes à sua espera.'}
              </p>

              <div className="landing-hero-actions">
                <Link href={`/agendar/${tenantSlug}`} className="landing-btn-primary">
                  📅 Agendar Agora
                </Link>
              </div>

              <div className="landing-stats">
                <div className="landing-stat-card">
                  <p className="landing-stat-number">{professionals.length}</p>
                  <p className="landing-stat-label">Profissionais</p>
                </div>
                <div className="landing-stat-card">
                  <p className="landing-stat-number">{services.length}</p>
                  <p className="landing-stat-label">Serviços</p>
                </div>
                <div className="landing-stat-card">
                  <p className="landing-stat-number">5</p>
                  <p className="landing-stat-label">⭐ Avaliação</p>
                </div>
              </div>
            </div>

            <div className="landing-hero-image">
              <div className="landing-hero-image-glow"></div>
              <div className="landing-hero-image-container">
                {tenant.banner ? (
                  <img src={tenant.banner} alt={tenant.name} />
                ) : (
                  <div className="landing-hero-image-placeholder">
                    <div className="landing-hero-image-icon">💈</div>
                    <p className="landing-hero-image-text">{tenant.name}</p>
                    <p className="landing-hero-image-subtext">Agendamento Online</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-section landing-section-alt">
        <div className="landing-container">
          <h2 className="landing-section-title">Por que escolher a gente?</h2>

          <div className="landing-grid">
            <div className="landing-card">
              <div className="landing-card-icon">📅</div>
              <h3 className="landing-card-title">Agendamento Online</h3>
              <p className="landing-card-description">
                Escolha seu horário com facilidade em qualquer hora do dia
              </p>
            </div>

            <div className="landing-card">
              <div className="landing-card-icon">⏰</div>
              <h3 className="landing-card-title">Atendimento Rápido</h3>
              <p className="landing-card-description">
                Profissionais experientes que respeitam seu tempo
              </p>
            </div>

            <div className="landing-card">
              <div className="landing-card-icon">⭐</div>
              <h3 className="landing-card-title">Qualidade Garantida</h3>
              <p className="landing-card-description">
                Técnicas modernas e produtos de alta qualidade
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="landing-section">
        <div className="landing-container">
          <h2 className="landing-section-title">Sobre Nós</h2>
          <p className="landing-section-subtitle">Conheça nossa história e missão</p>
          
          <div className="landing-about-content">
            <p className="landing-about-text">
              {tenant.description || 'Bem-vindo ao ' + tenant.name + '! Somos dedicados a oferecer os melhores serviços de barbearia com profissionais experientes e um ambiente acolhedor.'}
            </p>
            
            <div className="landing-about-stats">
              <div className="landing-about-stat">
                <h3 className="landing-stat-number">{professionals.length}+</h3>
                <p className="landing-stat-label">Profissionais</p>
              </div>
              <div className="landing-about-stat">
                <h3 className="landing-stat-number">{services.length}+</h3>
                <p className="landing-stat-label">Serviços</p>
              </div>
              <div className="landing-about-stat">
                <h3 className="landing-stat-number">⭐ 5.0</h3>
                <p className="landing-stat-label">Avaliação</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professionals Section */}
      <section className="landing-section landing-section-alt">
        <div className="landing-container">
          <h2 className="landing-section-title">Nossos Profissionais</h2>
          <p className="landing-section-subtitle">Conheça a equipe experiente</p>

          {professionals.length > 0 ? (
            <div className="landing-professionals-grid">
              {professionals.map((prof) => (
                <div key={prof.id} className="landing-professional-card">
                  <div className="landing-professional-avatar">
                    {prof.avatar ? (
                      <img src={prof.avatar} alt={prof.name} />
                    ) : (
                      <div className="landing-professional-avatar-placeholder">
                        {prof.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h3 className="landing-professional-name">{prof.name}</h3>
                  {prof.phone && (
                    <a
                      href={`tel:${prof.phone}`}
                      className="landing-professional-contact"
                    >
                      📞 {prof.phone}
                    </a>
                  )}
                  <Link
                    href={`/agendar/${tenantSlug}?professional=${prof.id}`}
                    className="landing-professional-book"
                  >
                    Agendar com {prof.name.split(' ')[0]}
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="landing-services-empty">
              <p className="landing-services-empty-text">Nenhum profissional disponível no momento</p>
            </div>
          )}
        </div>
      </section>
      <section className="landing-section">
        <div className="landing-container">
          <div>
            <h2 className="landing-section-title">Nossos Serviços</h2>
            <p className="landing-section-subtitle">Confira todas as opções disponíveis</p>
          </div>

          {services.length > 0 ? (
            <>
              <div className="landing-services-grid">
                {services.map((service) => (
                  <div key={service.id} className="landing-service-card">
                    <div className="landing-service-header">
                      <h3 className="landing-service-title">{service.name}</h3>
                      {service.category && (
                        <span className="landing-service-category">
                          {service.category.name}
                        </span>
                      )}
                    </div>
                    {service.description && (
                      <p className="landing-service-description">{service.description}</p>
                    )}
                    <div className="landing-service-footer">
                      <p className="landing-service-price">
                        R$ {service.price.toFixed(2)}
                      </p>
                      <span className="landing-service-duration">{service.duration}min</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="landing-services-cta">
                <p className="landing-services-cta-text">
                  Interessado em algum serviço? Clique abaixo para agendar!
                </p>
                <Link href={`/agendar/${tenantSlug}`} className="landing-btn-primary">
                  Agendar Serviço →
                </Link>
              </div>
            </>
          ) : (
            <div className="landing-services-empty">
              <p className="landing-services-empty-text">Nenhum serviço disponível no momento</p>
            </div>
          )}
        </div>
      </section>

      {/* Business Hours Section */}
      <section className="landing-section">
        <div className="landing-container">
          <h2 className="landing-section-title">Horário de Funcionamento</h2>
          <p className="landing-section-subtitle">Confira nossos horários</p>

          <div className="landing-hours-grid">
            {tenant.businessHours ? (
              <>
                <div className="landing-hour-item">
                  <h4>Segunda-Feira</h4>
                  <p>{tenant.businessHours.monday || '09:00 - 18:00'}</p>
                </div>
                <div className="landing-hour-item">
                  <h4>Terça-Feira</h4>
                  <p>{tenant.businessHours.tuesday || '09:00 - 18:00'}</p>
                </div>
                <div className="landing-hour-item">
                  <h4>Quarta-Feira</h4>
                  <p>{tenant.businessHours.wednesday || '09:00 - 18:00'}</p>
                </div>
                <div className="landing-hour-item">
                  <h4>Quinta-Feira</h4>
                  <p>{tenant.businessHours.thursday || '09:00 - 18:00'}</p>
                </div>
                <div className="landing-hour-item">
                  <h4>Sexta-Feira</h4>
                  <p>{tenant.businessHours.friday || '09:00 - 18:00'}</p>
                </div>
                <div className="landing-hour-item">
                  <h4>Sábado</h4>
                  <p>{tenant.businessHours.saturday || '09:00 - 13:00'}</p>
                </div>
                <div className="landing-hour-item">
                  <h4>Domingo</h4>
                  <p>{tenant.businessHours.sunday || 'Fechado'}</p>
                </div>
              </>
            ) : (
              <div className="landing-hours-default">
                <p>Segunda a Sexta: 09:00 - 18:00</p>
                <p>Sábado: 09:00 - 13:00</p>
                <p>Domingo: Fechado</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="landing-section landing-section-alt">
        <div className="landing-container">
          <h2 className="landing-section-title">Comodidades</h2>
          <p className="landing-section-subtitle">O que oferecemos para sua confortabilidade</p>

          {tenant.amenities && tenant.amenities.length > 0 ? (
            <div className="landing-amenities-grid">
              {tenant.amenities.map((amenity, index) => (
                <div key={index} className="landing-amenity-item">
                  <div className="landing-amenity-icon">✓</div>
                  <p>{amenity}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="landing-amenities-grid">
              <div className="landing-amenity-item">
                <div className="landing-amenity-icon">✓</div>
                <p>WiFi Gratuito</p>
              </div>
              <div className="landing-amenity-item">
                <div className="landing-amenity-icon">✓</div>
                <p>Ambiente Climatizado</p>
              </div>
              <div className="landing-amenity-item">
                <div className="landing-amenity-icon">✓</div>
                <p>Estacionamento</p>
              </div>
              <div className="landing-amenity-item">
                <div className="landing-amenity-icon">✓</div>
                <p>Bebidas Quentes</p>
              </div>
              <div className="landing-amenity-item">
                <div className="landing-amenity-icon">✓</div>
                <p>Área de Espera Confortável</p>
              </div>
              <div className="landing-amenity-item">
                <div className="landing-amenity-icon">✓</div>
                <p>Profissionais Certificados</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="landing-section">
        <div className="landing-container">
          <h2 className="landing-section-title">Formas de Pagamento</h2>
          <p className="landing-section-subtitle">Múltiplas opções de pagamento para sua conveniência</p>

          {tenant.paymentMethods && tenant.paymentMethods.length > 0 ? (
            <div className="landing-payment-grid">
              {tenant.paymentMethods.map((method, index) => (
                <div key={index} className="landing-payment-item">
                  <p>{method}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="landing-payment-grid">
              <div className="landing-payment-item">
                <p>💳 Cartão de Crédito</p>
              </div>
              <div className="landing-payment-item">
                <p>💳 Cartão de Débito</p>
              </div>
              <div className="landing-payment-item">
                <p>💰 Dinheiro</p>
              </div>
              <div className="landing-payment-item">
                <p>📱 PIX</p>
              </div>
            </div>
          )}
        </div>
      </section>
      <section className="landing-section landing-section-alt">
        <div className="landing-container">
          <div>
            <h2 className="landing-section-title">Entre em Contato</h2>
            <p className="landing-section-subtitle">Estamos aqui para ajudar</p>
          </div>

          <div className="landing-contact-main-grid">
            <div className="landing-contact-info">
              <div className="landing-grid">
                <div className="landing-contact-card">
                  <div className="landing-contact-icon">📍</div>
                  <h3 className="landing-contact-title">Localização</h3>
                  <p className="landing-contact-text">
                    {tenant.address && <>{tenant.address}<br /></>}
                    {tenant.city && tenant.state && <>{tenant.city}, {tenant.state}<br /></>}
                    {tenant.zipCode && <span>CEP {tenant.zipCode}</span>}
                  </p>
                </div>

                <div className="landing-contact-card">
                  <div className="landing-contact-icon">📞</div>
                  <h3 className="landing-contact-title">WhatsApp</h3>
                  <p className="landing-contact-text">
                    {tenant.whatsapp ? (
                      <a
                        href={`https://wa.me/${tenant.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="landing-contact-link"
                      >
                        {tenant.whatsapp}
                      </a>
                    ) : (
                      <span>Não informado</span>
                    )}
                  </p>
                </div>

                <div className="landing-contact-card">
                  <div className="landing-contact-icon">📧</div>
                  <h3 className="landing-contact-title">Email</h3>
                  <p className="landing-contact-text">
                    {tenant.email ? (
                      <a href={`mailto:${tenant.email}`} className="landing-contact-link">
                        {tenant.email}
                      </a>
                    ) : (
                      <span>Não informado</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Social Media */}
              {tenant.socialMedia && (
                <div className="landing-social-section">
                  <h3 className="landing-contact-title">Redes Sociais</h3>
                  <div className="landing-social-links">
                    {tenant.socialMedia.instagram && (
                      <a
                        href={`https://instagram.com/${tenant.socialMedia.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="landing-social-link"
                        title="Instagram"
                      >
                        📷 Instagram
                      </a>
                    )}
                    {tenant.socialMedia.facebook && (
                      <a
                        href={`https://facebook.com/${tenant.socialMedia.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="landing-social-link"
                        title="Facebook"
                      >
                        👍 Facebook
                      </a>
                    )}
                    {tenant.socialMedia.twitter && (
                      <a
                        href={`https://twitter.com/${tenant.socialMedia.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="landing-social-link"
                        title="Twitter"
                      >
                        𝕏 Twitter
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Google Maps */}
            {tenant.latitude && tenant.longitude && (
              <div className="landing-map-container">
                <iframe
                  width="100%"
                  height="400"
                  style={{ border: 0, borderRadius: '12px' }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyDummyKeyForNow&q=${encodeURIComponent(tenant.address || `${tenant.city}, ${tenant.state}`)}`}
                ></iframe>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-section landing-cta">
        <div className="landing-container">
          <div className="landing-cta-content">
            <h2 className="landing-cta-title">Pronto para seu novo visual? ✨</h2>
            <p className="landing-cta-description">
              Agora é fácil! Agende seu horário em poucos cliques e aproveite a melhor experiência
            </p>
            <Link href={`/agendar/${tenantSlug}`} className="landing-btn-primary">
              📅 Agendar Agora
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-grid">
            <div>
              <h3 className="landing-footer-brand">{tenant.name}</h3>
              <p className="landing-footer-description">
                {tenant.description || 'Seu agendamento de forma rápida, fácil e segura.'}
              </p>
            </div>
            <div className="landing-footer-links">
              <h4 className="landing-footer-links-title">Links Rápidos</h4>
              <Link href={`/agendar/${tenantSlug}`} className="landing-footer-link">
                Agendar
              </Link>
              <a href="#services" className="landing-footer-link">
                Serviços
              </a>
            </div>
          </div>
          <div className="landing-footer-bottom">
            <p>© 2025 {tenant.name}. Todos os direitos reservados.</p>
            <p>Desenvolvido com ❤️ para sua melhor experiência</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
