'use client'

import React, { memo } from 'react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

interface GamificationCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  progress?: number
  isLoading?: boolean
  className?: string
}

export const GamificationCard = memo<GamificationCardProps>(
  ({ title, value, icon, progress, isLoading = false, className }) => {
    if (isLoading) {
      return (
        <Card className={cn('p-6', className)}>
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-8 w-32 mb-2" />
          {progress !== undefined && (
            <Skeleton className="h-2 w-full rounded-full" />
          )}
        </Card>
      )
    }

    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>

        <div className="text-2xl font-bold text-gray-900 mb-2">{value}</div>

        {progress !== undefined && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </Card>
    )
  },
)

GamificationCard.displayName = 'GamificationCard'
