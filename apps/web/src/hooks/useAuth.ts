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

  // Lê do localStorage/sessionStorage (simular)
  const user = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('user') || 'null') : null
  const tenant = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('tenant') || 'null') : null

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
