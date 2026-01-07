import WhatsAppMarketingPage from '@/components/marketing/WhatsAppMarketingPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WhatsApp - Marketing',
  description: 'Conecte e gerencie seu WhatsApp para automação de agendamentos',
}

export default function WhatsAppPage() {
  return <WhatsAppMarketingPage />
}
