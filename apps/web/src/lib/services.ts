import apiClient from './api';
import type { Client, Professional, Service, Appointment, Transaction } from '@aigenda/shared';

export const clientService = {
  async list(page = 1, pageSize = 10, search = '') {
    const response = await apiClient.get('/api/clients', {
      params: { page, pageSize, search },
    });
    return response.data;
  },

  async create(data: Partial<Client>) {
    const response = await apiClient.post('/api/clients', data);
    return response.data.data;
  },

  async get(id: string) {
    const response = await apiClient.get(`/api/clients/${id}`);
    return response.data.data;
  },

  async update(id: string, data: Partial<Client>) {
    const response = await apiClient.put(`/api/clients/${id}`, data);
    return response.data.data;
  },

  async delete(id: string) {
    await apiClient.delete(`/api/clients/${id}`);
  },
};

export const professionalService = {
  async list(page = 1, pageSize = 10) {
    const response = await apiClient.get('/api/professionals', {
      params: { page, pageSize },
    });
    return response.data;
  },

  async create(data: Partial<Professional>) {
    const response = await apiClient.post('/api/professionals', data);
    return response.data.data;
  },
};

export const serviceService = {
  async list(page = 1, pageSize = 10) {
    const response = await apiClient.get('/api/services', {
      params: { page, pageSize },
    });
    return response.data;
  },

  async create(data: Partial<Service>) {
    const response = await apiClient.post('/api/services', data);
    return response.data.data;
  },
};

export const appointmentService = {
  async list(page = 1, pageSize = 20, startDate?: Date, endDate?: Date, status?: string) {
    const response = await apiClient.get('/api/appointments', {
      params: { page, pageSize, startDate, endDate, status },
    });
    return response.data;
  },

  async create(data: any) {
    const response = await apiClient.post('/api/appointments', data);
    return response.data.data;
  },

  async updateStatus(id: string, status: string) {
    const response = await apiClient.patch(`/api/appointments/${id}/status`, { status });
    return response.data.data;
  },

  async cancel(id: string, reason?: string) {
    const response = await apiClient.post(`/api/appointments/${id}/cancel`, { reason });
    return response.data;
  },
};

export const transactionService = {
  async list(page = 1, pageSize = 20, filters?: any) {
    const response = await apiClient.get('/api/transactions', {
      params: { page, pageSize, ...filters },
    });
    return response.data;
  },

  async create(data: Partial<Transaction>) {
    const response = await apiClient.post('/api/transactions', data);
    return response.data.data;
  },

  async getDashboardSummary(startDate?: Date, endDate?: Date) {
    const response = await apiClient.get('/api/transactions/dashboard/summary', {
      params: { startDate, endDate },
    });
    return response.data.data;
  },
};
