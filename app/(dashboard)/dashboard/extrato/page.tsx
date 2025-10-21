'use client'

import { useState, useMemo, memo, useCallback } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Download, Filter, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

const ExtratoPage = memo(function ExtratoPage() {
  const [filterType, setFilterType] = useState<'all' | 'entrada' | 'saida'>(
    'all',
  )
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const transactions = [
    {
      id: '1',
      description: 'Recebimento - Cliente ABC',
      value: 2500.0,
      date: '07/10/2025 14:35',
      type: 'entrada',
      status: 'concluída',
      endToEndId: 'E1234567820251007143522',
    },
    {
      id: '2',
      description: 'Saque bancário',
      value: -1200.0,
      date: '06/10/2025 10:22',
      type: 'saida',
      status: 'concluída',
      endToEndId: 'E1234567820251006102245',
    },
    {
      id: '3',
      description: 'Recebimento - Cliente XYZ',
      value: 5800.0,
      date: '06/10/2025 09:15',
      type: 'entrada',
      status: 'concluída',
      endToEndId: 'E1234567820251006091532',
    },
    {
      id: '4',
      description: 'Transferência Pix - Fornecedor',
      value: -350.0,
      date: '05/10/2025 16:45',
      type: 'saida',
      status: 'concluída',
      endToEndId: 'E1234567820251005164512',
    },
    {
      id: '5',
      description: 'Recebimento - Pagamento Serviço',
      value: 1450.0,
      date: '05/10/2025 11:30',
      type: 'entrada',
      status: 'concluída',
      endToEndId: 'E1234567820251005113045',
    },
    {
      id: '6',
      description: 'Taxa de serviço',
      value: -25.0,
      date: '04/10/2025 08:00',
      type: 'saida',
      status: 'concluída',
      endToEndId: 'E1234567820251004080012',
    },
    {
      id: '7',
      description: 'Recebimento - Cliente DEF',
      value: 3200.0,
      date: '03/10/2025 15:20',
      type: 'entrada',
      status: 'concluída',
      endToEndId: 'E1234567820251003152034',
    },
    {
      id: '8',
      description: 'Saque para conta corrente',
      value: -2000.0,
      date: '02/10/2025 14:10',
      type: 'saida',
      status: 'concluída',
      endToEndId: 'E1234567820251002141045',
    },
  ]

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const typeMatch = filterType === 'all' || transaction.type === filterType

      const searchMatch =
        debouncedSearchTerm === '' ||
        transaction.description
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        transaction.endToEndId
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase())

      return typeMatch && searchMatch
    })
  }, [transactions, filterType, debouncedSearchTerm])

  // Memorizar cálculos de totais
  const { totalEntradas, totalSaidas, saldo } = useMemo(() => {
    const entradas = transactions
      .filter((t) => t.type === 'entrada')
      .reduce((acc, t) => acc + t.value, 0)

    const saidas = transactions
      .filter((t) => t.type === 'saida')
      .reduce((acc, t) => acc + Math.abs(t.value), 0)

    return {
      totalEntradas: entradas,
      totalSaidas: saidas,
      saldo: entradas - saidas,
    }
  }, [transactions])

  // Memorizar função de exportação
  const handleExport = useCallback(() => {
    console.log('Exportando extrato...')
    alert(
      'Funcionalidade de exportação será implementada com a integração da API',
    )
  }, [])

  // Memorizar função de formatação de moeda
  const formatCurrency = useCallback((value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Extrato</h1>
          <p className="text-gray-600 text-sm mt-1">
            Visualize e exporte seu histórico de transações
          </p>
        </div>
        <Button icon={<Download size={18} />} onClick={handleExport}>
          Exportar Extrato
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Total em Entradas</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalEntradas)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <ArrowDownLeft size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Total em Saídas</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalSaidas)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-100 text-red-600">
              <ArrowUpRight size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Saldo do Período</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(saldo)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Filter size={24} />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por descrição ou EndToEndID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              Todas
            </Button>
            <Button
              variant={filterType === 'entrada' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterType('entrada')}
            >
              Entradas
            </Button>
            <Button
              variant={filterType === 'saida' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterType('saida')}
            >
              Saídas
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Data/Hora
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Descrição
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  EndToEndID
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Tipo
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Nenhuma transação encontrada
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {transaction.date}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            transaction.type === 'entrada'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {transaction.type === 'entrada' ? (
                            <ArrowDownLeft size={16} />
                          ) : (
                            <ArrowUpRight size={16} />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono text-gray-600">
                        {transaction.endToEndId}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.type === 'entrada'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {transaction.type === 'entrada' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`text-sm font-semibold ${
                          transaction.value > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.value > 0 ? '+' : ''}
                        {formatCurrency(transaction.value)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Exibindo {filteredTransactions.length} de {transactions.length}{' '}
              transações
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Anterior
              </Button>
              <Button variant="outline" size="sm">
                Próximo
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
})

export default ExtratoPage
