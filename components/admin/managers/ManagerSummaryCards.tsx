'use client'

import React, { memo } from 'react'
import { Users, UserCheck, UserX } from 'lucide-react'

interface ManagerSummaryCardsProps {
  totalManagers: number
  activeManagers: number
  inactiveManagers: number
  isLoading: boolean
}

export const ManagerSummaryCards = memo(function ManagerSummaryCards({
  totalManagers,
  activeManagers,
  inactiveManagers,
  isLoading,
}: ManagerSummaryCardsProps) {
  const cards = [
    {
      title: 'Total de Gerentes',
      value: totalManagers,
      icon: Users,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Gerentes Ativos',
      value: activeManagers,
      icon: UserCheck,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      iconColor: 'text-green-500',
    },
    {
      title: 'Gerentes Inativos',
      value: inactiveManagers,
      icon: UserX,
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      iconColor: 'text-red-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.title}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>
                {isLoading ? (
                  <div className="mt-2 h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className={`text-3xl font-bold mt-2 ${card.textColor}`}>
                    {card.value}
                  </p>
                )}
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <Icon className={card.iconColor} size={24} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
})
