import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

/**
 * Hook otimizado para requisições GET com cache automático
 * Cache por 5 minutos por padrão
 */
export function useApiQuery(
  queryKey: string[],
  url: string,
  options?: {
    staleTime?: number // Tempo até dados ficarem "stale" (padrão: 5min)
    gcTime?: number // Tempo antes de descartar dados em cache (padrão: 10min)
    enabled?: boolean
  }
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await api.get(url)
      return data
    },
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutos
    gcTime: options?.gcTime ?? 10 * 60 * 1000, // 10 minutos
    enabled: options?.enabled ?? true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook para requisições com paginação
 */
export function useApiPaginatedQuery(
  baseKey: string,
  url: string,
  page: number = 1,
  limit: number = 20,
  options?: {
    staleTime?: number
    gcTime?: number
  }
) {
  const queryKey = [baseKey, 'page', page, 'limit', limit]
  const fullUrl = `${url}?page=${page}&limit=${limit}`

  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await api.get(fullUrl)
      return data
    },
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    gcTime: options?.gcTime ?? 10 * 60 * 1000,
    retry: 2,
  })
}

/**
 * Hook para POST/PUT/DELETE com invalidação automática
 */
export function useApiMutation(
  mutationFn: (data: any) => Promise<any>,
  invalidateKeys?: string[][]
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      // Invalidar queries relacionadas para refetch automático
      if (invalidateKeys) {
        for (const key of invalidateKeys) {
          await queryClient.invalidateQueries({ queryKey: key })
        }
      }
    },
    onError: (error: any) => {
      console.error('Erro na operação:', error)
    },
  })
}

/**
 * Função para prefetch (carrega dados antes de precisar)
 */
export async function prefetchQuery(
  queryClient: any,
  queryKey: string[],
  url: string
) {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await api.get(url)
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}
