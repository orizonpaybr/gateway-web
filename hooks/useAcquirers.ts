'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  adminUsersAPI,
  type CreateAcquirerData,
  type UpdateAcquirerData,
} from '@/lib/api'
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

/**
 * Hook para criar uma nova nominal (conta com credenciais próprias)
 */
export function useCreateAcquirer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateAcquirerData) => {
      return await adminUsersAPI.createAcquirer(data)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success(response.data.message || 'Nominal criada com sucesso!')
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao criar nominal. Tente novamente.'
      toast.error(message)
      console.error('Erro ao criar nominal:', error)
    },
  })
}

/**
 * Hook para atualizar uma nominal existente (nome, URL, status ou credenciais)
 */
export function useUpdateAcquirer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      acquirerId,
      data,
    }: {
      acquirerId: number
      data: UpdateAcquirerData
    }) => {
      return await adminUsersAPI.updateAcquirer(acquirerId, data)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success(response.data.message || 'Nominal atualizada com sucesso!')
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar nominal. Tente novamente.'
      toast.error(message)
      console.error('Erro ao atualizar nominal:', error)
    },
  })
}
