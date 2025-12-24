import api from '@/lib/api'

export interface Client {
  id: string
  name: string
  email?: string | null
  phone: string
  address?: string | null
  city?: string | null
  cpf?: string | null
  birthDate?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateClientData {
  name: string
  email?: string
  phone: string
  address?: string
  city?: string
  cpf?: string
  birthDate?: string
  notes?: string
}

export interface UpdateClientData extends Partial<CreateClientData> {}

export interface ClientFilters {
  search?: string
  page?: number
  limit?: number
}

class ClientService {
  async getClients(filters?: ClientFilters) {
    const params = new URLSearchParams()
    
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const response = await api.get(`/clients?${params.toString()}`)
    return response.data
  }

  async getClientById(id: string): Promise<Client> {
    const response = await api.get(`/clients/${id}`)
    return response.data
  }

  async createClient(data: CreateClientData): Promise<Client> {
    const response = await api.post('/clients', data)
    return response.data
  }

  async updateClient(id: string, data: UpdateClientData): Promise<Client> {
    const response = await api.put(`/clients/${id}`, data)
    return response.data
  }

  async deleteClient(id: string): Promise<void> {
    await api.delete(`/clients/${id}`)
  }
}

export const clientService = new ClientService()
