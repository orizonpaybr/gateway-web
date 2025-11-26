'use client'

import { useStableMemo, useStableCallback } from './useGlobalMemo'
import { useGamificationData } from './useReactQuery'
import type {
  SidebarGamificationData,
  GamificationJourneyData,
} from '@/lib/types/gamification'

export function useSidebarGamification(): SidebarGamificationData {
  const { data, isLoading, error, refetch } = useGamificationData()

  const processedData = useStableMemo(() => {
    if (!data?.data) {
      return {
        currentLevel: null,
        totalDeposited: 0,
        currentLevelMin: 0,
        currentLevelMax: 100000,
        nextLevelData: null,
      }
    }

    const gamification = data.data as GamificationJourneyData
    const trail = gamification.achievement_trail ?? []

    // Com a nova regra, confiamos que o backend já devolve o nível atual corretamente,
    // considerando que o Bronze sempre tem mínimo 0,00.
    let currentLevelMin = 0
    let currentLevelMax = 100000
    let currentLevelName = gamification.current_level

    if (trail.length > 0) {
      if (currentLevelName) {
        const current = trail.find((level) => level.name === currentLevelName)
        if (current) {
          currentLevelMin = current.minimo
          currentLevelMax = current.maximo
        } else {
          // Fallback simples: usar o primeiro nível da trilha (Bronze)
          currentLevelMin = trail[0].minimo
          currentLevelMax = trail[0].maximo
          currentLevelName = trail[0].name
        }
      } else {
        // Se por algum motivo não vier current_level, usamos o primeiro nível
        currentLevelMin = trail[0].minimo
        currentLevelMax = trail[0].maximo
        currentLevelName = trail[0].name
      }
    }

    return {
      currentLevel: currentLevelName,
      totalDeposited: gamification.total_deposited ?? 0,
      currentLevelMin,
      currentLevelMax,
      nextLevelData: gamification.next_level ?? null,
    }
  }, [data])

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
