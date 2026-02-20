'use client'

import { useState, useMemo, useCallback, memo } from 'react'
import { FinancialFilters } from '@/components/financial/FinancialFilters'
import {
  FinancialStatsCards,
  createStatCard,
  StatIcons,
} from '@/components/financial/FinancialStatsCards'
import { FinancialTable } from '@/components/financial/FinancialTable'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/contexts/AuthContext'
import { useDebounce } from '@/hooks/useDebounce'
import {
  useFinancialTransactions,
  useFinancialTransactionsStats,
} from '@/hooks/useFinancial'
import { USER_PERMISSION } from '@/lib/constants'
import { computeFinancialDateRange } from '@/lib/helpers/financialUtils'

const TransacoesFinanceirasPage = memo(() => {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [tipoFilter, setTipoFilter] = useState<string>('all')
  const [period, setPeriod] = useState<'hoje' | '7d' | '30d' | 'custom' | null>(
    null,
  )
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 20

  const isAdmin = useMemo(() => {
    return !!user && Number(user.permission) === USER_PERMISSION.ADMIN
  }, [user])

  const computeDateRange = useCallback(() => {
    return computeFinancialDateRange(period, startDate, endDate)
  }, [period, startDate, endDate])

  const filters = useMemo(() => {
    const dateRange = computeDateRange()

    return {
      page,
      limit: perPage,
      ...(statusFilter !== 'all' && { status: statusFilter }),
      ...(tipoFilter !== 'all' && { tipo: tipoFilter }),
      ...(debouncedSearch && { busca: debouncedSearch }),
      ...dateRange,
    }
  }, [
    page,
    perPage,
    debouncedSearch,
    statusFilter,
    tipoFilter,
    computeDateRange,
  ])

  const { data, isLoading } = useFinancialTransactions(filters, isAdmin)
  const { data: stats, isLoading: statsLoading } =
    useFinancialTransactionsStats('hoje', isAdmin)

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

  const canPrev = page > 1
  const canNext = page < processedData.totalPages

  const statsCards = useMemo(() => {
    if (!stats?.data) {
      return []
    }

    return [
      createStatCard(
        'Transações Aprovadas',
        stats.data.transacoes_aprovadas,
        StatIcons.CheckCircle(),
        {
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          valueColor: 'text-green-600',
        },
      ),
      createStatCard(
        'Lucro Líquido (Hoje)',
        stats.data.lucro_liquido_hoje,
        StatIcons.DollarSign(),
        {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          isCurrency: true,
        },
      ),
      createStatCard(
        'Lucro Líquido (Mês)',
        stats.data.lucro_liquido_mes,
        StatIcons.TrendingUp(),
        {
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
          isCurrency: true,
        },
      ),
      createStatCard(
        'Lucro Líquido (Total)',
        stats.data.lucro_liquido_total,
        StatIcons.TrendingUp(),
        {
          iconBg: 'bg-indigo-100',
          iconColor: 'text-indigo-600',
          isCurrency: true,
        },
      ),
    ]
  }, [stats?.data])

  const tableColumns = useMemo(
    () => [
      { key: 'cliente_id', label: 'Cliente ID' },
      { key: 'transacao_id', label: 'Transação ID' },
      { key: 'valor_total', label: 'Valor Total' },
      { key: 'valor_liquido', label: 'Valor Líquido' },
      { key: 'status', label: 'Status' },
      { key: 'data', label: 'Data' },
    ],
    [],
  )

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Transações Financeiras
        </h1>
        <p className="text-sm text-gray-600">
          Visualize todas as transações da plataforma
        </p>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-7 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
              </div>
            </Card>
          ))}
        </div>
      ) : statsCards.length > 0 ? (
        <FinancialStatsCards stats={statsCards} />
      ) : null}

      <Card className="p-4">
        <div className="space-y-4">
          <FinancialFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            tipoFilter={tipoFilter}
            onTipoFilterChange={setTipoFilter}
            period={period}
            onPeriodChange={setPeriod}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onPageReset={() => setPage(1)}
            showTipoFilter
          />
        </div>

        <div className="mt-4">
          <FinancialTable
            items={processedData.items as unknown as Record<string, unknown>[]}
            columns={tableColumns}
            isLoading={isLoading}
            getRowKey={(item) => `${item.tipo}-${item.id}`}
            getTransactionType={(item) => item.tipo as 'deposito' | 'saque'}
            getStatusField={(item) => item.status as string}
            getStatusLabelField={(item) => item.status_legivel as string}
          />
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

export default TransacoesFinanceirasPage
