'use client'

import { useCallback } from 'react'
import { useGamificationData } from './useReactQuery'
import { useStableMemo, useStableCallback } from './useGlobalMemo'

interface GamificationData {
  current_level: string
  total_deposited: number
  current_progress: number
  next_level?: {
    name: string
    minimo: number
    maximo: number
  } | null
  achievement_trail: Array<{
    id: number
    name: string
    amount: string
    status: 'Concluído' | 'Em progresso' | 'Bloqueado'
    color: string
    bgColor: string
    progress: number
    minimo: number
    maximo: number
    cor: string
    icone: string | null
  }>
  achievement_messages: Array<{
    level: string
    message: string
    icon: string
  }>
  summary_cards: {
    total_deposited: string
    current_level: string
    next_goal: string
  }
}

export function useGamification() {
  const { data, isLoading, error, refetch } = useGamificationData()

  // Memorização de dados processados
  const processedData = useStableMemo(() => {
    if (!data?.data) {
      return null
    }

    const gamificationData: GamificationData = data.data

    return {
      currentLevel: gamificationData.current_level,
      totalDeposited: gamificationData.total_deposited,
      currentProgress: gamificationData.current_progress,
      currentLevelMax: getCurrentLevelMax(gamificationData.current_level),
      nextLevelData: gamificationData.next_level,
      achievementTrail: gamificationData.achievement_trail,
      achievementMessages: gamificationData.achievement_messages,
      summaryCards: gamificationData.summary_cards
        ? [
            {
              title: 'Total Depositado',
              value: gamificationData.summary_cards.total_deposited,
              icon: null,
              isImage: false,
            },
            {
              title: 'Nível Alcançado',
              value: gamificationData.summary_cards.current_level,
              icon: null,
              isImage: true,
              imageSrc: getCurrentLevelIcon(gamificationData.current_level),
            },
            {
              title: 'Próxima Meta',
              value: gamificationData.summary_cards.next_goal,
              icon: null,
              isImage: false,
            },
          ]
        : [],
    }
  }, [data])

  const refreshData = useStableCallback(() => {
    refetch()
  }, [refetch])

  const formatCurrency = useCallback((value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }, [])

  return {
    data: processedData,
    isLoading,
    error,
    refreshData,
    formatCurrency,
    // Dados brutos para casos especiais
    rawData: data?.data,
  }
}

// Função auxiliar para obter valor máximo do nível atual
function getCurrentLevelMax(level: string): number {
  switch (level) {
    case 'Bronze':
      return 100000
    case 'Prata':
      return 500000
    case 'Ouro':
      return 1000000
    case 'Safira':
      return 5000000
    case 'Diamante':
      return 10000000
    default:
      return 100000
  }
}

// Função auxiliar para obter ícone do nível atual
function getCurrentLevelIcon(level: string): string {
  switch (level) {
    case 'Bronze':
      return '/icons8-medalha-de-terceiro-lugar-48.png'
    case 'Prata':
      return '/icons8-medalha-de-segundo-lugar-80.png'
    case 'Ouro':
      return '/icons8-medalha-de-primeiro-lugar-48.png'
    case 'Safira':
      return '/icons8-logotipo-safira-48.png'
    case 'Diamante':
      return '/icons8-diamante-64.png'
    default:
      return '/icons8-medalha-de-terceiro-lugar-48.png'
  }
}
