import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import {
  adminReconciliationAPI,
  type ReconciliationReport,
} from '@/lib/api'

/**
 * Hook para obter o relatório de conciliação diária por usuário (Admin)
 *
 * @param periodo - 'hoje' | 'ontem' | '7dias' | '30dias' ou 'YYYY-MM-DD:YYYY-MM-DD'
 * @param userId - Filtrar por usuário específico (opcional)
 * @param enabled - Se a query deve ser executada
 */
export function useReconciliationReport(
  periodo: string = 'hoje',
  userId?: string,
  enabled: boolean = true,
): UseQueryResult<ReconciliationReport, Error> {
  return useQuery<ReconciliationReport, Error>({
    queryKey: ['admin-reconciliation-report', periodo, userId ?? null],
    queryFn: async () => {
      const response = await adminReconciliationAPI.getReport(periodo, userId)
      if (!response.success) {
        throw new Error('Erro ao obter relatório de conciliação')
      }
      return response.data
    },
    enabled,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}
