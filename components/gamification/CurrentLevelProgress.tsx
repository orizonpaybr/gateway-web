'use client'

import React, { memo, useMemo } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
interface CurrentLevelProgressProps {
  currentLevel: string
  totalDeposited: number
  currentLevelMax?: number
  nextLevelData?: {
    name: string
    minimo: number
    maximo: number
  } | null
  progress: number
  isLoading?: boolean
}

export const CurrentLevelProgress = memo<CurrentLevelProgressProps>(
  ({
    currentLevel,
    totalDeposited,
    currentLevelMax,
    nextLevelData,
    progress,
    isLoading = false,
  }) => {
    const getCurrentLevelIcon = useMemo(() => {
      switch (currentLevel) {
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
    }, [currentLevel])

    const formatCurrency = useMemo(
      () => (value: number) =>
        value.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      [],
    )

    const remainingAmount = useMemo(() => {
      if (!currentLevelMax) {
        return 0
      }
      return Math.max(0, currentLevelMax - totalDeposited)
    }, [currentLevelMax, totalDeposited])

    if (isLoading) {
      return (
        <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-center gap-6">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-8 w-24 mb-4" />
              <Skeleton className="h-2 w-full rounded-full mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </Card>
      )
    }

    return (
      <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 flex items-center justify-center">
            <Image
              src={getCurrentLevelIcon}
              alt={`${currentLevel} medal`}
              width={64}
              height={64}
              className="object-contain"
            />
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nível atual: {currentLevel}
            </h2>

            <div className="text-3xl font-bold text-gray-900 mb-4">
              {formatCurrency(totalDeposited)}
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            <p className="text-gray-600">
              {nextLevelData
                ? `${formatCurrency(remainingAmount)} para alcançar ${
                    nextLevelData.name
                  }`
                : 'Todas as metas foram conquistadas! Parabéns!'}
            </p>
          </div>
        </div>
      </Card>
    )
  },
)

CurrentLevelProgress.displayName = 'CurrentLevelProgress'

export default CurrentLevelProgress
