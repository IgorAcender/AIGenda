/**
 * Retorna a URL base da API baseado no ambiente
 * - Desenvolvimento: http://localhost:3001
 * - Produção: usa NEXT_PUBLIC_API_URL (definida em .env)
 */
export function getApiUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }
  
  // Client-side
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}
