'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PlusCircle, Copy, QrCode, Trash2 } from 'lucide-react'

export default function PixChavePage() {
  const chavesPix = [
    {
      id: '1',
      tipo: 'CPF',
      valor: '123.456.789-00',
      status: 'Ativa',
      dataCriacao: '01/01/2024',
    },
    {
      id: '2',
      tipo: 'Email',
      valor: 'meuemail@example.com',
      status: 'Ativa',
      dataCriacao: '05/03/2024',
    },
    {
      id: '3',
      tipo: 'Telefone',
      valor: '+55 (11) 98765-4321',
      status: 'Ativa',
      dataCriacao: '10/06/2024',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Com Chave</h1>
          <p className="text-gray-600 text-sm mt-1">
            Gerencie suas chaves Pix cadastradas
          </p>
        </div>
        <Button icon={<PlusCircle size={18} />}>Nova Chave</Button>
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
                  Valor
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Data de Criação
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {chavesPix.map((chave) => (
                <tr
                  key={chave.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-gray-900">
                      {chave.tipo}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{chave.valor}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                      {chave.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {chave.dataCriacao}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Copy size={16} />}
                        title="Copiar Chave"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<QrCode size={16} />}
                        title="Gerar QR Code"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 size={16} />}
                        title="Excluir Chave"
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
