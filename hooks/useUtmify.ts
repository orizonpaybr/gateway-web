import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { utmifyAPI } from '@/lib/api'
import { toast } from 'sonner'
import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export function useUtmify() {
  const { authReady } = useAuth()
  const queryClient = useQueryClient()
  const [isPending2FA, setIsPending2FA] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    type: 'save' | 'delete' | null
    apiKey?: string
  }>({ type: null })

  // Query para obter configuração
  const {
    data: configData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['utmify', 'config'],
    queryFn: utmifyAPI.getConfig,
    enabled: authReady,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })

  // Mutation para salvar configuração
  const saveConfigMutation = useMutation({
    mutationFn: ({ apiKey, pin }: { apiKey: string; pin?: string }) =>
      utmifyAPI.saveConfig(apiKey, pin),
    onSuccess: (_data) => {
      // Invalidar cache para forçar refetch
      queryClient.invalidateQueries({ queryKey: ['utmify', 'config'] })

      toast.success('API Key da Utmify salva com sucesso', {
        description:
          'Seus pedidos e campanhas PIX serão rastreados automaticamente.',
      })

      // Limpar estados pendentes
      setIsPending2FA(false)
      setPendingAction({ type: null })
    },
    onError: (error: unknown) => {
      // Verificar se requer 2FA
      if ((error as { requires_2fa?: boolean })?.requires_2fa) {
        setIsPending2FA(true)
        return
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Tente novamente mais tarde'

      toast.error('Erro ao salvar API Key', {
        description: errorMessage,
      })

      setIsPending2FA(false)
      setPendingAction({ type: null })
    },
  })

  // Mutation para remover configuração
  const deleteConfigMutation = useMutation({
    mutationFn: (pin?: string) => utmifyAPI.deleteConfig(pin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utmify', 'config'] })

      toast.success('API Key da Utmify removida', {
        description: 'O rastreamento foi desativado.',
      })

      setIsPending2FA(false)
      setPendingAction({ type: null })
    },
    onError: (error: unknown) => {
      if ((error as { requires_2fa?: boolean })?.requires_2fa) {
        setIsPending2FA(true)
        return
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Tente novamente mais tarde'

      toast.error('Erro ao remover API Key', {
        description: errorMessage,
      })

      setIsPending2FA(false)
      setPendingAction({ type: null })
    },
  })

  // Mutation para testar conexão
  const testConnectionMutation = useMutation({
    mutationFn: utmifyAPI.testConnection,
    onSuccess: (data) => {
      toast.success('Conexão com Utmify OK', {
        description: `Status: ${data.data.status}`,
      })
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Verifique sua API Key'
      toast.error('Erro ao testar conexão', {
        description: errorMessage,
      })
    },
  })

  // Função para salvar API Key
  const saveApiKey = useCallback(
    (apiKey: string, pin?: string) => {
      if (!apiKey || apiKey.trim().length === 0) {
        toast.error('API Key inválida', {
          description: 'Por favor, insira uma API Key válida',
        })
        return
      }

      setPendingAction({ type: 'save', apiKey })
      saveConfigMutation.mutate({ apiKey, pin })
    },
    [saveConfigMutation],
  )

  // Função para remover API Key
  const removeApiKey = useCallback(
    (pin?: string) => {
      setPendingAction({ type: 'delete' })
      deleteConfigMutation.mutate(pin)
    },
    [deleteConfigMutation],
  )

  // Função para testar conexão
  const testConnection = useCallback(() => {
    if (!configData?.data.enabled) {
      toast.error('API Key não configurada', {
        description: 'Configure uma API Key antes de testar a conexão',
      })
      return
    }

    testConnectionMutation.mutate()
  }, [configData?.data.enabled, testConnectionMutation])

  // Função para retry com 2FA
  const retryWith2FA = useCallback(
    (pin: string) => {
      if (pendingAction.type === 'save' && pendingAction.apiKey) {
        saveConfigMutation.mutate({ apiKey: pendingAction.apiKey, pin })
      } else if (pendingAction.type === 'delete') {
        deleteConfigMutation.mutate(pin)
      }
    },
    [pendingAction, saveConfigMutation, deleteConfigMutation],
  )

  return {
    // Dados
    config: configData?.data,

    // Estados de loading
    isLoading,
    isSaving: saveConfigMutation.isPending,
    isDeleting: deleteConfigMutation.isPending,
    isTesting: testConnectionMutation.isPending,

    // Estados de 2FA
    isPending2FA,
    pendingAction,

    // Funções
    saveApiKey,
    removeApiKey,
    testConnection,
    retryWith2FA,
    refetch,

    // Erros
    error,
  }
}
