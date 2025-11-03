import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { utmifyAPI } from '@/lib/api'
import { toast } from 'sonner'
import { useState, useCallback } from 'react'

/**
 * Hook otimizado para gerenciar integração com Utmify
 *
 * Features:
 * - Cache automático com React Query
 * - Invalidação inteligente de cache
 * - Tratamento de erros
 * - Suporte a 2FA
 * - Performance otimizada
 *
 * @example
 * ```tsx
 * const { config, isLoading, saveApiKey, removeApiKey, testConnection } = useUtmify()
 * ```
 */
export function useUtmify() {
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
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    retry: 2,
  })

  // Mutation para salvar configuração
  const saveConfigMutation = useMutation({
    mutationFn: ({ apiKey, pin }: { apiKey: string; pin?: string }) =>
      utmifyAPI.saveConfig(apiKey, pin),
    onSuccess: (data) => {
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
    onError: (error: any) => {
      // Verificar se requer 2FA
      if (error.requires_2fa) {
        setIsPending2FA(true)
        return
      }

      toast.error('Erro ao salvar API Key', {
        description: error.message || 'Tente novamente mais tarde',
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
    onError: (error: any) => {
      if (error.requires_2fa) {
        setIsPending2FA(true)
        return
      }

      toast.error('Erro ao remover API Key', {
        description: error.message || 'Tente novamente mais tarde',
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
    onError: (error: any) => {
      toast.error('Erro ao testar conexão', {
        description: error.message || 'Verifique sua API Key',
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
