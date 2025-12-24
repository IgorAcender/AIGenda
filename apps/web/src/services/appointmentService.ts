import api from '@/lib/api'

export interface Appointment {
  id: string
  title: string
  description?: string | null
  startTime: string
  endTime: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED' | 'NO_SHOW'
  notes?: string | null
  clientId: string
  professionalId: string
  serviceId: string
  canceledAt?: string | null
  cancelReason?: string | null
  createdAt: string
  updatedAt: string
  client?: {
    id: string
    name: string
    phone: string
  }
  professional?: {
    id: string
    name: string
    avatar?: string | null
  }
  service?: {
    id: string
    name: string
    price: number
    duration: number
  }
  transaction?: any
}

export interface CreateAppointmentData {
  title: string
  description?: string
  startTime: string
  endTime: string
  clientId: string
  professionalId: string
  serviceId: string
  notes?: string
}

export interface UpdateAppointmentData extends Partial<CreateAppointmentData> {}

export interface AppointmentFilters {
  startDate?: string
  endDate?: string
  professionalId?: string
  clientId?: string
  status?: string
}

class AppointmentService {
  async getAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {
    const params = new URLSearchParams()
    
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.professionalId) params.append('professionalId', filters.professionalId)
    if (filters?.clientId) params.append('clientId', filters.clientId)
    if (filters?.status) params.append('status', filters.status)

    const response = await api.get(`/appointments?${params.toString()}`)
    return response.data.data
  }

  async getAppointmentById(id: string): Promise<Appointment> {
    const response = await api.get(`/appointments/${id}`)
    return response.data
  }

  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    const response = await api.post('/appointments', data)
    return response.data
  }

  async updateAppointment(id: string, data: UpdateAppointmentData): Promise<Appointment> {
    const response = await api.put(`/appointments/${id}`, data)
    return response.data
  }

  async updateStatus(
    id: string,
    status: Appointment['status'],
    cancelReason?: string
  ): Promise<Appointment> {
    const response = await api.patch(`/appointments/${id}/status`, {
      status,
      cancelReason,
    })
    return response.data
  }

  async confirmAppointment(id: string): Promise<Appointment> {
    const response = await api.patch(`/appointments/${id}/confirm`)
    return response.data
  }

  async completeAppointment(id: string, paymentMethod: string): Promise<Appointment> {
    const response = await api.patch(`/appointments/${id}/complete`, {
      paymentMethod,
    })
    return response.data
  }

  async deleteAppointment(id: string): Promise<void> {
    await api.delete(`/appointments/${id}`)
  }
}

export const appointmentService = new AppointmentService()
