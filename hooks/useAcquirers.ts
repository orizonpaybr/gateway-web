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
 * Hook para definir uma adquirente como a Global (is_default PIX)
 */
export function useSetDefaultAcquirer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (acquirerId: number) => {
      return await adminUsersAPI.setDefaultAcquirer(acquirerId)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: ['admin-pix-acquirers'] })
      toast.success(response.data.message || 'Adquirente Global atualizada!')
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar adquirente Global. Tente novamente.'
      toast.error(message)
      console.error('Erro ao definir adquirente Global:', error)
    },
  })
}
