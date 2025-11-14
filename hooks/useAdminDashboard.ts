import { useQuery, UseQueryResult } from '@tanstack/react-query'
import {
  adminDashboardAPI,
  AdminDashboardStats,
  AdminUser,
  AdminTransaction,
  CacheMetrics,
} from '@/lib/api'

/**
 * Hook para obter estatísticas do dashboard administrativo
 *
 * Implementa boas práticas:
 * - React Query para cache e refetch automático
 * - TypeScript para type safety
 * - Error handling
 * - Loading states
 *
 * @param periodo - Período para filtrar ('hoje', 'ontem', '7dias', '30dias', etc)
 * @param enabled - Se a query deve ser executada (default: true)
 */
export function useAdminDashboardStats(
  periodo: string = 'hoje',
  enabled: boolean = true,
): UseQueryResult<AdminDashboardStats, Error> {
  return useQuery<AdminDashboardStats, Error>({
    queryKey: ['admin-dashboard-stats', periodo],
    queryFn: async () => {
      const response = await adminDashboardAPI.getStats(periodo)
      if (!response.success) {
        throw new Error('Erro ao obter estatísticas do dashboard')
      }
      return response.data
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutos - sincronizado com cache do backend
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true,
    retry: 2,
  })
}

/**
 * Hook para obter lista de usuários
 *
 * @param params - Parâmetros de filtro e paginação
 * @param enabled - Se a query deve ser executada (default: true)
 */
export function useAdminUsers(
  params?: {
    status?: number
    search?: string
    per_page?: number
    page?: number
    order_by?: string
    order_direction?: 'asc' | 'desc'
  },
  enabled: boolean = true,
): UseQueryResult<
  {
    users: AdminUser[]
    pagination: {
      current_page: number
      per_page: number
      total: number
      last_page: number
    }
  },
  Error
> {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: async () => {
      const response = await adminDashboardAPI.getUsers(params)
      if (!response.success) {
        throw new Error('Erro ao obter lista de usuários')
      }
      return {
        users: response.data,
        pagination: response.pagination,
      }
    },
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 3 * 60 * 1000, // 3 minutos
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

/**
 * Hook para obter transações recentes
 *
 * @param params - Parâmetros de filtro
 * @param enabled - Se a query deve ser executada (default: true)
 */
export function useAdminTransactions(
  params?: {
    type?: 'deposit' | 'withdraw'
    status?: string
    limit?: number
  },
  enabled: boolean = true,
): UseQueryResult<AdminTransaction[], Error> {
  return useQuery({
    queryKey: ['admin-transactions', params],
    queryFn: async () => {
      const response = await adminDashboardAPI.getTransactions(params)
      if (!response.success) {
        throw new Error('Erro ao obter transações')
      }
      return response.data.transactions
    },
    enabled,
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Atualizar a cada 1 minuto
    retry: 1,
  })
}

/**
 * Hook para obter métricas de cache Redis
 *
 * @param enabled - Se a query deve ser executada (default: true)
 */
export function useCacheMetrics(
  enabled: boolean = true,
): UseQueryResult<CacheMetrics, Error> {
  return useQuery<CacheMetrics, Error>({
    queryKey: ['admin-cache-metrics'],
    queryFn: async () => {
      const response = await adminDashboardAPI.getCacheMetrics()
      if (!response.success) {
        throw new Error('Erro ao obter métricas de cache')
      }
      return response.data
    },
    enabled,
    staleTime: 60 * 1000, // 1 minuto
    gcTime: 3 * 60 * 1000, // 3 minutos
    refetchOnWindowFocus: false,
    refetchInterval: 60 * 1000, // Atualizar a cada 1 minuto
    retry: 1,
  })
}
