import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

export interface User {
  id: string
  email: string
  name: string
  role: 'MASTER' | 'OWNER' | 'PROFESSIONAL'
  avatar?: string
  tenantId?: string
}

export interface Tenant {
  id: string
  name: string
  slug: string
  logo?: string
  banner?: string
  email: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  tenant: Tenant | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

// Hook simples que lê do localStorage
export function useAuth(): AuthContextType & { isAuthenticated: boolean } {
  const router = useRouter()

  // Lê do localStorage/sessionStorage (simular) com fallback para mock
  let user: User | null = null
  let tenant: Tenant | null = null
  
  if (typeof window !== 'undefined') {
    user = JSON.parse(sessionStorage.getItem('user') || 'null')
    tenant = JSON.parse(sessionStorage.getItem('tenant') || 'null')
    
    // Se não houver tenant, usar um padrão para testes (FIXO para não mudar a cada render)
    if (!tenant) {
      tenant = {
        id: 'test-tenant-demo-001',
        name: 'Meu Negócio',
        slug: 'meu-negocio',
        email: 'teste@email.com',
        phone: '11999999999',
      }
    }
    
    // Se não houver user, usar um padrão para testes (FIXO)
    if (!user) {
      user = {
        id: 'test-user-demo-001',
        email: 'teste@email.com',
        name: 'Usuário Teste',
        role: 'OWNER',
        tenantId: tenant.id,
      }
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    // Implementar chamada de login real
    console.log('Login:', email)
  }, [router])

  const logout = useCallback(async () => {
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('tenant')
    router.push('/login')
  }, [router])

  return {
    user,
    tenant,
    isLoading: false,
    isAuthenticated: !!user,
    login,
    logout,
  }
}
