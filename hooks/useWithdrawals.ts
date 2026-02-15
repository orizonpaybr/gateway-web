import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { withdrawalsAPI, type WithdrawalFilters } from '@/lib/api'
import { toast } from 'sonner'

// Hook para listar saques
export function useWithdrawals(filters?: WithdrawalFilters, enabled = true) {
  return useQuery({
    queryKey: ['withdrawals', filters],
    queryFn: () => withdrawalsAPI.list(filters),
    enabled,
    staleTime: 30000,
    refetchInterval: 60000,
  })
}

// Hook para buscar detalhes de um saque específico
export function useWithdrawalDetails(id: number | null, enabled = true) {
  return useQuery({
    queryKey: ['withdrawal', id],
    queryFn: () => {
      if (!id) {
        throw new Error('ID não fornecido')
      }
      return withdrawalsAPI.getById(id)
    },
    enabled: enabled && id !== null,
    staleTime: 30000,
  })
}

// Hook para buscar estatísticas de saques
export function useWithdrawalStats(periodo: string = 'hoje', enabled = true) {
  return useQuery({
    queryKey: ['withdrawal-stats', periodo],
    queryFn: () => withdrawalsAPI.getStats(periodo),
    enabled,
    staleTime: 60000,
  })
}

// Hook para aprovar saque
export function useApproveWithdrawal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => withdrawalsAPI.approve(id),
    onMutate: async (_id) => {
      // Cancelar queries em andamento para evitar sobrescrever a atualização otimista
      await queryClient.cancelQueries({ queryKey: ['withdrawals'] })
    },
    onSuccess: async (data) => {
      toast.success(data.message || 'Saque aprovado com sucesso!')
      // Invalidar e refetch queries relacionadas
      await queryClient.invalidateQueries({ queryKey: ['withdrawals'] })
      await queryClient.invalidateQueries({ queryKey: ['withdrawal-stats'] })
      // Forçar refetch imediato para garantir dados atualizados
      await queryClient.refetchQueries({ queryKey: ['withdrawals'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao aprovar saque')
      // Revalidar em caso de erro
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] })
    },
  })
}

// Hook para rejeitar saque
export function useRejectWithdrawal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => withdrawalsAPI.reject(id),
    onMutate: async () => {
      // Cancelar queries em andamento para evitar sobrescrever a atualização otimista
      await queryClient.cancelQueries({ queryKey: ['withdrawals'] })
    },
    onSuccess: async (data) => {
      toast.success(data.message || 'Saque rejeitado com sucesso!')
      // Invalidar e refetch queries relacionadas
      await queryClient.invalidateQueries({ queryKey: ['withdrawals'] })
      await queryClient.invalidateQueries({ queryKey: ['withdrawal-stats'] })
      // Forçar refetch imediato para garantir dados atualizados
      await queryClient.refetchQueries({ queryKey: ['withdrawals'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao rejeitar saque')
      // Revalidar em caso de erro
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] })
    },
  })
}
