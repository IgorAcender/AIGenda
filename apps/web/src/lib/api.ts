import axios from 'axios';

// If NEXT_PUBLIC_API_URL is set use it and append /api, otherwise use relative /api
const rawApi = process.env.NEXT_PUBLIC_API_URL || '';
const API_URL = rawApi ? `${rawApi.replace(/\/+$/g, '')}/api` : '/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpar token e redirecionar para login
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      typeof window !== 'undefined' && (window.location.href = '/login');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
