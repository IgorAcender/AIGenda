import axios, { AxiosInstance, AxiosError } from 'axios'

// Função para obter a URL da API de forma segura
function getApiBaseUrl(): string {
  // Se NEXT_PUBLIC_API_URL está definido, usa ele
  if (process.env.NEXT_PUBLIC_API_URL) {
    return `${process.env.NEXT_PUBLIC_API_URL}/api`
  }

  // Client-side: detectar protocolo automaticamente
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'https' : 'http'
    const hostname = window.location.hostname
    return `${protocol}://${hostname}:3001/api`
  }

  // Server-side fallback
  return 'http://localhost:3001/api'
}

const API_BASE_URL = getApiBaseUrl()

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  register: async (data: {
    name: string
    email: string
    password: string
    tenantName: string
    tenantSlug: string
  }) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      // ✅ Adicionar tenant ao localStorage
      if (response.data.tenant) {
        localStorage.setItem('tenant', JSON.stringify(response.data.tenant))
      }
    }
    return response.data
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // ✅ Remover tenant também
      localStorage.removeItem('tenant')
    }
  },

  me: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

// Clients API
export const clientsApi = {
  list: async (params?: { search?: string; page?: number; limit?: number }) => {
    const response = await api.get('/clients', { params })
    return response.data
  },

  get: async (id: string) => {
    const response = await api.get(`/clients/${id}`)
    return response.data
  },

  create: async (data: {
    name: string
    email?: string
    phone: string
    cpf?: string
    address?: string
    city?: string
    birthDate?: string
    notes?: string
  }) => {
    const response = await api.post('/clients', data)
    return response.data
  },

  update: async (id: string, data: Partial<{
    name: string
    email: string | null
    phone: string
    cpf: string | null
    address: string | null
    city: string | null
    birthDate: string | null
    notes: string | null
    active: boolean
  }>) => {
    const response = await api.put(`/clients/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/clients/${id}`)
    return response.data
  },
}

// Professionals API
export const professionalsApi = {
  list: async (params?: { search?: string; page?: number; limit?: number }) => {
    const response = await api.get('/professionals', { params })
    return response.data
  },

  get: async (id: string) => {
    const response = await api.get(`/professionals/${id}`)
    return response.data
  },

  create: async (data: {
    name: string
    email?: string
    phone: string
    commission?: number
    workDays?: number[]
    workStart?: string
    workEnd?: string
    color?: string
  }) => {
    const response = await api.post('/professionals', data)
    return response.data
  },

  update: async (id: string, data: Partial<{
    name: string
    email: string | null
    phone: string
    commission: number
    workDays: number[]
    workStart: string
    workEnd: string
    color: string
    active: boolean
  }>) => {
    const response = await api.put(`/professionals/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/professionals/${id}`)
    return response.data
  },
}

// Categories API
export const categoriesApi = {
  list: async () => {
    const response = await api.get('/categories')
    return response.data
  },

  get: async (id: string) => {
    const response = await api.get(`/categories/${id}`)
    return response.data
  },

  create: async (data: { name: string; description?: string; color?: string }) => {
    const response = await api.post('/categories', data)
    return response.data
  },

  update: async (id: string, data: Partial<{ name: string; description: string | null; color: string }>) => {
    const response = await api.put(`/categories/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/categories/${id}`)
    return response.data
  },
}

// Services API
export const servicesApi = {
  list: async (params?: { categoryId?: string; page?: number; limit?: number }) => {
    const response = await api.get('/services', { params })
    return response.data
  },

  get: async (id: string) => {
    const response = await api.get(`/services/${id}`)
    return response.data
  },

  create: async (data: {
    name: string
    description?: string
    duration: number
    price: number
    categoryId?: string
  }) => {
    const response = await api.post('/services', data)
    return response.data
  },

  update: async (id: string, data: Partial<{
    name: string
    description: string | null
    duration: number
    price: number
    categoryId: string | null
    active: boolean
  }>) => {
    const response = await api.put(`/services/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/services/${id}`)
    return response.data
  },
}

// Appointments API
export const appointmentsApi = {
  list: async (params?: {
    date?: string
    startDate?: string
    endDate?: string
    professionalId?: string
    clientId?: string
    status?: string
    page?: number
    limit?: number
  }) => {
    const response = await api.get('/appointments', { params })
    return response.data
  },

  get: async (id: string) => {
    const response = await api.get(`/appointments/${id}`)
    return response.data
  },

  create: async (data: {
    clientId: string
    professionalId: string
    serviceId: string
    date: string
    startTime: string
    endTime: string
    price: number
    notes?: string
  }) => {
    const response = await api.post('/appointments', data)
    return response.data
  },

  update: async (id: string, data: Partial<{
    clientId: string
    professionalId: string
    serviceId: string
    date: string
    startTime: string
    endTime: string
    price: number
    notes: string | null
    status: string
  }>) => {
    const response = await api.put(`/appointments/${id}`, data)
    return response.data
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/appointments/${id}/status`, { status })
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/appointments/${id}`)
    return response.data
  },
}

// Transactions API
export const transactionsApi = {
  list: async (params?: {
    type?: 'income' | 'expense'
    startDate?: string
    endDate?: string
    status?: string
    page?: number
    limit?: number
  }) => {
    const response = await api.get('/transactions', { params })
    return response.data
  },

  totals: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get('/transactions/totals', { params })
    return response.data
  },

  create: async (data: {
    description: string
    type: 'income' | 'expense'
    category: string
    amount: number
    date: string
    paymentMethod: string
    status?: string
    notes?: string
  }) => {
    const response = await api.post('/transactions', data)
    return response.data
  },

  update: async (id: string, data: Partial<{
    description: string
    type: 'income' | 'expense'
    category: string
    amount: number
    date: string
    paymentMethod: string
    status: string
    notes: string | null
  }>) => {
    const response = await api.put(`/transactions/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/transactions/${id}`)
    return response.data
  },
}

// Dashboard API
export const dashboardApi = {
  stats: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get('/dashboard/stats', { params })
    return response.data
  },

  topServices: async (params?: { startDate?: string; endDate?: string; limit?: number }) => {
    const response = await api.get('/dashboard/top-services', { params })
    return response.data
  },

  topProfessionals: async (params?: { startDate?: string; endDate?: string; limit?: number }) => {
    const response = await api.get('/dashboard/top-professionals', { params })
    return response.data
  },
}

// Tenant API
export const tenantApi = {
  getConfig: async () => {
    const response = await api.get('/tenants/config')
    return response.data
  },

  updateConfig: async (data: Partial<{
    name: string
    phone: string
    email: string
    address: string
    city: string
    workDays: number[]
    workStart: string
    workEnd: string
    slotDuration: number
    currency: string
    timezone: string
    logo: string
  }>) => {
    const response = await api.put('/tenants/config', data)
    return response.data
  },
}

export default api
