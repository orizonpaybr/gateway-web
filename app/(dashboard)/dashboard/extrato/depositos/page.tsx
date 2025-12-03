'use client'

import { useState, useMemo, useCallback } from 'react'

import {
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
import { useTransactions } from '@/hooks/useReactQuery'
import { createPaginationFilters, formatDateForExport } from '@/lib/dateUtils'

export default function DepositosPage() {
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

  const filters = useMemo(() => {
    return createPaginationFilters(
      page,
      perPage,
      debouncedSearch,
      period,
      startDate,
      endDate,
      'deposito',
    )
  }, [page, perPage, debouncedSearch, period, startDate, endDate])

  // React Query hook
  const { data, isLoading, error: _error } = useTransactions(filters)

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

  const handleExport = useCallback(() => {
    if (processedData.items.length === 0) {
      toast.error('Nenhum depósito para exportar')
      return
    }

    const exportData = processedData.items.map((deposito) => ({
      ID: deposito.id,
      'Transaction ID': deposito.transaction_id,
      'Nome Cliente': deposito.nome_cliente,
      Documento: deposito.documento,
      Valor: deposito.amount,
      'Valor Líquido': deposito.valor_liquido,
      Taxa: deposito.taxa,
      Status: deposito.status_legivel,
      Data: formatDateForExport(deposito.data),
      Adquirente: deposito.adquirente,
      Descrição: deposito.descricao,
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Depósitos')
    XLSX.writeFile(
      wb,
      `depositos_${new Date().toISOString().slice(0, 10)}.xlsx`,
    )
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

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">
            Extrato da Conta
          </h1>
          <p className="text-sm text-gray-600">
            Detalhamento de movimentações financeiras da conta
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

      <Card className="p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-2 w-full xl:w-auto">
            <Input
              placeholder="Buscar..."
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
                      htmlFor="depositos-start-date"
                      className="block text-xs text-gray-600 mb-1"
                    >
                      Data inicial
                    </label>
                    <Input
                      id="depositos-start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="depositos-end-date"
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

        <div className="mt-4">
          {!hasData ? (
            <div className="py-16 text-center text-gray-600">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <ArrowDownLeft className="text-gray-400" />
                </div>
              </div>
              <p className="font-medium">Nenhum depósito encontrado</p>
              <p className="text-sm text-gray-500 mt-1">
                Não há depósitos para o período selecionado. Tente ajustar os
                filtros de data ou verificar novamente em alguns instantes.
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
                      <td colSpan={4} className="p-4">
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
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 text-green-600">
                              <ArrowDownLeft size={16} />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {deposito.descricao}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-600">
                          {new Date(deposito.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-sm font-semibold text-green-600">
                            +
                            {deposito.valor_liquido.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                            {deposito.status_legivel || 'concluído'}
                          </span>
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
}
