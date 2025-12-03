'use client'

import { memo } from 'react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatCurrencyBRL } from '@/lib/format'
import type { LucideIcon } from 'lucide-react'
interface WithdrawalStatsCardProps {
  title: string
  value: number | string
  isLoading?: boolean
  icon: LucideIcon
  iconBgColor: string
  valueColor?: string
  isCurrency?: boolean
}

export const WithdrawalStatsCard = memo(
  ({
    title,
    value,
    isLoading = false,
    icon: Icon,
    iconBgColor,
    valueColor = 'text-red-600',
    isCurrency = false,
  }: WithdrawalStatsCardProps) => {
    return (
      <Card className="p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-600 mb-2">{title}</p>
            {isLoading ? (
              <Skeleton className={isCurrency ? 'h-7 w-28' : 'h-8 w-24'} />
            ) : (
              <p
                className={`${
                  isCurrency
                    ? 'text-xl sm:text-2xl lg:text-3xl'
                    : 'text-2xl sm:text-3xl lg:text-4xl'
                } font-bold ${valueColor} leading-tight break-words`}
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
