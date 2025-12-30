'use client'

import React, { memo, useMemo } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatCurrency } from '@/lib/currency'
import type { SidebarProgressProps } from '@/lib/types/gamification'
import { cn } from '@/lib/utils'

export const SidebarProgress = memo<SidebarProgressProps>(
  ({
    currentLevel,
    totalDeposited,
    currentLevelMin,
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
          formattedMin: 'R$ 0,00',
          formattedTarget: 'R$ 100.000,00',
          formattedRemaining: 'R$ 100.000,00',
        }
      }

      const min = currentLevelMin ?? 0
      const max = currentLevelMax

      // Progresso dentro do nível atual (de min até max)
      const range = Math.max(max - min, 1)
      const effectiveDeposited = Math.max(totalDeposited - min, 0)
      const progress = Math.min(100, (effectiveDeposited / range) * 100)

      // Quanto falta para atingir o MÁXIMO do nível ATUAL
      // (que é o mesmo que atingir o mínimo do próximo nível)
      const remainingAmount = Math.max(0, max - totalDeposited)

      // Nome do próximo nível (se houver)
      const nextLevelName = nextLevelData?.name || 'Próximo Nível'

      return {
        progress,
        remainingAmount,
        nextLevelName,
        formattedMin: formatCurrency(min),
        formattedTarget: formatCurrency(max),
        formattedRemaining: formatCurrency(remainingAmount),
      }
    }, [
      currentLevel,
      totalDeposited,
      currentLevelMin,
      currentLevelMax,
      nextLevelData,
    ])

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

    const getLevelColor = (level: string | null) => {
      const normalizedLevel = level?.trim().toLowerCase() || 'bronze'

      switch (true) {
        case normalizedLevel.includes('bronze'):
          return 'bg-amber-800'
        case normalizedLevel.includes('prata'):
          return 'bg-slate-400'
        case normalizedLevel.includes('ouro'):
          return 'bg-yellow-500'
        case normalizedLevel.includes('safira'):
          return 'bg-blue-500'
        case normalizedLevel.includes('diamante'):
          return 'bg-purple-600'
        default:
          return 'bg-amber-800'
      }
    }

    const levelColorClass = getLevelColor(currentLevel)

    return (
      <div className="bg-white rounded-lg p-5 space-y-3 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('w-3 h-3 rounded-full', levelColorClass)} />
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
                levelColorClass,
              )}
              style={{ width: `${progressData.progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs text-gray-600">
            <span>{progressData.formattedMin}</span>
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
