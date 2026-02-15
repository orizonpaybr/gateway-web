import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { affiliateAPI } from '@/lib/api/affiliate'
import type { AffiliateStats } from '@/types/affiliate'

/**
 * Hook para buscar o link, código de afiliado e totais (indicados, ganhos)
 */
export function useAffiliateLink() {
  const { authReady } = useAuth()

  return useQuery({
    queryKey: ['affiliate-link'],
    queryFn: () => affiliateAPI.getLink(),
    enabled: authReady,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

/**
 * Estatísticas do programa de afiliados (total de indicados, total ganho, ganhos do mês).
 * Dados vêm do endpoint affiliate-link.
 */
export function useAffiliateStats(): {
  data: AffiliateStats | undefined
  isLoading: boolean
  error: Error | null
} {
  const { data: linkResponse, isLoading } = useAffiliateLink()
  const linkData = linkResponse?.data

  if (isLoading || !linkData) {
    return {
      data: undefined,
      isLoading,
      error: null,
    }
  }

  const stats: AffiliateStats = {
    total_earned: linkData.current_balance,
    total_referrals: linkData.affiliates_count,
    monthly_earned: linkData.monthly_earned,
  }

  return { data: stats, isLoading: false, error: null }
}
