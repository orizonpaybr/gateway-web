'use client'

import { useState, useMemo, useCallback, memo } from 'react'

import {
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Download,
  RotateCcw,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { useExtrato, useExtratoSummary } from '@/hooks/useReactQuery'
import { createPaginationFilters, formatDateForExport } from '@/lib/dateUtils'
import { formatCurrencyBRL } from '@/lib/format'

const ExtratoPage = memo(() => {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [period, setPeriod] = useState<'hoje' | '7d' | '30d' | 'custom' | null>(
    null,
  )
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 20
  const [filterType, setFilterType] = useState<'all' | 'entrada' | 'saida'>(
    'all',
  )

  const filters = useMemo(() => {
    const baseFilters = createPaginationFilters(
      page,
      perPage,
      debouncedSearch,
      period,
      startDate,
      endDate,
    )

    if (filterType !== 'all') {
      baseFilters.tipo = filterType as 'entrada' | 'saida'
    }

    return baseFilters as {
      page: number
      limit: number
      busca?: string
      data_inicio?: string
      data_fim?: string
      tipo?: 'entrada' | 'saida'
    }
  }, [page, perPage, debouncedSearch, period, startDate, endDate, filterType])

  const { data, isLoading, error: _error } = useExtrato(filters)
  const { data: summaryData } = useExtratoSummary({
    periodo: period || 'hoje',
    data_inicio: startDate,
    data_fim: endDate,
  })

  const processedData = useMemo(() => {
    if (!data?.data) {
      return { items: [], totalPages: 1, totalItems: 0 }
    }

    return {
      items: data.data.data || [],
      totalPages: data.data.last_page || 1,
      totalItems: data.data.total || 0,
      resumo: data.data.resumo || {},
    }
  }, [data])

  const handleExport = useCallback(() => {
    if (processedData.items.length === 0) {
      toast.error('Nenhuma transação para exportar')
      return
    }

    const exportData = processedData.items.map((transacao) => ({
      ID: transacao.id,
      'Transaction ID': transacao.transaction_id,
      Tipo: transacao.tipo === 'entrada' ? 'Entrada' : 'Saída',
      Descrição: transacao.descricao,
      Valor: transacao.valor,
      'Valor Líquido': transacao.valor_liquido,
      Taxa: transacao.taxa,
      Status: transacao.status_legivel,
      Data: formatDateForExport(transacao.data),
      'Nome Cliente': transacao.nome_cliente,
      Documento: transacao.documento,
      Adquirente: transacao.adquirente,
      'End-to-End ID': transacao.end_to_end || '',
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Extrato')
    XLSX.writeFile(wb, `extrato_${new Date().toISOString().slice(0, 10)}.xlsx`)
    toast.success('Arquivo exportado com sucesso!')
  }, [processedData.items])

  const resetDates = useCallback(() => {
    setStartDate('')
    setEndDate('')
    setShowDatePicker(false)
    setPeriod(null)
    setPage(1)
  }, [setStartDate, setEndDate, setShowDatePicker, setPeriod, setPage])

  const canPrev = page > 1
  const canNext = page < processedData.totalPages
  const hasData = !isLoading && processedData.items.length > 0

  const totalEntradas = summaryData?.data?.resumo?.total_entradas_liquidas || 0
  const totalSaidas = summaryData?.data?.resumo?.total_saidas_liquidas || 0
  const saldoPeriodo = totalEntradas - totalSaidas

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">Extrato</h1>
          <p className="text-sm text-gray-600">
            Visualize e exporte seu histórico de transações
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={16} />}
            onClick={handleExport}
          >
            <span className="hidden sm:inline">Exportar Extrato</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total em Entradas</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrencyBRL(totalEntradas)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ArrowDownLeft className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total em Saídas</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrencyBRL(totalSaidas)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <ArrowUpRight className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Saldo do Período</p>
              <p
                className={`text-2xl font-bold ${
                  saldoPeriodo >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatCurrencyBRL(saldoPeriodo)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Filter className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-2 w-full xl:w-auto">
            <Input
              placeholder="Buscar por descrição, EndToEndID ou valor..."
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
                      htmlFor="extrato-start-date"
                      className="block text-xs text-gray-600 mb-1"
                    >
                      Data inicial
                    </label>
                    <Input
                      id="extrato-start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="extrato-end-date"
                      className="block text-xs text-gray-600 mb-1"
                    >
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

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            variant={filterType === 'all' ? 'primary' : 'outline'}
            size="sm"
            className="shrink-0"
            onClick={() => {
              setFilterType('all')
              setPage(1)
            }}
          >
            Todas
          </Button>
          <Button
            variant={filterType === 'entrada' ? 'primary' : 'outline'}
            size="sm"
            className="shrink-0"
            onClick={() => {
              setFilterType('entrada')
              setPage(1)
            }}
          >
            Entradas
          </Button>
          <Button
            variant={filterType === 'saida' ? 'primary' : 'outline'}
            size="sm"
            className="shrink-0"
            onClick={() => {
              setFilterType('saida')
              setPage(1)
            }}
          >
            Saídas
          </Button>
        </div>

        <div className="mt-4">
          {!hasData ? (
            <div className="py-16 text-center text-gray-600">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center">
                  <Filter className="text-gray-400" />
                </div>
              </div>
              <p className="font-medium">Nenhuma transação encontrada</p>
              <p className="text-sm text-gray-500 mt-1">
                Não há transações para o período selecionado. Tente ajustar os
                filtros de data ou verificar novamente em alguns instantes.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 xl:mx-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="hidden md:table-cell text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      ENDTOENDID
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      TIPO
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      DESCRIÇÃO
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      VALOR
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      DATA/HORA
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
                    processedData.items.map((transacao) => (
                      <tr
                        key={transacao.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="hidden md:table-cell py-3 px-3 text-sm text-gray-600 font-mono">
                          <div
                            className="truncate max-w-[200px] cursor-help"
                            title={transacao.end_to_end || '-'}
                          >
                            {transacao.end_to_end || '-'}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              transacao.tipo === 'entrada'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {transacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                transacao.tipo === 'entrada'
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-red-100 text-red-600'
                              }`}
                            >
                              {transacao.tipo === 'entrada' ? (
                                <ArrowDownLeft size={16} />
                              ) : (
                                <ArrowUpRight size={16} />
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {transacao.descricao}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-sm font-semibold text-gray-900">
                            {transacao.tipo === 'entrada' ? '+' : '-'}
                            {formatCurrencyBRL(transacao.valor_liquido)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-600">
                          {new Date(transacao.data).toLocaleDateString('pt-BR')}{' '}
                          {new Date(transacao.data).toLocaleTimeString(
                            'pt-BR',
                            { hour: '2-digit', minute: '2-digit' },
                          )}
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
    </div>
  )
})

export default ExtratoPage
