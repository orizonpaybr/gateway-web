'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowUpRight, ArrowDownLeft, FileText, List } from 'lucide-react'
import { useRouter } from 'next/navigation'

export interface Transaction {
  id: string
  type: 'deposito' | 'saque'
  valor: number
  descricao: string
  data: string
  hora: string
}

interface RecentTransactionsProps {
  transactions?: Transaction[]
  onViewExtract?: () => void
}

const defaultTransactions: Transaction[] = [
  {
    id: '1',
    type: 'saque',
    valor: 29.0,
    descricao: 'Pagamento Enviado',
    data: '31/08/2025',
    hora: '15:16',
  },
  {
    id: '2',
    type: 'deposito',
    valor: 17.0,
    descricao: 'Pagamento Recebido',
    data: '30/08/2025',
    hora: '05:42',
  },
  {
    id: '3',
    type: 'deposito',
    valor: 17.0,
    descricao: 'Pagamento Recebido',
    data: '28/08/2025',
    hora: '07:22',
  },
  {
    id: '4',
    type: 'saque',
    valor: 38.0,
    descricao: 'Pagamento Enviado',
    data: '27/08/2025',
    hora: '20:36',
  },
  {
    id: '5',
    type: 'deposito',
    valor: 17.0,
    descricao: 'Pagamento Recebido',
    data: '27/08/2025',
    hora: '17:59',
  },
  {
    id: '6',
    type: 'saque',
    valor: 15.0,
    descricao: 'Pagamento Enviado',
    data: '27/08/2025',
    hora: '04:00',
  },
  {
    id: '7',
    type: 'deposito',
    valor: 25.5,
    descricao: 'Pagamento Recebido',
    data: '27/08/2025',
    hora: '01:22',
  },
]

export function RecentTransactions({
  transactions = defaultTransactions,
  onViewExtract,
}: RecentTransactionsProps) {
  const router = useRouter()

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  const handleViewReceipt = (transactionId: string) => {
    router.push(`/dashboard/comprovante/${transactionId}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Últimas Transações</h2>
        <Button
          variant="outline"
          size="sm"
          icon={<List size={16} />}
          onClick={onViewExtract}
        >
          Ver Extrato
        </Button>
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
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'deposito'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {transaction.type === 'deposito' ? (
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
                        transaction.type === 'deposito'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(transaction.valor)}
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
                        {transaction.hora}
                      </div>
                      <div className="text-gray-500">{transaction.data}</div>
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
            <List className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              Nenhuma transação encontrada
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
