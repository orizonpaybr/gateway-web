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
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-6">Trilha de Conquistas</h2>

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
        </Card>
      )
    }

    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-6">Trilha de Conquistas</h2>

        <div className="grid grid-cols-5 gap-4 mb-4">
          {sortedLevels.map((level) => (
            <div key={level.id} className="flex justify-center">
              <div className="w-12 h-12 flex items-center justify-center">
                <Image
                  src="/LOGO-ORIZON.png"
                  alt={`Logo ${level.name}`}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div className="bg-gradient-to-r from-orange-500 via-yellow-500 to-blue-500 h-2 rounded-full" />
        </div>

        <div className="grid grid-cols-5 gap-4">
          {sortedLevels.map((level) => (
            <div key={level.id} className="text-center">
              <h3 className="font-medium text-gray-900 mb-1">{level.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{level.amount}</p>

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
                  'flex items-center justify-center gap-1 text-sm',
                  getStatusColor(level.status),
                )}
              >
                {getStatusIcon(level.status)}
                <span>{level.status}</span>
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
