'use client'

import { memo } from 'react'
interface WithdrawalStatusBadgeProps {
  status: string
  statusLegivel: string
}

export const WithdrawalStatusBadge = memo(
  ({ status, statusLegivel }: WithdrawalStatusBadgeProps) => {
    const getStatusStyles = (status: string): string => {
      const statusLower = status.toLowerCase()
      if (statusLower.includes('paid') || statusLower.includes('complete')) {
        return 'bg-green-100 text-green-800 border-green-200'
      }
      if (
        statusLower.includes('pending') ||
        statusLower.includes('aguardando')
      ) {
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      }
      if (statusLower.includes('cancel') || statusLower.includes('reject')) {
        return 'bg-red-100 text-red-800 border-red-200'
      }
      return 'bg-gray-100 text-gray-800 border-gray-200'
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusStyles(
          status,
        )}`}
      >
        {statusLegivel}
      </span>
    )
  },
)
