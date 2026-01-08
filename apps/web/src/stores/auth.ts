import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/api'

// Tipos
export type UserRole = 'MASTER' | 'OWNER' | 'PROFESSIONAL'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  phone?: string
}

export interface Tenant {
  id: string
  name: string
  slug: string
  logo?: string
}

export interface Professional {
  id: string
  name: string
  specialty?: string
  color?: string
}

interface AuthState {
  user: User | null
  tenant: Tenant | null
  professional: Professional | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  clearError: () => void
  
  // Helpers
  isMaster: () => boolean
  isOwner: () => boolean
  isProfessional: () => boolean
  canAccess: (requiredRole: UserRole | UserRole[]) => boolean
}

interface RegisterData {
  name: string
  email: string
  password: string
  tenantName: string
  phone?: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tenant: null,
      professional: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/login', { email, password })
          const { user, tenant, professional, token } = response.data
          
          // Salvar dados no localStorage
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))
          if (tenant) {
            localStorage.setItem('tenant', JSON.stringify(tenant))
          }
          
          set({
            user,
            tenant: tenant || null,
            professional: professional || null,
            token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error: any) {
          const message = error.response?.data?.error || 'Erro ao fazer login'
          set({ error: message, isLoading: false })
          throw new Error(message)
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/register', data)
          const { user, tenant, token } = response.data
          
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))
          if (tenant) {
            localStorage.setItem('tenant', JSON.stringify(tenant))
          }
          
          set({
            user,
            tenant,
            professional: null,
            token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error: any) {
          const message = error.response?.data?.error || 'Erro ao criar conta'
          set({ error: message, isLoading: false })
          throw new Error(message)
        }
      },

      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('tenant')
        set({
          user: null,
          tenant: null,
          professional: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
        // Redirecionar para login
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token')
        if (!token) {
          set({ isAuthenticated: false, isLoading: false })
          return
        }

        set({ isLoading: true })
        try {
          // Adicionar timeout de 5 segundos
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000)
          
          const response = await api.get('/auth/me', { signal: controller.signal as any })
          clearTimeout(timeoutId)
          
          const { user, tenant, professional } = response.data
          
          set({
            user,
            tenant: tenant || null,
            professional: professional || null,
            token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error: any) {
          console.error('Auth check error:', error.message)
          // Se erro de timeout ou conexão, não remover token, apenas deslogar visualmente
          if (error.message?.includes('timeout') || error.message?.includes('Network')) {
            set({
              user: null,
              tenant: null,
              professional: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Erro de conexão. Tente novamente.',
            })
          } else {
            // Erro real (401, 403, etc) - remove token
            localStorage.removeItem('token')
            set({
              user: null,
              tenant: null,
              professional: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            })
          }
        }
      },

      clearError: () => set({ error: null }),

      // Helpers para verificar role
      isMaster: () => get().user?.role === 'MASTER',
      isOwner: () => get().user?.role === 'OWNER',
      isProfessional: () => get().user?.role === 'PROFESSIONAL',
      
      canAccess: (requiredRole: UserRole | UserRole[]) => {
        const userRole = get().user?.role
        if (!userRole) return false
        
        // MASTER pode tudo
        if (userRole === 'MASTER') return true
        
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
        return roles.includes(userRole)
      },
    }),
    {
      name: 'agende-ai-auth',
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        professional: state.professional,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Hook para usar fora de componentes React
export const getAuthState = () => useAuthStore.getState()
