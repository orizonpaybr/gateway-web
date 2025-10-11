'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowUpRight, Filter, Download } from 'lucide-react'

export default function SaquesPage() {
  const saques = [
    {
      id: '1',
      descricao: 'Saque via PIX',
      valor: 500.0,
      data: '07/10/2025',
      status: 'concluído',
    },
    {
      id: '2',
      descricao: 'Saque para conta bancária',
      valor: 1200.0,
      data: '06/10/2025',
      status: 'concluído',
    },
    {
      id: '3',
      descricao: 'Saque via TED',
      valor: 800.0,
      data: '05/10/2025',
      status: 'pendente',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saques</h1>
          <p className="text-gray-600 text-sm mt-1">
            Histórico de todos os saques realizados
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
              {saques.map((saque) => (
                <tr
                  key={saque.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-100 text-red-600">
                        <ArrowUpRight size={16} />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {saque.descricao}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {saque.data}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-semibold text-red-600">
                      -
                      {saque.valor.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        saque.status === 'concluído'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {saque.status}
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
