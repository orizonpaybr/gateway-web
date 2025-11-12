'use client'

import { memo } from 'react'
import { Card } from '@/components/ui/Card'
import { formatCurrencyBRL } from '@/lib/format'
import { CheckCircle, DollarSign, TrendingUp, Clock } from 'lucide-react'

export interface StatCard {
  label: string
  value: number | string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  valueColor?: string
  isCurrency?: boolean
}

export interface FinancialStatsCardsProps {
  stats: StatCard[]
}

export const FinancialStatsCards = memo(function FinancialStatsCards({
  stats,
}: FinancialStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p
                className={`text-lg font-bold truncate ${
                  stat.valueColor || 'text-gray-900'
                }`}
              >
                {stat.isCurrency
                  ? formatCurrencyBRL(Number(stat.value))
                  : stat.value}
              </p>
            </div>
            <div className={`p-3 ${stat.iconBg} rounded-lg shrink-0`}>
              <div className={stat.iconColor}>{stat.icon}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
})

// Helpers para criar cards comuns
export const createStatCard = (
  label: string,
  value: number | string,
  icon: React.ReactNode,
  options?: {
    iconBg?: string
    iconColor?: string
    valueColor?: string
    isCurrency?: boolean
  },
): StatCard => ({
  label,
  value,
  icon,
  iconBg: options?.iconBg || 'bg-blue-100',
  iconColor: options?.iconColor || 'text-blue-600',
  valueColor: options?.valueColor,
  isCurrency: options?.isCurrency ?? false,
})

// Ícones comuns
export const StatIcons = {
  CheckCircle: (size = 24) => <CheckCircle size={size} />,
  DollarSign: (size = 24) => <DollarSign size={size} />,
  TrendingUp: (size = 24) => <TrendingUp size={size} />,
  Clock: (size = 24) => <Clock size={size} />,
}
