'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query'
import {
  adminUsersAPI,
  Manager,
  CreateManagerData,
  UpdateManagerData,
  AdminUser,
} from '@/lib/api'
import { toast } from 'sonner'
import type {
  ManagerFilters,
  ManagerClientsFilters,
  PaginationData,
  ApiError,
} from '@/lib/types/managers'
import { getErrorMessage } from '@/lib/types/managers'

const QUERY_KEYS = {
  managers: 'managers',
  managersStats: 'managers-stats',
  managerClients: 'manager-clients',
  manager: 'manager',
} as const

const CACHE_CONFIG = {
  staleTime: {
    list: 1000 * 30,
    stats: 1000 * 60,
    clients: 1000 * 30,
  },
  gcTime: 1000 * 60 * 5,
  retry: 2,
} as const

/**
 * Hook para listar gerentes com paginação
 *
 * @param params - Filtros de busca e paginação
 * @param enabled - Se a query deve ser executada
 * @param options - Opções adicionais do React Query
 * @returns Query com lista de gerentes e paginação
 */
export function useManagersList(
  params?: ManagerFilters,
  enabled: boolean = true,
  options?: Partial<
    UseQueryOptions<{
      managers: Manager[]
      pagination: PaginationData
    }>
  >,
) {
  return useQuery({
    queryKey: [QUERY_KEYS.managers, params],
    queryFn: async () => {
      const response = await adminUsersAPI.listManagers(params)
      return {
        managers: response.data.managers,
        pagination: response.data.pagination,
      }
    },
    enabled,
    staleTime: CACHE_CONFIG.staleTime.list,
    gcTime: CACHE_CONFIG.gcTime,
    retry: CACHE_CONFIG.retry,
    ...options,
  })
}

/**
 * Hook para obter estatísticas de gerentes
 *
 * Calcula estatísticas agregadas de gerentes (total, ativos, inativos)
 *
 * @param enabled - Se a query deve ser executada
 * @returns Query com estatísticas de gerentes
 */
export function useManagersStats(enabled: boolean = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.managersStats],
    queryFn: async () => {
      const response = await adminUsersAPI.listManagers({ per_page: 1000 })

      const managers = response.data.managers
      const totalManagers = managers.length
      const activeManagers = managers.filter((m) => m.status === 1).length
      const inactiveManagers = totalManagers - activeManagers

      return {
        total_managers: totalManagers,
        active_managers: activeManagers,
        inactive_managers: inactiveManagers,
      }
    },
    enabled,
    staleTime: CACHE_CONFIG.staleTime.stats,
    gcTime: CACHE_CONFIG.gcTime,
    retry: CACHE_CONFIG.retry,
  })
}

/**
 * Hook para obter clientes vinculados a um gerente
 *
 * @param managerId - ID do gerente
 * @param enabled - Se a query deve ser executada
 * @param params - Filtros de busca e paginação
 * @returns Query com lista de clientes e paginação
 */
export function useManagerClients(
  managerId: number | null,
  enabled: boolean = true,
  params?: ManagerClientsFilters,
) {
  return useQuery({
    queryKey: [QUERY_KEYS.managerClients, managerId, params],
    queryFn: async (): Promise<{
      clients: AdminUser[]
      pagination: PaginationData
    }> => {
      // Early return se não houver managerId
      if (!managerId) {
        return {
          clients: [],
          pagination: {
            current_page: 1,
            per_page: params?.per_page || 10,
            total: 0,
            last_page: 1,
          },
        }
      }

      const response = await adminUsersAPI.getManagerClients(managerId, params)
      return {
        clients: response.data,
        pagination: response.pagination,
      }
    },
    enabled: enabled && !!managerId,
    staleTime: CACHE_CONFIG.staleTime.clients,
    gcTime: CACHE_CONFIG.gcTime,
    retry: CACHE_CONFIG.retry,
  })
}

/**
 * Hook para criar um novo gerente
 *
 * Implementa:
 * - Invalidação automática de cache
 * - Notificações de sucesso/erro
 * - Tratamento de erros
 *
 * @returns Mutation para criar gerente
 */
export function useCreateManager() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateManagerData) => {
      return await adminUsersAPI.createManager(data)
    },
    onSuccess: (response) => {
      // Invalidar cache de gerentes e estatísticas
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.managers] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.managersStats] })

      toast.success(response.data.message || 'Gerente criado com sucesso!')
    },
    onError: (error: ApiError | Error | unknown) => {
      const message = getErrorMessage(
        error,
        'Erro ao criar gerente. Tente novamente.',
      )
      toast.error(message)
      console.error('Erro ao criar gerente:', error)
    },
  })
}

/**
 * Hook para atualizar um gerente
 *
 * Implementa:
 * - Invalidação automática de cache (lista, item e estatísticas)
 * - Notificações de sucesso/erro
 * - Tratamento de erros
 *
 * @returns Mutation para atualizar gerente
 */
export function useUpdateManager() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      managerId,
      data,
    }: {
      managerId: number
      data: UpdateManagerData
    }) => {
      return await adminUsersAPI.updateManager(managerId, data)
    },
    onSuccess: (response, variables) => {
      // Invalidar cache relacionado
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.managers] })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.manager, variables.managerId],
      })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.managersStats] })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.managerClients, variables.managerId],
      })

      toast.success(response.data.message || 'Gerente atualizado com sucesso!')
    },
    onError: (error: ApiError | Error | unknown) => {
      const message = getErrorMessage(
        error,
        'Erro ao atualizar gerente. Tente novamente.',
      )
      toast.error(message)
      console.error('Erro ao atualizar gerente:', error)
    },
  })
}

/**
 * Hook para deletar um gerente
 *
 * Implementa:
 * - Invalidação automática de cache
 * - Notificações de sucesso/erro
 * - Tratamento de erros
 *
 * @returns Mutation para deletar gerente
 */
export function useDeleteManager() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (managerId: number) => {
      return await adminUsersAPI.deleteManager(managerId)
    },
    onSuccess: (response) => {
      // Invalidar cache de gerentes e estatísticas
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.managers] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.managersStats] })

      toast.success(response.data.message || 'Gerente excluído com sucesso!')
    },
    onError: (error: ApiError | Error | unknown) => {
      const message = getErrorMessage(
        error,
        'Erro ao excluir gerente. Tente novamente.',
      )
      toast.error(message)
      console.error('Erro ao deletar gerente:', error)
    },
  })
}
