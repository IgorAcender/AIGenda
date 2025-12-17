import apiClient from './api';

interface LoginResponse {
  success: boolean;
  data: {
    user: any;
    token: string;
    refreshToken: string;
  };
}

interface RegisterResponse {
  success: boolean;
  data: {
    user: any;
    tenant: any;
    token: string;
    refreshToken: string;
  };
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    });
    
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },

  async register(
    email: string,
    password: string,
    name: string,
    tenantName: string,
    tenantSlug: string
  ): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/api/auth/register', {
      email,
      password,
      name,
      tenantName,
      tenantSlug,
    });
    
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  async getCurrentUser() {
    const response = await apiClient.get('/api/auth/me');
    return response.data.data;
  },

  getStoredToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  },

  getStoredUser(): any {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};
