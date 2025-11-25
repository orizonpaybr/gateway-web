import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { gatewaySettingsAPI } from '@/lib/api'
import { toast } from 'sonner'
import type {
  GatewaySettings,
  GatewaySettingsUpdate,
} from '@/types/gateway-settings'

const QUERY_KEY = ['gateway-settings']
const STALE_TIME = 5 * 60 * 1000
const CACHE_TIME = 10 * 60 * 1000

export function useGatewaySettings() {
  const queryClient = useQueryClient()

  // Query para buscar configurações (com cache)
  const {
    data: settings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<GatewaySettings> => {
      const response = await gatewaySettingsAPI.getSettings()
      return response.data as GatewaySettings
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: 2,
  })

  // Mutation para atualizar configurações
  const updateMutation = useMutation({
    mutationFn: async (data: GatewaySettingsUpdate) => {
      return await gatewaySettingsAPI.updateSettings(data)
    },
    onMutate: async (newSettings) => {
      // Cancelar queries pendentes
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })

      // Snapshot do valor anterior (optimistic update)
      const previousSettings =
        queryClient.getQueryData<GatewaySettings>(QUERY_KEY)

      // Atualizar cache otimisticamente
      queryClient.setQueryData<GatewaySettings>(QUERY_KEY, (old) => ({
        ...old!,
        ...newSettings,
      }))

      return { previousSettings }
    },
    onError: (error, _variables, context) => {
      // Rollback em caso de erro
      if (context?.previousSettings) {
        queryClient.setQueryData(QUERY_KEY, context.previousSettings)
      }

      console.error('Erro ao atualizar configurações:', error)
      toast.error('Erro ao salvar configurações')
    },
    onSuccess: () => {
      toast.success('Configurações salvas com sucesso!')
    },
    onSettled: () => {
      // Refetch para garantir consistência
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  return {
    settings: settings ?? null,
    isLoading,
    error,
    refetch,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  }
}
