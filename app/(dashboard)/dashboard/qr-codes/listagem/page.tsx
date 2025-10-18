'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { useQRCodes } from '@/hooks/useReactQuery'
import { Filter, RotateCcw, Calendar, QrCode } from 'lucide-react'
import {
  createPaginationFilters,
  createResetDatesHandler,
  formatDateForExport,
} from '@/lib/dateUtils'
import { formatCurrencyBRL } from '@/lib/format'

export default function QRCodeListagemPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [period, setPeriod] = useState<'hoje' | '7d' | '30d' | 'custom' | null>(
    null,
  )
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)

  // Memorizar filtros para React Query usando função centralizada
  const filters = useMemo(() => {
    return createPaginationFilters(
      page,
      perPage,
      debouncedSearch,
      period,
      startDate,
      endDate,
    )
  }, [page, perPage, debouncedSearch, period, startDate, endDate])

  // React Query hooks
  const { data, isLoading, error } = useQRCodes(filters)

  // Memorizar dados processados
  const processedData = useMemo(() => {
    if (!data?.data) return { items: [], totalPages: 1, totalItems: 0 }

    return {
      items: data.data.data || [],
      totalPages: data.data.last_page || 1,
      totalItems: data.data.total || 0,
    }
  }, [data])

  const canPrev = page > 1
  const canNext = page < processedData.totalPages

  const resetDates = useCallback(
    createResetDatesHandler(
      setStartDate,
      setEndDate,
      setShowDatePicker,
      setPeriod,
      setPage,
    ),
    [],
  )

  const hasData = !isLoading && processedData.items.length > 0

  const formatCurrency = formatCurrencyBRL

  const formatDate = formatDateForExport

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo':
        return 'bg-green-100 text-green-700'
      case 'inativo':
        return 'bg-red-100 text-red-700'
      case 'expirado':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatStatus = (status: string) => {
    const map: Record<string, string> = {
      ATIVO: 'Ativo',
      INATIVO: 'Inativo',
      EXPIRADO: 'Expirado',
    }
    return map[status.toUpperCase()] || status
  }

  const formatTipoCobranca = (tipo: string) => {
    const map: Record<string, string> = {
      pix: 'PIX',
      billet: 'Boleto',
      card: 'Cartão',
    }
    return map[tipo?.toLowerCase()] || tipo || 'PIX'
  }

  const getTipoCobrancaColor = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
      case 'pix':
        return 'bg-green-100 text-green-700'
      case 'billet':
        return 'bg-blue-100 text-blue-700'
      case 'card':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Listagem</h1>
          <p className="text-sm text-gray-600">
            Gerencie todos os seus QR Codes criados
          </p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full sm:w-72"
              icon={<Filter size={16} />}
            />
          </div>

          <div className="relative flex items-center gap-2">
            <Button
              variant={period === null ? 'primary' : 'outline'}
              onClick={() => {
                setPeriod(null)
                setStartDate('')
                setEndDate('')
                setPage(1)
              }}
            >
              Todos
            </Button>
            <Button
              variant={period === 'hoje' ? 'primary' : 'outline'}
              onClick={() => {
                setPeriod('hoje')
                setStartDate('')
                setEndDate('')
                setPage(1)
              }}
            >
              Hoje
            </Button>
            <Button
              variant={period === '7d' ? 'primary' : 'outline'}
              onClick={() => {
                setPeriod('7d')
                setStartDate('')
                setEndDate('')
                setPage(1)
              }}
            >
              7 dias
            </Button>
            <Button
              variant={period === '30d' ? 'primary' : 'outline'}
              onClick={() => {
                setPeriod('30d')
                setStartDate('')
                setEndDate('')
                setPage(1)
              }}
            >
              30 dias
            </Button>
            <Button
              variant={period === 'custom' ? 'primary' : 'outline'}
              icon={<Calendar size={16} />}
              onClick={() => setShowDatePicker((v) => !v)}
            />
            <Button
              variant="outline"
              icon={<RotateCcw size={16} />}
              onClick={resetDates}
            />

            {showDatePicker && (
              <div className="absolute right-0 top-11 z-10 bg-white border border-gray-200 rounded-lg shadow-md p-3 w-64">
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Data inicial
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Data final
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="ghost"
                      onClick={() => setShowDatePicker(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => {
                        setPeriod('custom')
                        setPage(1)
                        setShowDatePicker(false)
                      }}
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  QR CODE
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  NOME
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  VALOR
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  STATUS
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  TIPO DA COBRANÇA
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  DEVEDOR
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  DOCUMENTO
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  DATA CRIAÇÃO
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: perPage }).map((_, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <Skeleton className="h-8 w-8" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-6 w-20" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-6 w-20" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-6 w-20" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  </tr>
                ))
              ) : hasData ? (
                processedData.items.map((qrCode) => (
                  <tr
                    key={qrCode.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div className="p-1 rounded bg-gray-100 text-gray-600 w-fit">
                        <QrCode size={16} />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {qrCode.nome}
                        </div>
                        <div className="text-xs text-gray-500">
                          {qrCode.descricao}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {formatCurrency(qrCode.valor)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          qrCode.status,
                        )}`}
                      >
                        {formatStatus(qrCode.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTipoCobrancaColor(
                          qrCode.tipo || 'pix',
                        )}`}
                      >
                        {formatTipoCobranca(qrCode.tipo || 'pix')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {(qrCode as any).devedor || '---'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {(qrCode as any).documento || '---'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(qrCode.data_criacao)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <QrCode size={32} className="text-gray-400" />
                      </div>
                      <div className="text-gray-500">
                        <p className="text-lg font-medium">
                          Nenhum QR Code encontrado
                        </p>
                        <p className="text-sm mt-1">
                          Não há QR Codes para o período selecionado. Tente
                          ajustar os filtros de data ou criar um novo QR Code.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Itens por página: <span className="font-medium">{perPage}</span> •
            Total:{' '}
            <span className="font-medium">{processedData.totalItems}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={!canPrev}
              onClick={() => canPrev && setPage((p) => p - 1)}
            >
              {'<'}
            </Button>
            <Button
              variant="outline"
              disabled={!canNext}
              onClick={() => canNext && setPage((p) => p + 1)}
            >
              {'>'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
