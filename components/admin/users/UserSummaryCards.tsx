import React, { memo } from 'react'
import { Users, Clock, Ban, UserPlus } from 'lucide-react'
interface UserSummaryCardsProps {
  totalRegistrations: number
  monthRegistrations: number
  pendingRegistrations: number
  bannedUsers: number
  isLoading?: boolean
}

export const UserSummaryCards = memo(
  ({
    totalRegistrations,
    monthRegistrations,
    pendingRegistrations,
    bannedUsers,
    isLoading = false,
  }: UserSummaryCardsProps) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
            >
              <div className="h-8 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Cadastros totais</p>
              <p className="text-2xl font-bold text-green-600">
                {totalRegistrations}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Cadastros Mês</p>
              <p className="text-2xl font-bold text-blue-600">
                {monthRegistrations}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <UserPlus className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Cadastros Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingRegistrations}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Bloqueados / Inativos</p>
              <p className="text-2xl font-bold text-red-600">{bannedUsers}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Ban className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>
    )
  },
)
