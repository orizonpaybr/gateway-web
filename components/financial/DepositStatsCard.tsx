'use client'

import { memo } from 'react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatCurrencyBRL } from '@/lib/format'
import type { LucideIcon } from 'lucide-react'
interface DepositStatsCardProps {
  title: string
  value: number | string
  isLoading?: boolean
  icon: LucideIcon
  iconBgColor: string
  valueColor?: string
  isCurrency?: boolean
}

export const DepositStatsCard = memo(
  ({
    title,
    value,
    isLoading = false,
    icon: Icon,
    iconBgColor,
    valueColor = 'text-green-600',
    isCurrency = false,
  }: DepositStatsCardProps) => {
    return (
      <Card className="p-4 sm:p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow min-w-0">
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-600 mb-2 truncate">{title}</p>
            {isLoading ? (
              <Skeleton className={isCurrency ? 'h-8 w-32' : 'h-9 w-20'} />
            ) : (
              <p
                className={`${
                  isCurrency ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
                } font-bold ${valueColor} break-words overflow-hidden`}
              >
                {isCurrency ? formatCurrencyBRL(Number(value)) : value}
              </p>
            )}
          </div>
          <div
            className={`w-14 h-14 rounded-full ${iconBgColor} flex items-center justify-center flex-shrink-0`}
          >
            <Icon className="text-white" size={28} />
          </div>
        </div>
      </Card>
    )
  },
)
