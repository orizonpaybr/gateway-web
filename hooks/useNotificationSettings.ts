import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  toggleNotificationPreference,
  disableAllNotifications,
  enableAllNotifications,
  type NotificationPreferences,
} from '@/lib/api'
import { useLocalStorage } from './useLocalStorage'
import { useCallback } from 'react'

/**
 * Hook para gerenciar preferências de notificação com React Query
 * Utiliza cache otimizado e mutations para atualizações
 */
export function useNotificationSettings() {
  // Para endpoints que usam middleware check.token.secret, usamos api_token/api_secret
  const [storedToken] = useLocalStorage<string | null>('api_token', null)
  const [storedSecret] = useLocalStorage<string | null>('api_secret', null)
  const queryClient = useQueryClient()
  const hasCredentials = Boolean(storedToken && storedSecret)

  // Helper para validar credenciais e lançar erro se necessário
  const validateCredentials = useCallback(() => {
    if (!hasCredentials || !storedToken || !storedSecret) {
      throw new Error('Credenciais não encontradas')
    }
  }, [hasCredentials, storedToken, storedSecret])

  // Query para buscar preferências
  const {
    data: preferences,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<NotificationPreferences>({
    queryKey: ['notification-preferences', storedToken],
    queryFn: async () => {
      validateCredentials()
      const response = await getNotificationPreferences(
        storedToken!,
        storedSecret!,
      )
      return response.data
    },
    enabled: hasCredentials,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
  })

  // Mutation para atualizar preferências
  const updateMutation = useMutation({
    mutationFn: async (newPreferences: Partial<NotificationPreferences>) => {
      validateCredentials()
      const response = await updateNotificationPreferences(
        storedToken!,
        storedSecret!,
        newPreferences,
      )
      return response.data
    },
    onMutate: async (newPreferences) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({
        queryKey: ['notification-preferences'],
      })

      // Snapshot do valor anterior
      const previousPreferences =
        queryClient.getQueryData<NotificationPreferences>([
          'notification-preferences',
          storedToken,
        ])

      // Atualizar cache otimisticamente
      if (previousPreferences) {
        queryClient.setQueryData<NotificationPreferences>(
          ['notification-preferences', storedToken],
          { ...previousPreferences, ...newPreferences },
        )
      }

      return { previousPreferences }
    },
    onError: (err, variables, context) => {
      // Reverter ao valor anterior em caso de erro
      if (context?.previousPreferences) {
        queryClient.setQueryData(
          ['notification-preferences', storedToken],
          context.previousPreferences,
        )
      }
    },
    onSuccess: (data) => {
      // Atualizar cache com dados do servidor
      queryClient.setQueryData(['notification-preferences', storedToken], data)
    },
  })

  // Mutation para toggle de preferência específica
  const toggleMutation = useMutation({
    mutationFn: async (
      type:
        | 'notify_transactions'
        | 'notify_deposits'
        | 'notify_withdrawals'
        | 'notify_security'
        | 'notify_system',
    ) => {
      validateCredentials()
      const response = await toggleNotificationPreference(
        storedToken!,
        storedSecret!,
        type,
      )
      return response.data
    },
    onMutate: async (type) => {
      await queryClient.cancelQueries({
        queryKey: ['notification-preferences'],
      })

      const previousPreferences =
        queryClient.getQueryData<NotificationPreferences>([
          'notification-preferences',
          storedToken,
        ])

      if (previousPreferences) {
        queryClient.setQueryData<NotificationPreferences>(
          ['notification-preferences', storedToken],
          { ...previousPreferences, [type]: !previousPreferences[type] },
        )
      }

      return { previousPreferences }
    },
    onError: (err, variables, context) => {
      if (context?.previousPreferences) {
        queryClient.setQueryData(
          ['notification-preferences', storedToken],
          context.previousPreferences,
        )
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['notification-preferences', storedToken], data)
    },
  })

  // Mutation para desabilitar todas
  const disableAllMutation = useMutation({
    mutationFn: async () => {
      validateCredentials()
      const response = await disableAllNotifications(
        storedToken!,
        storedSecret!,
      )
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['notification-preferences', storedToken], data)
    },
  })

  // Mutation para habilitar todas
  const enableAllMutation = useMutation({
    mutationFn: async () => {
      validateCredentials()
      const response = await enableAllNotifications(storedToken!, storedSecret!)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['notification-preferences', storedToken], data)
    },
  })

  // Funções auxiliares
  const updatePreferences = useCallback(
    (newPreferences: Partial<NotificationPreferences>) => {
      return updateMutation.mutateAsync(newPreferences)
    },
    [updateMutation],
  )

  const togglePreference = useCallback(
    (
      type:
        | 'notify_transactions'
        | 'notify_deposits'
        | 'notify_withdrawals'
        | 'notify_security'
        | 'notify_system',
    ) => {
      return toggleMutation.mutateAsync(type)
    },
    [toggleMutation],
  )

  const disableAll = useCallback(() => {
    return disableAllMutation.mutateAsync()
  }, [disableAllMutation])

  const enableAll = useCallback(() => {
    return enableAllMutation.mutateAsync()
  }, [enableAllMutation])

  return {
    // Dados
    preferences,
    isLoading,
    isError,
    error,
    hasCredentials,

    // Ações
    updatePreferences,
    togglePreference,
    disableAll,
    enableAll,
    refetch,

    // Status das mutations
    isUpdating:
      updateMutation.isPending ||
      toggleMutation.isPending ||
      disableAllMutation.isPending ||
      enableAllMutation.isPending,
    updateError:
      updateMutation.error ||
      toggleMutation.error ||
      disableAllMutation.error ||
      enableAllMutation.error,
  }
}
