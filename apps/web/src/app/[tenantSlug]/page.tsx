import { redirect } from 'next/navigation';
import LandingPageContent from '@/components/marketing/LandingPageContent';
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
      about?: string;
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
      landingBlocks?: Array<{
        id: string;
        name: string;
        label: string;
        enabled: boolean;
        order: number;
      }>;
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
      // Cores do tema
      themeTemplate?: string;
      backgroundColor?: string;
      textColor?: string;
      buttonColorPrimary?: string;
      buttonTextColor?: string;
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

export default async function LandingPage({ params }: LandingPageProps) {
  const { tenantSlug } = await params;

  let landingData: TenantData | null = null;
  try {
    // Para SSR dentro do Docker, usamos API_URL_INTERNAL (container-to-container)
    // Para client-side ou desenvolvimento local, usamos NEXT_PUBLIC_API_URL
    const apiUrl = process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    console.log(`[LandingPage] Buscando dados de: ${apiUrl}/${tenantSlug}`);
    
    const response = await fetch(`${apiUrl}/${tenantSlug}`, {
      next: { revalidate: 0 }, // Sempre revalidar (sem cache)
    });

    if (response.ok) {
      landingData = await response.json();
      console.log(`[LandingPage] Dados recebidos para: ${tenantSlug}`);
    } else {
      console.log(`[LandingPage] Resposta não ok: ${response.status}`);
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
    <LandingPageContent
      tenant={tenant}
      services={services}
      professionals={professionals}
      tenantSlug={tenantSlug}
      // Blocos já vêm no tenant; LandingPageContent usa como fonte principal
    />
  );
}
