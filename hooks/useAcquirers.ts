'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminUsersAPI } from '@/lib/api'
import { toast } from 'sonner'

const QUERY_KEY = 'acquirers'

/**
 * Hook para listar todos os adquirentes
 */
export function useAcquirersList(
  params?: { per_page?: number },
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async () => {
      const response = await adminUsersAPI.listAcquirers(params)
      return {
        acquirers: response.data.acquirers,
        pagination: response.data.pagination,
      }
    },
    enabled,
    staleTime: 1000 * 30,
  })
}

/**
 * Hook para alternar status do adquirente (ativar/desativar)
 */
export function useToggleAcquirerStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (acquirerId: number) => {
      return await adminUsersAPI.toggleAcquirerStatus(acquirerId)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success(response.data.message || 'Status alterado com sucesso!')
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao alterar status. Tente novamente.'
      toast.error(message)
      console.error('Erro ao alternar status do adquirente:', error)
    },
  })
}
