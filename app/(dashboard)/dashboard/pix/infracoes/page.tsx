'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AlertCircle, Filter, Eye } from 'lucide-react'

export default function PixInfracoesPage() {
  const infracoes = [
    {
      id: '1',
      tipo: 'Tentativa de Fraude',
      data: '01/09/2024',
      status: 'Em Análise',
      descricao: 'Tentativa de golpe via QR Code falso.',
    },
    {
      id: '2',
      tipo: 'Uso Indevido de Chave',
      data: '15/08/2024',
      status: 'Resolvida',
      descricao: 'Chave Pix utilizada em transação não autorizada.',
    },
    {
      id: '3',
      tipo: 'Disputa de Transação',
      data: '20/07/2024',
      status: 'Pendente',
      descricao: 'Transação contestada pelo recebedor.',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Infrações</h1>
          <p className="text-gray-600 text-sm mt-1">
            Visualize e gerencie infrações relacionadas às suas operações Pix
          </p>
        </div>
        <Button variant="outline" icon={<Filter size={18} />}>
          Filtrar
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Tipo
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Data
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Descrição
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {infracoes.map((infracao) => (
                <tr
                  key={infracao.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} className="text-red-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {infracao.tipo}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {infracao.data}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        infracao.status === 'Resolvida'
                          ? 'bg-green-100 text-green-700'
                          : infracao.status === 'Em Análise'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {infracao.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {infracao.descricao}
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Eye size={16} />}
                      title="Ver Detalhes"
                    />
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
