'use client'

import { formatCurrencyBRL } from '@/lib/format'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { AdminTransaction } from '@/lib/api'

interface RecentTransactionsTableProps {
  transactions: AdminTransaction[]
  isLoading?: boolean
}

export function RecentTransactionsTable({
  transactions,
  isLoading,
}: RecentTransactionsTableProps) {
  const cleaned = (transactions || []).filter((t) => {
    const amount = Number(t.amount || 0)
    const fee = Number(t.taxa || 0)
    return amount > 0 || fee > 0
  })
  const getStatusBadge = (status: string) => {
    const map: Record<
      string,
      { label: string; variant: 'default' | 'success' | 'warning' | 'error' }
    > = {
      PAID_OUT: { label: 'Pago', variant: 'success' },
      COMPLETED: { label: 'Completo', variant: 'success' },
      APPROVED: { label: 'Aprovado', variant: 'success' },
      PENDING: { label: 'Pendente', variant: 'warning' },
      PROCESSING: { label: 'Processando', variant: 'default' },
      IN_REVIEW: { label: 'Em análise', variant: 'warning' },
      WAITING_FOR_APPROVAL: {
        label: 'Aguardando aprovação',
        variant: 'warning',
      },
      REJECTED: { label: 'Rejeitado', variant: 'error' },
      CANCELLED: { label: 'Cancelado', variant: 'error' },
      FAILED: { label: 'Falhou', variant: 'error' },
    }

    const key = (status || '').toUpperCase()
    const config = map[key] || {
      // fallback genérico: substitui _ por espaço e capitaliza
      label: key
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/(^|\s)\S/g, (c) => c.toUpperCase()),
      variant: 'default' as const,
    }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Transações Recentes
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!cleaned || cleaned.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Transações Recentes
        </h2>
        <p className="text-gray-500 text-center py-8">
          Nenhuma transação encontrada
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Transações Recentes
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Taxa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cleaned.map((transaction) => (
              <tr
                key={`${transaction.type}-${transaction.id}`}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {transaction.type === 'deposit' ? (
                      <>
                        <ArrowDownCircle size={20} className="text-green-600" />
                        <span className="text-sm font-medium text-gray-900">
                          Depósito
                        </span>
                      </>
                    ) : (
                      <>
                        <ArrowUpCircle size={20} className="text-red-600" />
                        <span className="text-sm font-medium text-gray-900">
                          Saque
                        </span>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.user ? (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{transaction.user.username}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrencyBRL(transaction.amount)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {formatCurrencyBRL(transaction.taxa)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(transaction.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDistanceToNow(new Date(transaction.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
