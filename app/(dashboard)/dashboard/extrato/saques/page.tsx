'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { useTransactions } from '@/hooks/useReactQuery'
import { toast } from 'sonner'
import {
  ArrowUpRight,
  Filter,
  Download,
  Calendar,
  RotateCcw,
} from 'lucide-react'
import * as XLSX from 'xlsx'
import {
  createPaginationFilters,
  createResetDatesHandler,
  formatDateForExport,
} from '@/lib/dateUtils'

export default function SaquesPage() {
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

  // Memorizar filtros para React Query usando função centralizada
  const filters = useMemo(() => {
    return createPaginationFilters(
      page,
      perPage,
      debouncedSearch,
      period,
      startDate,
      endDate,
      'saque',
    )
  }, [page, perPage, debouncedSearch, period, startDate, endDate])

  // React Query hook
  const { data, isLoading, error } = useTransactions(filters)

  // Memorizar dados processados
  const processedData = useMemo(() => {
    if (!data?.data) return { items: [], totalPages: 1, totalItems: 0 }

    return {
      items: data.data.data || [],
      totalPages: data.data.last_page || 1,
      totalItems: data.data.total || 0,
    }
  }, [data])

  // Memorizar handlers
  const handleExport = useCallback(() => {
    if (processedData.items.length === 0) {
      toast.error('Nenhum saque para exportar')
      return
    }

    const exportData = processedData.items.map((saque) => ({
      ID: saque.id,
      'Transaction ID': saque.transaction_id,
      'Nome Cliente': saque.nome_cliente,
      Documento: saque.documento,
      Valor: saque.amount,
      'Valor Líquido': saque.valor_liquido,
      Taxa: saque.taxa,
      Status: saque.status_legivel,
      Data: formatDateForExport(saque.data),
      Adquirente: saque.adquirente,
      Descrição: saque.descricao,
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Saques')
    XLSX.writeFile(wb, `saques_${new Date().toISOString().slice(0, 10)}.xlsx`)
    toast.success('Arquivo exportado com sucesso!')
  }, [processedData.items])

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

  const canPrev = page > 1
  const canNext = page < processedData.totalPages
  const hasData = !isLoading && processedData.items.length > 0

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Saques</h1>
          <p className="text-sm text-gray-600">
            Histórico de todos os saques realizados
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={<Download size={18} />}
            onClick={handleExport}
          >
            Exportar
          </Button>
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
            />
            <Button variant="outline" icon={<Filter size={16} />}>
              Avançado
            </Button>
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

        <div className="mt-4">
          {!hasData ? (
            <div className="py-16 text-center text-gray-600">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
                  <ArrowUpRight className="text-red-400" />
                </div>
              </div>
              <p className="font-medium">Nenhum saque encontrado</p>
              <p className="text-sm text-gray-500 mt-1">
                Não há saques para o período selecionado. Tente ajustar os
                filtros de data ou verificar novamente em alguns instantes.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                      Descrição
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                      Data
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                      Valor
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                      Status
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
                    processedData.items.map((saque) => (
                      <tr
                        key={saque.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-100 text-red-600">
                              <ArrowUpRight size={16} />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {saque.descricao}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(saque.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-semibold text-red-600">
                            -
                            {saque.valor_liquido.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              saque.status === 'COMPLETED' ||
                              saque.status === 'PAID_OUT'
                                ? 'bg-green-100 text-green-700'
                                : saque.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {saque.status_legivel || 'pendente'}
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
