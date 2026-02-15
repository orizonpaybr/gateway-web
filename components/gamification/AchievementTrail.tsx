'use client'

import React, { memo, useMemo } from 'react'
import Image from 'next/image'
import { CheckCircle, Lock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
interface AchievementLevel {
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
}
interface AchievementTrailProps {
  levels: AchievementLevel[]
  isLoading?: boolean
}

export const AchievementTrail = memo<AchievementTrailProps>(
  ({ levels, isLoading = false }) => {
    const sortedLevels = useMemo(
      () => levels.sort((a, b) => a.minimo - b.minimo),
      [levels],
    )

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'Concluído':
          return <CheckCircle className="w-4 h-4 text-green-500" />
        case 'Bloqueado':
          return <Lock className="w-4 h-4 text-gray-400" />
        default:
          return null
      }
    }

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'Concluído':
          return 'text-green-500'
        case 'Em progresso':
          return 'text-orange-500'
        case 'Bloqueado':
          return 'text-gray-400'
        default:
          return 'text-gray-400'
      }
    }

    if (isLoading) {
      return (
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">
            Trilha de Conquistas
          </h2>
          <div className="hidden sm:block">
            <div className="grid grid-cols-5 gap-4 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-center">
                  <Skeleton className="w-12 h-12 rounded-full" />
                </div>
              ))}
            </div>
            <Skeleton className="w-full h-2 rounded-full mb-6" />
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-4 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto mb-2" />
                  <Skeleton className="h-2 w-full rounded-full mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
              ))}
            </div>
          </div>
          <div className="sm:hidden space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-3">
                <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-3 w-24 mb-2" />
                  <Skeleton className="h-1.5 w-full rounded-full mb-1.5" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )
    }

    return (
      <Card className="p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">
          Trilha de Conquistas
        </h2>

        <div className="hidden sm:block">
          <div className="grid grid-cols-5 gap-2 sm:gap-4 mb-4">
            {sortedLevels.map((level) => (
              <div key={level.id} className="flex justify-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
                  <Image
                    src="/LOGO-ORIZON.png"
                    alt={`Logo ${level.name}`}
                    width={48}
                    height={48}
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6" />
          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            {sortedLevels.map((level) => (
              <div key={level.id} className="text-center min-w-0">
                <h3 className="font-medium text-gray-900 mb-1 truncate text-sm sm:text-base">
                  {level.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 truncate">
                  {level.amount}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all duration-300',
                      {
                        'bg-green-500': level.status === 'Concluído',
                        'bg-orange-500': level.status === 'Em progresso',
                        'bg-gray-400': level.status === 'Bloqueado',
                      },
                    )}
                    style={{ width: `${level.progress}%` }}
                  />
                </div>
                <div
                  className={cn(
                    'flex items-center justify-center gap-1 text-xs sm:text-sm',
                    getStatusColor(level.status),
                  )}
                >
                  {getStatusIcon(level.status)}
                  <span>{level.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sm:hidden space-y-4">
          {sortedLevels.map((level) => (
            <div
              key={level.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/80 border border-gray-100"
            >
              <div className="w-10 h-10 flex items-center justify-center shrink-0">
                <Image
                  src="/LOGO-ORIZON.png"
                  alt={level.name}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-medium text-gray-900 text-sm">
                    {level.name}
                  </h3>
                  <p className="text-sm text-gray-600 shrink-0 tabular-nums">
                    {level.amount}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 mb-1.5">
                  <div
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      {
                        'bg-green-500': level.status === 'Concluído',
                        'bg-orange-500': level.status === 'Em progresso',
                        'bg-gray-400': level.status === 'Bloqueado',
                      },
                    )}
                    style={{ width: `${level.progress}%` }}
                  />
                </div>
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs',
                    getStatusColor(level.status),
                  )}
                >
                  {getStatusIcon(level.status)}
                  <span>{level.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  },
)

AchievementTrail.displayName = 'AchievementTrail'

export default AchievementTrail
