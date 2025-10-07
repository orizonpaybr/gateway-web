'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { QrCode, Search, CheckCircle, Clock, XCircle } from 'lucide-react'

export default function QRCodesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'paid' | 'expired'
  >('all')

  const qrCodes = [
    {
      id: '1',
      reference: 'REF-2025-001',
      value: 250.0,
      status: 'paid',
      createdAt: '07/10/2025 10:30',
      paidAt: '07/10/2025 11:15',
    },
    {
      id: '2',
      reference: 'REF-2025-002',
      value: 1500.0,
      status: 'pending',
      createdAt: '07/10/2025 09:20',
      paidAt: null,
    },
    {
      id: '3',
      reference: 'REF-2025-003',
      value: 780.0,
      status: 'paid',
      createdAt: '06/10/2025 16:45',
      paidAt: '06/10/2025 17:00',
    },
    {
      id: '4',
      reference: 'REF-2025-004',
      value: 320.0,
      status: 'expired',
      createdAt: '05/10/2025 14:20',
      paidAt: null,
    },
    {
      id: '5',
      reference: 'REF-2025-005',
      value: 4200.0,
      status: 'pending',
      createdAt: '05/10/2025 11:10',
      paidAt: null,
    },
    {
      id: '6',
      reference: 'REF-2025-006',
      value: 650.0,
      status: 'paid',
      createdAt: '04/10/2025 13:30',
      paidAt: '04/10/2025 13:35',
    },
  ]

  const filteredQRCodes = qrCodes
    .filter((qr) =>
      filterStatus === 'all' ? true : qr.status === filterStatus,
    )
    .filter((qr) =>
      searchTerm
        ? qr.reference.toLowerCase().includes(searchTerm.toLowerCase())
        : true,
    )

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          label: 'Pago',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-700',
        }
      case 'pending':
        return {
          label: 'Pendente',
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-700',
        }
      case 'expired':
        return {
          label: 'Expirado',
          icon: XCircle,
          className: 'bg-red-100 text-red-700',
        }
      default:
        return {
          label: 'Desconhecido',
          icon: Clock,
          className: 'bg-gray-100 text-gray-700',
        }
    }
  }

  const stats = {
    total: qrCodes.length,
    paid: qrCodes.filter((q) => q.status === 'paid').length,
    pending: qrCodes.filter((q) => q.status === 'pending').length,
    expired: qrCodes.filter((q) => q.status === 'expired').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR Codes</h1>
          <p className="text-gray-600 text-sm mt-1">
            Gerencie suas cobranças via QR Code Pix
          </p>
        </div>
        <Button icon={<QrCode size={18} />}>Gerar Novo QR Code</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card hover>
          <p className="text-sm text-gray-600 mb-2">Total de QR Codes</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </Card>
        <Card hover>
          <p className="text-sm text-gray-600 mb-2">Pagos</p>
          <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
        </Card>
        <Card hover>
          <p className="text-sm text-gray-600 mb-2">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </Card>
        <Card hover>
          <p className="text-sm text-gray-600 mb-2">Expirados</p>
          <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por referência..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={18} />}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              Todos
            </Button>
            <Button
              variant={filterStatus === 'paid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('paid')}
            >
              Pagos
            </Button>
            <Button
              variant={filterStatus === 'pending' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('pending')}
            >
              Pendentes
            </Button>
            <Button
              variant={filterStatus === 'expired' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('expired')}
            >
              Expirados
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
                  Referência
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Valor
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Criado em
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Pago em
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredQRCodes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Nenhum QR Code encontrado
                  </td>
                </tr>
              ) : (
                filteredQRCodes.map((qr) => {
                  const statusConfig = getStatusConfig(qr.status)
                  const StatusIcon = statusConfig.icon

                  return (
                    <tr
                      key={qr.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-gray-900">
                          {qr.reference}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {qr.value.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon size={16} />
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusConfig.className}`}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {qr.createdAt}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {qr.paidAt || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm">
                          Ver Detalhes
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredQRCodes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Exibindo {filteredQRCodes.length} de {qrCodes.length} QR Codes
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
}
