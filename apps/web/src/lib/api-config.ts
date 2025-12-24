/**
 * Retorna a URL base da API baseado no ambiente
 * - Desenvolvimento: usa a mesma origem do navegador na porta 3001
 * - Produção: usa NEXT_PUBLIC_API_URL (definida em .env)
 */
export function getApiUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }
  
  // Client-side - usa o hostname atual para funcionar em qualquer IP
  const hostname = window.location.hostname;
  return process.env.NEXT_PUBLIC_API_URL || `http://${hostname}:3001`;
}
