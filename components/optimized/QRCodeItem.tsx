'use client'

import React, { memo } from 'react'
import { Eye, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrencyBRL, formatDateBR } from '@/lib/format'
interface QRCodeItemProps {
  qrCode: {
    id: number
    nome: string
    descricao: string
    valor: number
    tipo: 'cobranca' | 'doacao'
    status: 'ativo' | 'inativo' | 'expirado'
    data_criacao: string
    expires_at: string
    transaction_id: string
  }
  onView: (id: string) => void
  onDownload: (id: string) => void
  onDelete: (id: string) => void
}

const QRCodeItem = memo(
  ({ qrCode, onView, onDownload, onDelete }: QRCodeItemProps) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'ativo':
          return 'bg-green-100 text-green-800'
        case 'inativo':
          return 'bg-red-100 text-red-800'
        case 'expirado':
          return 'bg-yellow-100 text-yellow-800'
        default:
          return 'bg-gray-100 text-gray-700'
      }
    }

    return (
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
              <span className="text-blue-600 font-medium text-xs">QR</span>
            </div>
            <div>
              <div className="font-medium text-gray-900">{qrCode.nome}</div>
              <div className="text-sm text-gray-500">
                {qrCode.transaction_id}
              </div>
            </div>
          </div>
        </td>
        <td className="py-3 px-4">
          <div className="text-sm text-gray-900">{qrCode.descricao}</div>
        </td>
        <td className="py-3 px-4">
          <div className="font-medium text-gray-900">
            {formatCurrencyBRL(qrCode.valor)}
          </div>
        </td>
        <td className="py-3 px-4">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              qrCode.status,
            )}`}
          >
            {qrCode.status}
          </span>
        </td>
        <td className="py-3 px-4">
          <div className="text-sm text-gray-900">
            {formatDateBR(qrCode.data_criacao)}
          </div>
        </td>
        <td className="py-3 px-4">
          <div className="text-sm text-gray-900">
            {formatDateBR(qrCode.expires_at)}
          </div>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              icon={<Eye size={16} />}
              title="Visualizar"
              onClick={() => onView(qrCode.id.toString())}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={<Download size={16} />}
              title="Baixar"
              onClick={() => onDownload(qrCode.id.toString())}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 size={16} />}
              title="Excluir"
              onClick={() => onDelete(qrCode.id.toString())}
            />
          </div>
        </td>
      </tr>
    )
  },
)

QRCodeItem.displayName = 'QRCodeItem'

export default QRCodeItem
