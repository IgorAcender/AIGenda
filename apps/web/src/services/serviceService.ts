import api from '@/lib/api'

export interface Service {
  id: string
  name: string
  description?: string | null
  price: number
  duration: number
  category?: string | null
  categoryId?: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateServiceData {
  name: string
  description?: string
  price: number
  duration: number
  category?: string
  categoryId?: string
}

export interface UpdateServiceData extends Partial<CreateServiceData> {}

export interface ServiceFilters {
  search?: string
  category?: string
  active?: boolean
}

class ServiceService {
  async getServices(filters?: ServiceFilters) {
    const params = new URLSearchParams()
    
    if (filters?.search) params.append('search', filters.search)
    if (filters?.category) params.append('category', filters.category)
    if (filters?.active !== undefined) params.append('active', filters.active.toString())

    const response = await api.get(`/services?${params.toString()}`)
    return response.data
  }

  async getServiceById(id: string): Promise<Service> {
    const response = await api.get(`/services/${id}`)
    return response.data
  }

  async createService(data: CreateServiceData): Promise<Service> {
    const response = await api.post('/services', data)
    return response.data
  }

  async updateService(id: string, data: UpdateServiceData): Promise<Service> {
    const response = await api.put(`/services/${id}`, data)
    return response.data
  }

  async deleteService(id: string): Promise<void> {
    await api.delete(`/services/${id}`)
  }
}

export const serviceService = new ServiceService()
