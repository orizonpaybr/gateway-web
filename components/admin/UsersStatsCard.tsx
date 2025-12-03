'use client'

import { Users, UserCheck, UserX } from 'lucide-react'

import { Card } from '@/components/ui/Card'

interface UsersStatsCardProps {
  cadastrados: number
  aprovados: number
  pendentes: number
  isLoading?: boolean
}

export function UsersStatsCard({
  cadastrados,
  aprovados,
  pendentes,
  isLoading,
}: UsersStatsCardProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Estatísticas de Usuários
        </h3>
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="h-4 bg-gray-200 rounded w-32" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-12" />
            </div>
          ))}
        </div>
      </Card>
    )
  }

  const stats = [
    {
      icon: Users,
      label: 'Total Cadastrados',
      value: cadastrados,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: UserCheck,
      label: 'Aprovados',
      value: aprovados,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: UserX,
      label: 'Pendentes',
      value: pendentes,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ]

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Estatísticas de Usuários
      </h3>
      <div className="space-y-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon size={20} className={stat.color} />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {stat.label}
                </span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                {stat.value.toLocaleString('pt-BR')}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
