import axios from 'axios';

// Resolve API baseURL safely for both local dev and deployed (HTTPS) environments.
// Avoid using an http://localhost URL from a production HTTPS page (mixed content blocked).
const rawApi = process.env.NEXT_PUBLIC_API_URL || '';
let API_URL: string;
// In the browser we always prefer the relative `/api` to guarantee same-origin
// requests and avoid mixed-content (HTTPS page calling http://localhost).
if (typeof window !== 'undefined') {
  API_URL = '/api';
} else if (!rawApi) {
  API_URL = '/api';
} else {
  // If the configured URL points to localhost but the app is running on a non-localhost host
  // (e.g., production on Easy Panel with HTTPS), prefer the relative /api to avoid mixed-content.
  try {
    const parsed = new URL(rawApi);
    const isLocalhost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    // On server-side build we can't compare window origin, so prefer configured rawApi
    API_URL = rawApi ? `${rawApi.replace(/\/+$/g, '')}/api` : '/api';
  } catch (e) {
    API_URL = rawApi.startsWith('/') ? rawApi : '/api';
  }
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
  // Runtime safety: if the configured baseURL points to localhost but the page
  // is running on a different host (production HTTPS), rewrite to relative
  // `/api` to avoid mixed-content blocking in the browser.
  try {
    if (typeof window !== 'undefined' && config.baseURL) {
      const base = String(config.baseURL);
      const isLocalhost = base.includes('localhost') || base.includes('127.0.0.1');
      const pageIsLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalhost && !pageIsLocal) {
        // rewrite baseURL to relative API path
        config.baseURL = '/api';
      }
    }
  } catch (e) {
    // noop
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
