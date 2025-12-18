import axios from 'axios';

function resolveApiBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL || '').trim();

  // Default to same-origin API path in production/static export
  if (!raw) return '/api';

  // When configured, expect a host like http://localhost:3001 and normalize to .../api
  try {
    const normalized = raw.replace(/\/+$/g, '');
    const parsed = new URL(normalized);
    const isLocalhost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';

    if (typeof window !== 'undefined') {
      const pageHost = window.location.hostname;
      const pageIsLocal = pageHost === 'localhost' || pageHost === '127.0.0.1';
      if (isLocalhost && !pageIsLocal) return '/api';
    }

    return `${normalized}/api`;
  } catch {
    // If not a valid URL, treat relative values as the API base (fallback to /api)
    return raw.startsWith('/') ? raw : '/api';
  }
}

const API_URL = resolveApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_URL,
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
