'use client'

import { useState, useMemo, useCallback, memo } from 'react'
import { TrendingUp, CheckCircle, RotateCcw, Calendar } from 'lucide-react'
import { DepositStatsCard } from '@/components/financial/DepositStatsCard'
import { DepositStatusBadge } from '@/components/financial/DepositStatusBadge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  DateRangeFilterPanel,
  dateRangePopoverContainerClassName,
} from '@/components/ui/DateRangeFilterPanel'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/contexts/AuthContext'
import { useDebounce } from '@/hooks/useDebounce'
import { useDeposits, useDepositsStats } from '@/hooks/useFinancial'
import { USER_PERMISSION } from '@/lib/constants'
import { formatCurrencyBRL } from '@/lib/format'
import {
  computeFinancialDateRange,
  formatTransactionDateTime,
} from '@/lib/helpers/financialUtils'

const EntradasPage = memo(() => {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [periodFilter, setPeriodFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [tempStartDate, setTempStartDate] = useState('')
  const [tempEndDate, setTempEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const perPage = 20

  const isAdmin = useMemo(() => {
    return !!user && Number(user.permission) === USER_PERMISSION.ADMIN
  }, [user])

  // Usar helper function existente para calcular range de datas
  const dateRange = useMemo(
    () =>
      computeFinancialDateRange(
        periodFilter as 'hoje' | '7d' | '30d' | 'custom' | null,
        startDate || undefined,
        endDate || undefined,
      ),
    [periodFilter, startDate, endDate],
  )

  const filters = useMemo(() => {
    return {
      page,
      limit: perPage,
      ...(statusFilter !== 'all' && { status: statusFilter }),
      ...(debouncedSearch && { busca: debouncedSearch }),
      ...dateRange,
    }
  }, [page, perPage, debouncedSearch, statusFilter, dateRange])

  const { data, isLoading } = useDeposits(filters, isAdmin)
  const { data: stats, isLoading: statsLoading } = useDepositsStats(
    'total',
    isAdmin,
  )

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

  const handleClearFilters = useCallback(() => {
    setSearch('')
    setStatusFilter('all')
    setPeriodFilter('all')
    setStartDate('')
    setEndDate('')
    setShowDatePicker(false)
    setPage(1)
  }, [])

  const canPrev = useMemo(() => page > 1, [page])
  const canNext = useMemo(
    () => page < processedData.totalPages,
    [page, processedData.totalPages],
  )
  const hasData = useMemo(
    () => !isLoading && processedData.items.length > 0,
    [isLoading, processedData.items.length],
  )

  const handlePeriodFilterChange = useCallback((period: string) => {
    setPeriodFilter(period)
    setStartDate('')
    setEndDate('')
    setShowDatePicker(false)
    setPage(1)
  }, [])

  const handleStatusFilterChange = useCallback((status: string) => {
    setStatusFilter(status)
    setPage(1)
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-[#101010]" size={28} />
            <h1 className="text-2xl font-bold text-gray-900">
              Relatórios de Entradas
            </h1>
          </div>
          <p className="text-sm text-gray-600">
            Gerencie e monitore todas as transações de entrada do sistema
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
        <div className="min-w-0">
          <DepositStatsCard
            title="Aprovadas (Total)"
            value={stats?.data?.depositos_aprovados_geral ?? 0}
            isLoading={statsLoading}
            icon={CheckCircle}
            iconBgColor="bg-green-500"
            valueColor="text-green-600"
          />
        </div>
        <div className="min-w-0">
          <DepositStatsCard
            title="Aprovadas (Hoje)"
            value={stats?.data?.depositos_aprovados_hoje ?? 0}
            isLoading={statsLoading}
            icon={CheckCircle}
            iconBgColor="bg-green-500"
            valueColor="text-green-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
        <div className="min-w-0">
          <DepositStatsCard
            title="Aprovadas (Mês)"
            value={stats?.data?.depositos_aprovados_mes ?? 0}
            isLoading={statsLoading}
            icon={CheckCircle}
            iconBgColor="bg-green-500"
            valueColor="text-green-600"
          />
        </div>
        <div className="min-w-0">
          <DepositStatsCard
            title="Transações geral"
            value={stats?.data?.total_depositos_geral ?? 0}
            isLoading={statsLoading}
            icon={RotateCcw}
            iconBgColor="bg-yellow-500"
            valueColor="text-yellow-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
        <div className="min-w-0">
          <DepositStatsCard
            title="Aprovadas (Bruto)"
            value={stats?.data?.valor_total_geral ?? 0}
            isLoading={statsLoading}
            icon={CheckCircle}
            iconBgColor="bg-yellow-500"
            valueColor="text-green-600"
            isCurrency
          />
        </div>
        <div className="min-w-0">
          <DepositStatsCard
            title="Aprovadas (Hoje)"
            value={stats?.data?.valor_total_hoje ?? 0}
            isLoading={statsLoading}
            icon={CheckCircle}
            iconBgColor="bg-yellow-500"
            valueColor="text-green-600"
            isCurrency
          />
        </div>
        <div className="min-w-0 sm:col-span-2">
          <DepositStatsCard
            title="Aprovadas (Mês)"
            value={stats?.data?.valor_total_mes ?? 0}
            isLoading={statsLoading}
            icon={CheckCircle}
            iconBgColor="bg-yellow-500"
            valueColor="text-green-600"
            isCurrency
          />
        </div>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Relatório de Transações
            </h2>
          </div>

          <div className="mb-4">
            <label
              htmlFor="entradas-search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Pesquisar
            </label>
            <Input
              id="entradas-search"
              placeholder="Buscar registros..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-600">
                Status
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={statusFilter === 'PAID_OUT' ? 'inkSolid' : 'inkOutline'}
                  size="sm"
                  onClick={() => handleStatusFilterChange('PAID_OUT')}
                >
                  Pago
                </Button>
                <Button
                  variant={statusFilter === 'PENDING' ? 'inkSolid' : 'inkOutline'}
                  size="sm"
                  onClick={() => handleStatusFilterChange('PENDING')}
                >
                  Pendente
                </Button>
                <Button
                  variant={statusFilter === 'all' ? 'inkSolid' : 'inkOutline'}
                  size="sm"
                  onClick={() => handleStatusFilterChange('all')}
                >
                  Todos
                </Button>
              </div>
            </div>

            <div className="w-full min-w-0 max-w-full space-y-2">
              <span className="text-xs font-semibold text-gray-600">
                Período
              </span>
              <div className="relative flex w-full min-w-0 max-w-full flex-wrap items-center gap-1.5 sm:gap-2">
                <Button
                  variant={periodFilter === 'all' ? 'inkSolid' : 'inkOutline'}
                  size="sm"
                  className="shrink-0 px-2.5 !text-xs sm:px-4 sm:!text-sm"
                  onClick={() => handlePeriodFilterChange('all')}
                >
                  <span className="sm:hidden">Todas</span>
                  <span className="hidden sm:inline">Todas Datas</span>
                </Button>
                <Button
                  variant={periodFilter === 'hoje' ? 'inkSolid' : 'inkOutline'}
                  size="sm"
                  className="shrink-0 px-2.5 !text-xs sm:px-4 sm:!text-sm"
                  onClick={() => handlePeriodFilterChange('hoje')}
                >
                  Hoje
                </Button>
                <Button
                  variant={periodFilter === '7d' ? 'inkSolid' : 'inkOutline'}
                  size="sm"
                  className="shrink-0 px-2.5 !text-xs sm:px-4 sm:!text-sm"
                  onClick={() => handlePeriodFilterChange('7d')}
                >
                  <span className="sm:hidden">7d</span>
                  <span className="hidden sm:inline">7 dias</span>
                </Button>
                <Button
                  variant={periodFilter === '30d' ? 'inkSolid' : 'inkOutline'}
                  size="sm"
                  className="shrink-0 px-2.5 !text-xs sm:px-4 sm:!text-sm"
                  onClick={() => handlePeriodFilterChange('30d')}
                >
                  <span className="sm:hidden">30d</span>
                  <span className="hidden sm:inline">30 dias</span>
                </Button>
                <Button
                  variant={periodFilter === 'custom' ? 'inkSolid' : 'inkOutline'}
                  size="sm"
                  icon={<Calendar size={14} />}
                  className="shrink-0 px-2.5 sm:px-4"
                  aria-label="Período personalizado"
                  onClick={() => {
                    if (!showDatePicker) {
                      setTempStartDate(startDate)
                      setTempEndDate(endDate)
                    }
                    setShowDatePicker((v) => !v)
                  }}
                />
                <Button
                  variant="inkOutline"
                  size="sm"
                  icon={<RotateCcw size={14} />}
                  className="shrink-0 px-2.5 sm:px-4"
                  aria-label="Limpar filtros"
                  onClick={() => {
                    handleClearFilters()
                    setShowDatePicker(false)
                  }}
                />

                {showDatePicker && (
                  <div className={dateRangePopoverContainerClassName}>
                    <DateRangeFilterPanel
                      startDate={tempStartDate}
                      endDate={tempEndDate}
                      onStartDateChange={setTempStartDate}
                      onEndDateChange={setTempEndDate}
                      onApply={(s, e) => {
                        setStartDate(s)
                        setEndDate(e)
                        setPeriodFilter('custom')
                        setPage(1)
                        setShowDatePicker(false)
                      }}
                      onCancel={() => {
                        setTempStartDate(startDate)
                        setTempEndDate(endDate)
                        setShowDatePicker(false)
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    User ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Transação ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Valor
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Valor Líquido
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Data
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Taxa
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-4 w-28" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-4 w-16" />
                      </td>
                    </tr>
                  ))
                ) : !hasData ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          <TrendingUp className="text-gray-500" />
                        </div>
                      </div>
                      <p className="font-medium text-gray-900">
                        Nenhum depósito encontrado
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Não há depósitos para os filtros selecionados.
                      </p>
                    </td>
                  </tr>
                ) : (
                  processedData.items.map((deposito) => (
                    <tr
                      key={deposito.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {deposito.cliente_id}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {deposito.transacao_id}
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-gray-900">
                        {formatCurrencyBRL(deposito.valor_total)}
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-gray-900">
                        {formatCurrencyBRL(deposito.valor_liquido)}
                      </td>
                      <td className="py-3 px-4">
                        <DepositStatusBadge
                          status={deposito.status}
                          statusLegivel={deposito.status_legivel}
                        />
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatTransactionDateTime(deposito.data)}
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-gray-900">
                        {formatCurrencyBRL(deposito.taxa)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col items-center gap-3 xl:flex-row xl:items-center xl:justify-between">
            <p className="text-sm text-gray-600 text-center xl:text-left">
              Itens por página: <span className="font-medium">{perPage}</span> •
              Total:{' '}
              <span className="font-medium">{processedData.totalItems}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="inkOutline"
                size="sm"
                disabled={!canPrev}
                onClick={() => canPrev && setPage((p) => p - 1)}
                aria-label="Página anterior"
              >
                {'<'}
              </Button>
              <span className="text-sm text-gray-600">
                Página {page} de {processedData.totalPages}
              </span>
              <Button
                variant="inkOutline"
                size="sm"
                disabled={!canNext}
                onClick={() => canNext && setPage((p) => p + 1)}
                aria-label="Próxima página"
              >
                {'>'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
})

export default EntradasPage
