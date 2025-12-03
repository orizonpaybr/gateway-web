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
      <Card className="p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">{title}</p>
            {isLoading ? (
              <Skeleton className={isCurrency ? 'h-8 w-32' : 'h-9 w-20'} />
            ) : (
              <p
                className={`${
                  isCurrency ? 'text-2xl' : 'text-3xl'
                } font-bold ${valueColor}`}
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
