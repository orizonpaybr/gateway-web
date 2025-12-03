'use client'

import { memo } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatCurrencyBRL } from '@/lib/format'
import {
  formatTransactionDate,
  getFinancialStatusBadgeClasses,
} from '@/lib/helpers/financialUtils'
export interface FinancialTableColumn<T = Record<string, unknown>> {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
}
export interface FinancialTableProps<T extends Record<string, unknown>> {
  items: T[]
  columns: FinancialTableColumn<T>[]
  isLoading: boolean
  emptyMessage?: string
  emptyDescription?: string
  getRowKey: (item: T) => string
  getTransactionType?: (item: T) => 'deposito' | 'saque' | null
  getStatusField?: (item: T) => string
  getStatusLabelField?: (item: T) => string
}

export function FinancialTable<T extends Record<string, unknown>>(
  props: FinancialTableProps<T>,
) {
  const {
    items,
    columns,
    isLoading,
    emptyMessage = 'Nenhuma transação encontrada',
    emptyDescription = 'Não há transações para os filtros selecionados.',
    getRowKey,
    getTransactionType,
    getStatusField,
    getStatusLabelField,
  } = props
  if (isLoading) {
    return (
      <div className="overflow-x-auto -mx-2 xl:mx-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length} className="p-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-5/6" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-gray-600">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
            <TrendingUp className="text-blue-400" />
          </div>
        </div>
        <p className="font-medium">{emptyMessage}</p>
        <p className="text-sm text-gray-500 mt-1">{emptyDescription}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto -mx-2 xl:mx-0">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const tipo = getTransactionType?.(item)
            const status = getStatusField?.(item)
            const statusLabel = getStatusLabelField?.(item)

            return (
              <tr
                key={getRowKey(item)}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                {columns.map((col) => {
                  if (col.render) {
                    return (
                      <td key={col.key} className="py-3 px-3">
                        {col.render(item)}
                      </td>
                    )
                  }

                  if (col.key === 'cliente_id' && tipo) {
                    return (
                      <td key={col.key} className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {tipo === 'deposito' ? (
                            <TrendingUp className="text-green-600" size={16} />
                          ) : (
                            <TrendingDown className="text-red-600" size={16} />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {String(item[col.key] ?? '')}
                          </span>
                        </div>
                      </td>
                    )
                  }

                  if (col.key === 'status' && status && statusLabel) {
                    return (
                      <td key={col.key} className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getFinancialStatusBadgeClasses(
                            status,
                          )}`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                    )
                  }

                  if (
                    col.key.includes('valor') ||
                    col.key.includes('taxa') ||
                    col.key.includes('saldo')
                  ) {
                    return (
                      <td key={col.key} className="py-3 px-3">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrencyBRL(Number(item[col.key] || 0))}
                        </div>
                      </td>
                    )
                  }

                  if (col.key.includes('data') || col.key.includes('date')) {
                    return (
                      <td
                        key={col.key}
                        className="py-3 px-3 text-sm text-gray-600"
                      >
                        {formatTransactionDate(String(item[col.key] ?? ''))}
                      </td>
                    )
                  }

                  return (
                    <td
                      key={col.key}
                      className="py-3 px-3 text-sm text-gray-600"
                    >
                      {String(item[col.key] ?? '')}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export const MemoizedFinancialTable = memo(
  FinancialTable,
) as typeof FinancialTable
