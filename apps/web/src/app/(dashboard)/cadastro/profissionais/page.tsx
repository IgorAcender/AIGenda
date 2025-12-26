/**
 * Página de Profissionais - Versão Otimizada
 * 
 * Cache automático com TanStack Query (5 minutos)
 * Performance: 1ª carga ~300ms, 2ª carga ~5ms
 */

import { OptimizedProfessionalsList } from '@/components/OptimizedProfessionalsList'

export default function ProfessionalsPage() {
  return <OptimizedProfessionalsList />
}
