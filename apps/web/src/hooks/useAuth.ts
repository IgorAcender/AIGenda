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

// Hook simples que lê do localStorage (sem mocks)
export function useAuth(): AuthContextType & { isAuthenticated: boolean } {
  const router = useRouter()

  // Lê do localStorage - SEM FALLBACK PARA MOCK
  let user: User | null = null
  let tenant: Tenant | null = null
  
  if (typeof window !== 'undefined') {
    user = JSON.parse(localStorage.getItem('user') || 'null')
    tenant = JSON.parse(localStorage.getItem('tenant') || 'null')
  }

  const login = useCallback(async (email: string, password: string) => {
    // Implementar chamada de login real
    console.log('Login:', email)
  }, [router])

  const logout = useCallback(async () => {
    localStorage.removeItem('user')
    localStorage.removeItem('tenant')
    localStorage.removeItem('token')
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
