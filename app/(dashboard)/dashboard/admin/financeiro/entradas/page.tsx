'use client'

import { useState, useMemo, useCallback, memo } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { useDeposits, useDepositsStats } from '@/hooks/useFinancial'
import {
  TrendingUp,
  DollarSign,
  CheckCircle,
  Calendar,
  RotateCcw,
  Download,
  Clock,
} from 'lucide-react'
import { createResetDatesHandler } from '@/lib/dateUtils'
import { formatCurrencyBRL } from '@/lib/format'
import { useAuth } from '@/contexts/AuthContext'
import { USER_PERMISSION } from '@/lib/constants'
import { format } from 'date-fns'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'

const EntradasPage = memo(function EntradasPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [period, setPeriod] = useState<'hoje' | '7d' | '30d' | 'custom' | null>(
    null,
  )
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 20

  const isAdmin = useMemo(() => {
    return !!user && Number(user.permission) === USER_PERMISSION.ADMIN
  }, [user])

  const computeDateRange = useCallback(() => {
    if (period === 'hoje') {
      const today = format(new Date(), 'yyyy-MM-dd')
      return { data_inicio: today, data_fim: today }
    }
    if (period === '7d') {
      const hoje = new Date()
      const seteDiasAtras = new Date(hoje)
      seteDiasAtras.setDate(hoje.getDate() - 7)
      return {
        data_inicio: format(seteDiasAtras, 'yyyy-MM-dd'),
        data_fim: format(hoje, 'yyyy-MM-dd'),
      }
    }
    if (period === '30d') {
      const hoje = new Date()
      const trintaDiasAtras = new Date(hoje)
      trintaDiasAtras.setDate(hoje.getDate() - 30)
      return {
        data_inicio: format(trintaDiasAtras, 'yyyy-MM-dd'),
        data_fim: format(hoje, 'yyyy-MM-dd'),
      }
    }
    if (period === 'custom' && startDate && endDate) {
      return { data_inicio: startDate, data_fim: endDate }
    }
    return {}
  }, [period, startDate, endDate])

  const filters = useMemo(() => {
    const dateRange = computeDateRange()

    return {
      page,
      limit: perPage,
      ...(statusFilter !== 'all' && { status: statusFilter }),
      ...(debouncedSearch && { busca: debouncedSearch }),
      ...dateRange,
    }
  }, [
    page,
    perPage,
    debouncedSearch,
    statusFilter,
    period,
    startDate,
    endDate,
    computeDateRange,
  ])

  const { data, isLoading } = useDeposits(filters, isAdmin)
  const { data: stats } = useDepositsStats('hoje', isAdmin)

  const processedData = useMemo(() => {
    if (!data?.data) return { items: [], totalPages: 1, totalItems: 0 }

    return {
      items: data.data.data || [],
      totalPages: data.data.last_page || 1,
      totalItems: data.data.total || 0,
    }
  }, [data])

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

  const handleExport = useCallback(() => {
    if (processedData.items.length === 0) {
      toast.error('Nenhum depósito para exportar')
      return
    }

    const exportData = processedData.items.map((item) => ({
      ID: item.id,
      'Cliente ID': item.cliente_id,
      'Cliente Nome': item.cliente_nome,
      'Transação ID': item.transacao_id,
      'Valor Total': item.valor_total,
      'Valor Líquido': item.valor_liquido,
      Taxa: item.taxa,
      Status: item.status_legivel,
      Data: format(new Date(item.data), 'dd/MM/yyyy HH:mm'),
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Entradas')
    XLSX.writeFile(wb, `entradas_${new Date().toISOString().slice(0, 10)}.xlsx`)
    toast.success('Arquivo exportado com sucesso!')
  }, [processedData.items])

  const canPrev = page > 1
  const canNext = page < processedData.totalPages
  const hasData = !isLoading && processedData.items.length > 0

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes('paid') || statusLower.includes('complete'))
      return 'text-green-600 bg-green-50'
    if (statusLower.includes('pending') || statusLower.includes('aguardando'))
      return 'text-yellow-600 bg-yellow-50'
    if (statusLower.includes('cancel') || statusLower.includes('reject'))
      return 'text-red-600 bg-red-50'
    return 'text-gray-600 bg-gray-50'
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">Entradas</h1>
          <p className="text-sm text-gray-600">
            Visualize todos os depósitos da plataforma
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={16} />}
            onClick={handleExport}
          >
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
      </div>

      {stats?.data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Total Depósitos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.data.total_depositos}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg shrink-0">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Aprovados</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.data.depositos_aprovados}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg shrink-0">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.data.depositos_pendentes}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg shrink-0">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-lg font-bold text-gray-900 truncate">
                  {formatCurrencyBRL(stats.data.valor_total)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg shrink-0">
                <DollarSign className="text-purple-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Lucro</p>
                <p className="text-lg font-bold text-gray-900 truncate">
                  {formatCurrencyBRL(stats.data.lucro_depositos)}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg shrink-0">
                <TrendingUp className="text-indigo-600" size={24} />
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex w-full items-center gap-2">
            <Input
              placeholder="Buscar por cliente, transação..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full sm:max-w-md"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-600">
                Status
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={statusFilter === 'PAID_OUT' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setStatusFilter('PAID_OUT')
                    setPage(1)
                  }}
                >
                  Pago
                </Button>
                <Button
                  variant={
                    statusFilter === 'WAITING_FOR_APPROVAL'
                      ? 'primary'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() => {
                    setStatusFilter('WAITING_FOR_APPROVAL')
                    setPage(1)
                  }}
                >
                  Aguardando
                </Button>
                <Button
                  variant={statusFilter === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setStatusFilter('all')
                    setPage(1)
                  }}
                >
                  Todos
                </Button>
              </div>
            </div>
          </div>

          <div className="relative flex flex-wrap items-center gap-2">
            <Button
              variant={period === null ? 'primary' : 'outline'}
              size="sm"
              className="shrink-0"
              onClick={() => {
                setPeriod(null)
                setStartDate('')
                setEndDate('')
                setPage(1)
              }}
            >
              Todas Datas
            </Button>
            <Button
              variant={period === 'hoje' ? 'primary' : 'outline'}
              size="sm"
              className="shrink-0"
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
              size="sm"
              className="shrink-0"
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
              size="sm"
              className="shrink-0"
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
              size="sm"
              icon={<Calendar size={14} />}
              className="shrink-0"
              onClick={() => setShowDatePicker((v) => !v)}
            />
            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw size={14} />}
              className="shrink-0"
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

        <div className="mt-4">
          {!hasData ? (
            <div className="py-16 text-center text-gray-600">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <TrendingUp className="text-blue-400" />
                </div>
              </div>
              <p className="font-medium">Nenhum depósito encontrado</p>
              <p className="text-sm text-gray-500 mt-1">
                Não há depósitos para os filtros selecionados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 xl:mx-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      Cliente
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      Transação ID
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      Valor Total
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      Valor Líquido
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      Taxa
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="p-4">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-5/6" />
                        </div>
                      </td>
                    </tr>
                  ) : (
                    processedData.items.map((deposito) => (
                      <tr
                        key={deposito.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {deposito.cliente_nome}
                            </div>
                            <div className="text-xs text-gray-500">
                              {deposito.cliente_id}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-600">
                          {deposito.transacao_id}
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrencyBRL(deposito.valor_total)}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrencyBRL(deposito.valor_liquido)}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrencyBRL(deposito.taxa)}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              deposito.status,
                            )}`}
                          >
                            {deposito.status_legivel}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-600">
                          {format(new Date(deposito.data), 'dd/MM/yyyy HH:mm')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col items-center gap-3 xl:flex-row xl:items-center xl:justify-between">
          <p className="text-sm text-gray-600 text-center xl:text-left">
            Itens por página: <span className="font-medium">{perPage}</span> •
            Total:{' '}
            <span className="font-medium">{processedData.totalItems}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!canPrev}
              onClick={() => canPrev && setPage((p) => p - 1)}
            >
              {'<'}
            </Button>
            <span className="text-sm text-gray-600">
              Página {page} de {processedData.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
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
})

export default EntradasPage
