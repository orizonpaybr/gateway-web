'use client'

import { useState, useMemo } from 'react'

import { QrCode, Search, CheckCircle, Clock, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { useQRCodes } from '@/hooks/useReactQuery'
import { useDebounce } from '@/hooks/useDebounce'
import { formatCurrencyBRL } from '@/lib/format'
import { formatDateForDisplay } from '@/lib/dateUtils'

export default function QRCodesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'paid' | 'expired'
  >('all')
  const [page, setPage] = useState(1)
  const perPage = 20

  // Buscar dados da API
  const { data, isLoading } = useQRCodes({
    page,
    limit: perPage,
    busca: debouncedSearch,
  })

  const processedData = useMemo(() => {
    if (!data?.data) {
      return { items: [], totalPages: 1, totalItems: 0 }
    }

    return {
      items: data.data.data || [],
      totalPages: data.data.last_page || 1,
      totalItems: data.data.total || 0,
    }
  }, [data])

  const filteredQRCodes = useMemo(() => {
    if (!processedData.items) {
      return []
    }

    return processedData.items.filter((qr: { status?: string }) => {
      if (filterStatus === 'all') {
        return true
      }

      const status = qr.status?.toLowerCase() || ''
      if (filterStatus === 'paid') {
        return status === 'ativo' || status === 'pago'
      }
      if (filterStatus === 'pending') {
        return status === 'pendente'
      }
      if (filterStatus === 'expired') {
        return status === 'expirado' || status === 'inativo'
      }

      return true
    })
  }, [processedData.items, filterStatus])

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

  const stats = useMemo(() => {
    if (!processedData.items) {
      return { total: 0, paid: 0, pending: 0, expired: 0 }
    }

    return {
      total: processedData.totalItems,
      paid: processedData.items.filter((q: { status?: string }) => {
        return (
          q.status?.toLowerCase() === 'ativo' ||
          q.status?.toLowerCase() === 'pago'
        )
      }).length,
      pending: processedData.items.filter((q: { status?: string }) => {
        return q.status?.toLowerCase() === 'pendente'
      }).length,
      expired: processedData.items.filter((q: { status?: string }) => {
        return (
          q.status?.toLowerCase() === 'expirado' ||
          q.status?.toLowerCase() === 'inativo'
        )
      }).length,
    }
  }, [processedData])

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
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td colSpan={6} className="py-3 px-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredQRCodes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Nenhum QR Code encontrado
                  </td>
                </tr>
              ) : (
                filteredQRCodes.map(
                  (qr: {
                    id: number
                    referencia?: string
                    name_produto?: string
                    valor?: string | number
                    produto_valor?: string | number
                    status?: string
                    created_at?: string
                    paid_at?: string
                  }) => {
                    const status = qr.status?.toLowerCase() || ''
                    const statusKey =
                      status === 'ativo' || status === 'pago'
                        ? 'paid'
                        : status === 'pendente'
                        ? 'pending'
                        : status === 'expirado' || status === 'inativo'
                        ? 'expired'
                        : 'pending'

                    const statusConfig = getStatusConfig(statusKey)
                    const StatusIcon = statusConfig.icon

                    return (
                      <tr
                        key={qr.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-gray-900">
                            {qr.referencia || qr.name_produto || `QR-${qr.id}`}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrencyBRL(
                              parseFloat(
                                String(qr.valor || qr.produto_valor || 0),
                              ),
                            )}
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
                          {qr.created_at
                            ? formatDateForDisplay(qr.created_at)
                            : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {qr.paid_at ? formatDateForDisplay(qr.paid_at) : '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm">
                            Ver Detalhes
                          </Button>
                        </td>
                      </tr>
                    )
                  },
                )
              )}
            </tbody>
          </table>
        </div>

        {filteredQRCodes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Exibindo {filteredQRCodes.length} de {processedData.totalItems} QR
              Codes
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((p) => Math.min(processedData.totalPages, p + 1))
                }
                disabled={page >= processedData.totalPages}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
