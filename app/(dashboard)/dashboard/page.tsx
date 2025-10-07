'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  DollarSign,
  Send,
  Search,
  FileText,
} from 'lucide-react'

export default function DashboardPage() {
  const stats = [
    {
      title: 'Saldo Disponível',
      value: 'R$ 25.430,00',
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Entradas do Mês',
      value: 'R$ 45.200,00',
      icon: ArrowDownLeft,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Saídas do Mês',
      value: 'R$ 19.770,00',
      icon: ArrowUpRight,
      color: 'bg-red-100 text-red-600',
    },
    {
      title: 'Splits do Mês',
      value: 'R$ 3.200,00',
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
    },
  ]

  const quickActions = [
    { icon: Send, label: 'Fazer Pix', href: '/dashboard/pix' },
    { icon: Search, label: 'Buscar Transação', href: '/dashboard/buscar' },
    { icon: FileText, label: 'Ver Extrato', href: '/dashboard/extrato' },
  ]

  const recentTransactions = [
    {
      id: '1',
      description: 'Recebimento - Cliente ABC',
      value: 2500.0,
      date: '07/10/2025',
      type: 'entrada',
      status: 'concluída',
    },
    {
      id: '2',
      description: 'Saque bancário',
      value: -1200.0,
      date: '06/10/2025',
      type: 'saida',
      status: 'concluída',
    },
    {
      id: '3',
      description: 'Recebimento - Cliente XYZ',
      value: 5800.0,
      date: '06/10/2025',
      type: 'entrada',
      status: 'concluída',
    },
    {
      id: '4',
      description: 'Transferência Pix',
      value: -350.0,
      date: '05/10/2025',
      type: 'saida',
      status: 'concluída',
    },
    {
      id: '5',
      description: 'Recebimento - Pagamento',
      value: 1450.0,
      date: '05/10/2025',
      type: 'entrada',
      status: 'pendente',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 text-sm mt-1">
          Visão geral das suas movimentações financeiras
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.label}
                variant="outline"
                className="justify-start h-auto py-4"
                icon={<Icon size={20} />}
              >
                {action.label}
              </Button>
            )
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Movimentação do Mês
          </h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-sm">
              Gráfico de movimentação (integrar com recharts)
            </p>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Distribuição por Tipo
          </h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-sm">
              Gráfico de distribuição (integrar com recharts)
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Transações Recentes
          </h2>
          <Button variant="ghost" size="sm">
            Ver todas
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Descrição
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Data
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Valor
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
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
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {transaction.date}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-sm font-semibold ${
                        transaction.value > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.value > 0 ? '+' : ''}
                      {transaction.value.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        transaction.status === 'concluída'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
