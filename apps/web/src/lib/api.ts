import axios from 'axios';

// Resolve API baseURL safely for both local dev and deployed (HTTPS) environments.
// Avoid using an http://localhost URL from a production HTTPS page (mixed content blocked).
const rawApi = process.env.NEXT_PUBLIC_API_URL || '';
let API_URL: string;
if (!rawApi) {
  API_URL = '/api';
} else if (typeof window !== 'undefined') {
  // If the configured URL points to localhost but the app is running on a non-localhost host
  // (e.g., production on Easy Panel with HTTPS), prefer the relative /api to avoid mixed-content.
  try {
    const parsed = new URL(rawApi);
    const isLocalhost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    const isSameOrigin = window.location.origin === parsed.origin;
    if (isLocalhost && !isSameOrigin) {
      API_URL = '/api';
    } else {
      API_URL = `${rawApi.replace(/\/+$/g, '')}/api`;
    }
  } catch (e) {
    // If rawApi is not a full URL, fallback to using it as-is or relative /api
    API_URL = rawApi.startsWith('/') ? rawApi : '/api';
  }
} else {
  // Server-side (build) - keep the configured rawApi so static pages reference correct host if provided
  API_URL = rawApi ? `${rawApi.replace(/\/+$/g, '')}/api` : '/api';
}

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
