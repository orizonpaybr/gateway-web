'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PlusCircle, Download, Eye, Trash2, QrCode } from 'lucide-react'

export default function QrCodesListagemPage() {
  const qrCodes = [
    {
      id: '1',
      nome: 'QR Code Loja ABC',
      valor: 50.0,
      dataCriacao: '15/09/2024',
      status: 'Ativo',
      tipo: 'Cobrança',
      descricao: 'QR Code para pagamentos da loja ABC',
    },
    {
      id: '2',
      nome: 'QR Code Evento XYZ',
      valor: 25.0,
      dataCriacao: '10/09/2024',
      status: 'Ativo',
      tipo: 'Doação',
      descricao: 'QR Code para doações do evento XYZ',
    },
    {
      id: '3',
      nome: 'QR Code Freelance',
      valor: 150.0,
      dataCriacao: '05/09/2024',
      status: 'Inativo',
      tipo: 'Cobrança',
      descricao: 'QR Code para pagamentos de freelance',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Listagem</h1>
          <p className="text-gray-600 text-sm mt-1">
            Gerencie todos os seus QR Codes criados
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={<Download size={18} />}>
            Exportar
          </Button>
          <Button icon={<PlusCircle size={18} />}>Novo QR Code</Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  QR Code
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Nome
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Valor
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Tipo
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Data Criação
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {qrCodes.map((qrCode) => (
                <tr
                  key={qrCode.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        <QrCode size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {qrCode.nome}
                        </p>
                        <p className="text-xs text-gray-500">
                          {qrCode.descricao}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-900">{qrCode.nome}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-semibold text-green-600">
                      R$ {qrCode.valor.toFixed(2).replace('.', ',')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                      {qrCode.tipo}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        qrCode.status === 'Ativo'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {qrCode.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {qrCode.dataCriacao}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye size={16} />}
                        title="Visualizar QR Code"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Download size={16} />}
                        title="Baixar QR Code"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 size={16} />}
                        title="Excluir QR Code"
                      />
                    </div>
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
