'use client'

import { useQuery } from '@tanstack/react-query'
import { useStableMemo, useStableCallback } from './useGlobalMemo'
import { useAuth } from '@/contexts/AuthContext'

interface SidebarGamificationData {
  currentLevel: string | null
  totalDeposited: number
  currentLevelMax: number
  nextLevelData: {
    name: string
    minimo: number
    maximo: number
  } | null
  isLoading: boolean
  error: Error | null
  refreshData: () => void
}

export function useSidebarGamification(): SidebarGamificationData {
  const { authReady } = useAuth()

  // Hook específico para dados da Sidebar com React Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sidebar-gamification'],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gamification/sidebar`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message || 'Erro ao obter dados de gamificação')
      }

      return result
    },
    enabled: authReady, // ✅ Só executar quando authReady for true
    staleTime: 3 * 60 * 1000, // 3 minutos (matching Redis TTL)
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  })

  // Memorizar dados processados para a Sidebar
  const processedData = useStableMemo(() => {
    if (!data?.data) {
      return {
        currentLevel: null,
        totalDeposited: 0,
        currentLevelMax: 100000,
        nextLevelData: null,
      }
    }

    return {
      currentLevel: data.data.current_level,
      totalDeposited: data.data.total_deposited,
      currentLevelMax: data.data.current_level_max,
      nextLevelData: data.data.next_level,
    }
  }, [data])

  // Callback estável para refresh
  const refreshData = useStableCallback(() => {
    refetch()
  }, [refetch])

  return {
    ...processedData,
    isLoading,
    error: error as Error | null,
    refreshData,
  }
}
