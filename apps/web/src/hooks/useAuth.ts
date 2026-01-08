import { useCallback, useEffect, useState } from 'react'
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

// Hook que sincroniza com localStorage
export function useAuth(): AuthContextType & { isAuthenticated: boolean } {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Carregar dados do localStorage uma única vez (no mount)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      const storedTenant = localStorage.getItem('tenant')

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (e) {
          console.error('Erro ao parsear user:', e)
        }
      }

      if (storedTenant) {
        try {
          setTenant(JSON.parse(storedTenant))
        } catch (e) {
          console.error('Erro ao parsear tenant:', e)
        }
      }

      setIsHydrated(true)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    // Implementar chamada de login real
    console.log('Login:', email)
  }, [router])

  const logout = useCallback(async () => {
    localStorage.removeItem('user')
    localStorage.removeItem('tenant')
    localStorage.removeItem('token')
    setUser(null)
    setTenant(null)
    router.push('/login')
  }, [router])

  return {
    user,
    tenant,
    isLoading: !isHydrated,
    isAuthenticated: !!user,
    login,
    logout,
  }
}
