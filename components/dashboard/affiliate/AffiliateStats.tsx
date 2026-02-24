'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAffiliateStats } from '@/hooks/useAffiliateQuery'
import { TrendingUp, Users, DollarSign } from 'lucide-react'

export function AffiliateStats() {
  const { data: stats, isLoading } = useAffiliateStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-20" />
              </div>
              <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const statsData = [
    {
      title: 'Saldo de Afiliados',
      value: formatCurrency(stats.current_balance),
      icon: DollarSign,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      badge: null,
    },
    {
      title: 'Total de Indicados',
      value: stats.total_referrals.toString(),
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      badge: stats.total_referrals > 0 ? 'Ativo' : null,
    },
    {
      title: 'Ganhos do Mês',
      value: formatCurrency(stats.monthly_earned),
      icon: TrendingUp,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      badge: null,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statsData.map((stat, index) => (
        <Card key={index} hover className="relative">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm text-gray-600 font-medium">
                  {stat.title}
                </p>
                {stat.badge && (
                  <Badge
                    variant={
                      stat.badge === 'Ativo'
                        ? 'success'
                        : stat.badge === 'Pendente'
                          ? 'warning'
                          : 'default'
                    }
                  >
                    {stat.badge}
                  </Badge>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div
              className={`p-3 rounded-lg ${stat.iconBg} flex items-center justify-center`}
            >
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
