'use client'

import { memo, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, ArrowDownLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/contexts/AuthContext'
import { useBalanceVisibility } from '@/contexts/BalanceVisibilityContext'
import { transactionsAPI } from '@/lib/api'
import { formatCurrencyBRL, formatDateBR, formatTimeBR } from '@/lib/format'
export interface Transaction {
  id: number
  transaction_id: string
  tipo: 'deposito' | 'saque'
  amount: number
  descricao: string
  data: string
  status: string
  status_legivel: string
}
interface RecentTransactionsProps {
  onViewExtract?: () => void
}

export const RecentTransactions = memo(
  ({ onViewExtract }: RecentTransactionsProps) => {
    const router = useRouter()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Usar AuthContext para token
    const { user, authReady } = useAuth()

    const { isBalanceHidden } = useBalanceVisibility()
    const _token = user ? 'authenticated' : null

    useEffect(() => {
      const fetchTransactions = async () => {
        if (!authReady || !user) {
          setIsLoading(false)
          return
        }

        setIsLoading(true)
        try {
          const response = await transactionsAPI.list({ limit: 7, page: 1 })
          if (response.success) {
            setTransactions(response.data.data)
          }
        } catch (error) {
          console.error(
            'RecentTransactions - Erro ao buscar transações:',
            error,
          )
        } finally {
          setIsLoading(false)
        }
      }

      // Aguardar um pouco para garantir que o token está disponível
      const timer = setTimeout(() => {
        fetchTransactions()
      }, 200)

      return () => {
        clearTimeout(timer)
      }
    }, [user, authReady])

    const formatCurrency = useCallback(
      (value: number) => formatCurrencyBRL(value, { hide: isBalanceHidden }),
      [isBalanceHidden],
    )

    const formatDate = useCallback(
      (dateString: string) => formatDateBR(dateString),
      [],
    )
    const formatTime = useCallback(
      (dateString: string) => formatTimeBR(dateString),
      [],
    )

    const handleViewReceipt = useCallback(
      (transactionId: number) => {
        router.push(`/dashboard/comprovante/${transactionId}`)
      },
      [router],
    )

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Últimas Transações
          </h2>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <Skeleton className="h-6 w-32" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-5 w-20" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-4 w-40" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-10 w-24" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-8 w-8 rounded" />
                        </td>
                      </tr>
                    ))
                  : transactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                transaction.tipo === 'deposito'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {transaction.tipo === 'deposito' ? (
                                <>
                                  <ArrowDownLeft size={14} />
                                  <span>Pix Recebido</span>
                                </>
                              ) : (
                                <>
                                  <ArrowUpRight size={14} />
                                  <span>Pix enviado</span>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`text-sm font-semibold ${
                              transaction.tipo === 'deposito'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900">
                            {transaction.descricao}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {formatTime(transaction.data)}
                            </div>
                            <div className="text-gray-500">
                              {formatDate(transaction.data)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<FileText size={16} />}
                            onClick={() => handleViewReceipt(transaction.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-600"
                          />
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {transactions.length === 0 && (
            <div className="py-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                Nenhuma transação encontrada
              </p>
            </div>
          )}
        </Card>
      </div>
    )
  },
)
