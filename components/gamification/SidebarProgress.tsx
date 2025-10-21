'use client'

import React, { memo, useMemo } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

interface SidebarProgressProps {
  currentLevel: string | null
  totalDeposited: number
  currentLevelMax: number
  nextLevelData: {
    name: string
    minimo: number
    maximo: number
  } | null
  isLoading?: boolean
}

const getLevelColor = (level: string | null) => {
  switch (level) {
    case 'Bronze':
      return 'bg-amber-600'
    case 'Prata':
      return 'bg-gray-400'
    case 'Ouro':
      return 'bg-yellow-500'
    case 'Safira':
      return 'bg-blue-500'
    case 'Diamante':
      return 'bg-purple-600'
    default:
      return 'bg-amber-600'
  }
}

const getLevelDotColor = (level: string | null) => {
  switch (level) {
    case 'Bronze':
      return 'bg-amber-600'
    case 'Prata':
      return 'bg-gray-400'
    case 'Ouro':
      return 'bg-yellow-500'
    case 'Safira':
      return 'bg-blue-500'
    case 'Diamante':
      return 'bg-purple-600'
    default:
      return 'bg-amber-600'
  }
}

export const SidebarProgress = memo<SidebarProgressProps>(
  ({
    currentLevel,
    totalDeposited,
    currentLevelMax,
    nextLevelData,
    isLoading = false,
  }) => {
    const progressData = useMemo(() => {
      if (!currentLevel || !currentLevelMax) {
        return {
          progress: 0,
          remainingAmount: 0,
          nextLevelName: 'Prata',
          formattedCurrent: 'R$ 0,00',
          formattedTarget: 'R$ 100.000,00',
          formattedRemaining: 'R$ 100.000,00',
        }
      }

      const progress = Math.min(100, (totalDeposited / currentLevelMax) * 100)
      const remainingAmount = Math.max(0, currentLevelMax - totalDeposited)
      const nextLevelName = nextLevelData?.name || 'Prata'

      const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value)
      }

      return {
        progress,
        remainingAmount,
        nextLevelName,
        formattedCurrent: formatCurrency(totalDeposited),
        formattedTarget: formatCurrency(currentLevelMax),
        formattedRemaining: formatCurrency(remainingAmount),
      }
    }, [currentLevel, totalDeposited, currentLevelMax, nextLevelData])

    if (isLoading) {
      return (
        <div className="bg-white rounded-lg p-5 space-y-3 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-3 w-20" />
          </div>

          <div className="space-y-2">
            <Skeleton className="w-full h-1.5 rounded-full" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="text-center">
              <Skeleton className="h-3 w-24 mx-auto" />
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-lg p-5 space-y-3 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-3 h-3 rounded-full',
                getLevelDotColor(currentLevel),
              )}
            />
            <span className="text-sm font-semibold text-gray-900">
              {currentLevel || 'Bronze'}
            </span>
          </div>
          <Link
            href="/dashboard/jornada"
            className="text-xs text-primary hover:underline font-medium"
          >
            Ver progresso
          </Link>
        </div>

        <div className="space-y-2">
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                getLevelColor(currentLevel),
              )}
              style={{ width: `${progressData.progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs text-gray-600">
            <span>{progressData.formattedCurrent}</span>
            <span>{progressData.formattedTarget}</span>
          </div>

          <div className="text-center">
            <span className="text-xs text-primary font-medium">
              {progressData.formattedRemaining} para{' '}
              {progressData.nextLevelName}
            </span>
          </div>
        </div>
      </div>
    )
  },
)

SidebarProgress.displayName = 'SidebarProgress'

export default SidebarProgress
