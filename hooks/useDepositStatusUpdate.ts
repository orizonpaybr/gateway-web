import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { financialAPI } from '@/lib/api'

interface UpdateDepositStatusParams {
  depositoId: number
  newStatus: string
}

/**
 * Hook para atualizar status de depósito
 * Implementa mutation com React Query para otimização e cache invalidation
 */
export function useDepositStatusUpdate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      depositoId,
      newStatus,
    }: UpdateDepositStatusParams) => {
      const response = await financialAPI.updateDepositStatus(
        depositoId,
        newStatus,
      )

      if (!response.success) {
        throw new Error(
          response.data?.message || 'Erro ao atualizar status do depósito',
        )
      }

      return response.data
    },
    onMutate: async ({ depositoId }) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: ['financial-deposits'] })

      // Retornar contexto para rollback se necessário
      return { depositoId }
    },
    onSuccess: (data, variables) => {
      // Invalidar queries para refetch automático
      queryClient.invalidateQueries({ queryKey: ['financial-deposits'] })
      queryClient.invalidateQueries({ queryKey: ['financial-deposits-stats'] })

      // Atualizar cache otimisticamente com os dados retornados
      if (data?.deposit) {
        queryClient.setQueryData(['financial-deposits'], (oldData: unknown) => {
          if (!oldData || typeof oldData !== 'object' || !('data' in oldData)) {
            return oldData
          }
          const typedData = oldData as {
            data?: { data?: Array<{ id: number; [key: string]: unknown }> }
          }
          if (!typedData.data?.data) {
            return oldData
          }

          return {
            ...typedData,
            data: {
              ...typedData.data,
              data: typedData.data.data.map((dep) =>
                dep.id === variables.depositoId ? data.deposit : dep,
              ),
            },
          }
        })
      }

      toast.success(
        data?.message ||
          `Status do depósito #${variables.depositoId} alterado com sucesso`,
      )
    },
    onError: (error: Error, _variables) => {
      toast.error('Erro ao atualizar status', {
        description: error.message || 'Tente novamente mais tarde',
      })
    },
  })
}
