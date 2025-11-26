/**
 * Custom Hook para gerenciamento de níveis de gamificação (Admin)
 *
 * @module hooks/useGamificationLevels
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { gatewayApi } from '@/lib/api'
import type { UpdateLevelData, LevelsResponse } from '@/lib/types/gamification'

export const GAMIFICATION_LEVELS_KEY = ['gamification', 'levels'] as const

/**
 * Hook principal para gerenciar níveis de gamificação
 *
 * @returns Objeto com queries e mutations
 */
export function useGamificationLevels() {
  const queryClient = useQueryClient()

  const {
    data: levelsData,
    isLoading,
    error,
    refetch,
  } = useQuery<LevelsResponse>({
    queryKey: GAMIFICATION_LEVELS_KEY,
    queryFn: () => gatewayApi.getLevels(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  })

  const updateLevelMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLevelData }) =>
      gatewayApi.updateLevel(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: GAMIFICATION_LEVELS_KEY })

      const previousLevels = queryClient.getQueryData<LevelsResponse>(
        GAMIFICATION_LEVELS_KEY,
      )

      if (previousLevels) {
        queryClient.setQueryData<LevelsResponse>(GAMIFICATION_LEVELS_KEY, {
          ...previousLevels,
          data: {
            ...previousLevels.data,
            niveis: previousLevels.data.niveis.map((level) =>
              level.id === id ? { ...level, ...data } : level,
            ),
          },
        })
      }

      return { previousLevels }
    },

    // Se der erro, reverte
    onError: (err, variables, context) => {
      if (context?.previousLevels) {
        queryClient.setQueryData(
          GAMIFICATION_LEVELS_KEY,
          context.previousLevels,
        )
      }
      toast.error('Erro ao atualizar nível')
    },

    // Sempre refetch após sucesso/erro
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: GAMIFICATION_LEVELS_KEY })
      // Invalida também dados de gamificação dos usuários
      queryClient.invalidateQueries({ queryKey: ['gamification'] })
    },

    onSuccess: () => {
      toast.success('Nível atualizado com sucesso!')
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: (active: boolean) => gatewayApi.toggleLevelsActive(active),

    onMutate: async (active) => {
      await queryClient.cancelQueries({ queryKey: GAMIFICATION_LEVELS_KEY })

      const previousLevels = queryClient.getQueryData<LevelsResponse>(
        GAMIFICATION_LEVELS_KEY,
      )

      if (previousLevels) {
        queryClient.setQueryData<LevelsResponse>(GAMIFICATION_LEVELS_KEY, {
          ...previousLevels,
          data: {
            ...previousLevels.data,
            niveis_ativo: active,
          },
        })
      }

      return { previousLevels }
    },

    onError: (err, variables, context) => {
      if (context?.previousLevels) {
        queryClient.setQueryData(
          GAMIFICATION_LEVELS_KEY,
          context.previousLevels,
        )
      }
      toast.error('Erro ao atualizar status do sistema')
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: GAMIFICATION_LEVELS_KEY })
    },

    onSuccess: (response) => {
      toast.success(response.message)
    },
  })

  return {
    // Data
    levels: levelsData?.data?.niveis ?? [],
    isSystemActive: levelsData?.data?.niveis_ativo ?? false,

    // States
    isLoading,
    error,

    // Actions
    refetch,
    updateLevel: updateLevelMutation.mutate,
    toggleActive: toggleActiveMutation.mutate,

    // Mutation states
    isUpdating: updateLevelMutation.isPending,
    isTogglingActive: toggleActiveMutation.isPending,
  }
}
