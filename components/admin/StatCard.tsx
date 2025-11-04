'use client'

import { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { formatCurrencyBRL } from '@/lib/format'

interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow'
  formatAsNumber?: boolean
  formatAsCurrency?: boolean
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  colorScheme = 'blue',
  formatAsNumber = false,
  formatAsCurrency = false,
}: StatCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      text: 'text-blue-900',
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      text: 'text-green-900',
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      text: 'text-purple-900',
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      text: 'text-orange-900',
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      text: 'text-red-900',
    },
    yellow: {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-600',
      text: 'text-yellow-900',
    },
  }

  const colors = colorClasses[colorScheme]

  const formatValue = () => {
    if (formatAsCurrency && typeof value === 'number') {
      return formatCurrencyBRL(value)
    }
    if (formatAsNumber && typeof value === 'number') {
      return value.toLocaleString('pt-BR')
    }
    return value
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className={`text-3xl font-bold text-gray-900 mb-1`}>
            {formatValue()}
          </p>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500">vs período anterior</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors.bg}`}>
          <Icon size={24} className={colors.icon} />
        </div>
      </div>
    </Card>
  )
}
