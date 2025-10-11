'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowDownLeft, Filter, Download } from 'lucide-react'

export default function DepositosPage() {
  const depositos = [
    {
      id: '1',
      descricao: 'Depósito via PIX',
      valor: 2500.0,
      data: '07/10/2025',
      status: 'concluído',
    },
    {
      id: '2',
      descricao: 'Transferência bancária',
      valor: 1200.0,
      data: '06/10/2025',
      status: 'concluído',
    },
    {
      id: '3',
      descricao: 'Depósito via TED',
      valor: 5800.0,
      data: '06/10/2025',
      status: 'concluído',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Depósitos</h1>
          <p className="text-gray-600 text-sm mt-1">
            Histórico de todos os depósitos realizados
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={<Filter size={18} />}>
            Filtros
          </Button>
          <Button variant="outline" icon={<Download size={18} />}>
            Exportar
          </Button>
        </div>
      </div>

      <Card>
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
              {depositos.map((deposito) => (
                <tr
                  key={deposito.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 text-green-600">
                        <ArrowDownLeft size={16} />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {deposito.descricao}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {deposito.data}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-semibold text-green-600">
                      +
                      {deposito.valor.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                      {deposito.status}
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
