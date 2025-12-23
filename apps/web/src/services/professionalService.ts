import api from '@/lib/api'

export interface Professional {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  specialty?: string | null
  avatar?: string | null
  color?: string | null
  commissionRate: number
  workingHours?: any
  workingDays: number[]
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateProfessionalData {
  name: string
  phone?: string
  email?: string
  specialty?: string
  avatar?: string
  color?: string
  commissionRate?: number
  workingHours?: any
  workingDays?: number[]
  active?: boolean
}

export interface UpdateProfessionalData extends Partial<CreateProfessionalData> {}

export interface ProfessionalFilters {
  search?: string
  active?: boolean
}

class ProfessionalService {
  async getProfessionals(filters?: ProfessionalFilters) {
    const params = new URLSearchParams()
    
    if (filters?.search) params.append('search', filters.search)
    if (filters?.active !== undefined) params.append('active', filters.active.toString())

    const response = await api.get(`/professionals?${params.toString()}`)
    return response.data
  }

  async getProfessionalById(id: string): Promise<Professional> {
    const response = await api.get(`/professionals/${id}`)
    return response.data
  }

  async createProfessional(data: CreateProfessionalData): Promise<Professional> {
    const response = await api.post('/professionals', data)
    return response.data
  }

  async updateProfessional(id: string, data: UpdateProfessionalData): Promise<Professional> {
    const response = await api.put(`/professionals/${id}`, data)
    return response.data
  }

  async deleteProfessional(id: string): Promise<void> {
    await api.delete(`/professionals/${id}`)
  }
}

export const professionalService = new ProfessionalService()
