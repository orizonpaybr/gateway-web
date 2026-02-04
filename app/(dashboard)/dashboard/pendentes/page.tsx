'use client'

import { useState, useMemo, useCallback, memo } from 'react'

import { Clock, Filter, RotateCcw, Calendar, Eye } from 'lucide-react'

import { TransactionDetailsModal } from '@/components/modals/TransactionDetailsModal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { useTableFilter, useSearchFilter } from '@/hooks/useTableFilter'
import { useTransactions } from '@/hooks/useReactQuery'
import { createPaginationFilters } from '@/lib/dateUtils'

const PendentesPage = memo(() => {
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState<'hoje' | '7d' | '30d' | 'custom' | null>(
    null,
  )
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 20
  const [detailsId, setDetailsId] = useState<string | number | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const hasPeriodFilter = !!(period || startDate || endDate)
  const { backendSearch } = useSearchFilter(search, hasPeriodFilter)

  const filters = useMemo(() => {
    const base = createPaginationFilters(
      page,
      perPage,
      backendSearch,
      period,
      startDate,
      endDate,
    )
    return { ...base, status: 'PENDING' }
  }, [page, perPage, backendSearch, period, startDate, endDate])

  // React Query hook
  const { data, isLoading } = useTransactions(filters)

  const allItems = data?.data?.data || []
  const filteredItems = useTableFilter(allItems, search, {
    descricaoField: undefined,
    valorField: undefined,
    searchFields: ['transaction_id', 'nome_cliente', 'documento'],
  })

  const hasActiveSearch = search.trim() && !hasPeriodFilter

  const processedData = useMemo(() => {
    if (!data?.data) {
      return { items: [], totalPages: 1, totalItems: 0 }
    }

    const totalItems = hasActiveSearch
      ? filteredItems.length
      : data.data.total || 0

    return {
      items: filteredItems,
      totalPages: data.data.last_page || 1,
      totalItems,
    }
  }, [filteredItems, data?.data, hasActiveSearch])

  const resetDates = useCallback(() => {
    setStartDate('')
    setEndDate('')
    setShowDatePicker(false)
    setPeriod(null)
    setPage(1)
  }, [setStartDate, setEndDate, setShowDatePicker, setPeriod, setPage])

  const canPrev = hasActiveSearch ? false : page > 1
  const canNext = hasActiveSearch ? false : page < processedData.totalPages
  const hasData = !isLoading && processedData.items.length > 0

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Transações Pendentes
          </h1>
          <p className="text-sm text-gray-600">
            Itens aguardando processamento/aprovação
          </p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-2 w-full xl:w-auto">
            <Input
              placeholder="Buscar por transações..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full xl:w-72"
            />
            <Button variant="outline" size="sm" icon={<Filter size={14} />}>
              Avançado
            </Button>
          </div>

          <div className="relative flex flex-wrap items-center gap-2 w-full xl:w-auto xl:flex-nowrap xl:justify-end">
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
              Todos
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
                    <label
                      htmlFor="pendentes-start-date"
                      className="block text-xs text-gray-600 mb-1"
                    >
                      Data inicial
                    </label>
                    <Input
                      id="pendentes-start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="pendentes-end-date"
                      className="block text-xs text-gray-600 mb-1"
                    >
                      Data final
                    </label>
                    <Input
                      id="pendentes-end-date"
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
                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Clock className="text-yellow-600" />
                </div>
              </div>
              <p className="font-medium">
                Nenhuma transação pendente encontrada
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Não há transações pendentes para o período selecionado.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 xl:mx-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      Descrição
                    </th>
                    <th className="hidden md:table-cell text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      Referência
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      Data
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      Valor
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="p-4">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-5/6" />
                        </div>
                      </td>
                    </tr>
                  ) : (
                    processedData.items.map((t) => (
                      <tr
                        key={t.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                              <Clock size={16} />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {t.descricao}
                            </span>
                          </div>
                        </td>
                        <td className="hidden md:table-cell py-3 px-3 text-sm text-gray-600">
                          {t.transaction_id}
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-600">
                          {new Date(t.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-sm font-semibold text-gray-900">
                            {t.tipo === 'deposito' ? '+' : '-'}
                            {t.valor_liquido.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => {
                              setDetailsId(t.id)
                              setIsDetailsOpen(true)
                            }}
                            className="text-gray-900 hover:text-gray-700"
                            aria-label="Ver detalhes"
                          >
                            <Eye size={18} />
                          </button>
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
      <TransactionDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        transactionId={detailsId}
      />
    </div>
  )
})

export default PendentesPage
