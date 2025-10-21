'use client'

import { useState, useMemo, useCallback, memo } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { InfracaoDetailsModal } from '@/components/modals/InfracaoDetailsModal'
import { useDebounce } from '@/hooks/useDebounce'
import { usePixInfracoes } from '@/hooks/useReactQuery'
import { toast } from 'sonner'
import {
  Filter,
  Eye,
  Download,
  RotateCcw,
  Calendar,
  FileText,
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { createPaginationFilters, formatDateForDisplay } from '@/lib/dateUtils'
import { formatCurrencyBRL } from '@/lib/format'

type InfracaoItem = {
  id: number
  status: string
  data_criacao: string
  data_limite: string
  valor: number
  end_to_end: string
  tipo: string
  descricao: string
}

const PixInfracoesPage = memo(function PixInfracoesPage() {
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
  const [selectedInfracaoId, setSelectedInfracaoId] = useState<number | null>(
    null,
  )
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  // React Query hook
  const { data, isLoading, error } = usePixInfracoes(filters)

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

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedInfracaoId(null)
  }, [])

  const canPrev = page > 1
  const canNext = page < processedData.totalPages

  const resetDates = useCallback(() => {
    setStartDate('')
    setEndDate('')
    setShowDatePicker(false)
    setPeriod('hoje')
    setPage(1)
  }, [])

  const hasData = !isLoading && processedData.items.length > 0

  const buildRowsForExcel = (rows: InfracaoItem[]) =>
    rows.map((r) => ({
      ID: r.id,
      Status: formatStatus(r.status),
      'Data de Criação': r.data_criacao,
      'Data Limite': r.data_limite,
      Valor: r.valor,
      'End to End': r.end_to_end,
      Tipo: r.tipo,
      Descrição: r.descricao,
    }))

  const handleExport = useCallback(() => {
    if (processedData.items.length === 0) {
      toast.error('Não há dados para exportar')
      return
    }

    const rows = buildRowsForExcel(processedData.items)
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Infrações')

    const fileName = `infracoes_${new Date().toISOString().slice(0, 10)}.xlsx`
    XLSX.writeFile(wb, fileName)

    toast.success('Arquivo exportado com sucesso!')
  }, [processedData.items])

  const formatCurrency = formatCurrencyBRL
  const formatDate = formatDateForDisplay

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolvida':
        return 'bg-green-100 text-green-700'
      case 'em análise':
        return 'bg-yellow-100 text-yellow-700'
      case 'pendente':
        return 'bg-red-100 text-red-700'
      case 'mediação':
        return 'bg-yellow-100 text-yellow-700'
      case 'cancelada':
        return 'bg-gray-100 text-gray-700'
      case 'chargeback':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatStatus = (status: string) => {
    const map: Record<string, string> = {
      PENDENTE: 'Pendente',
      EM_ANALISE: 'Em análise',
      RESOLVIDA: 'Resolvida',
      CANCELADA: 'Cancelada',
      CHARGEBACK: 'Chargeback',
      MEDIATION: 'Mediação',
    }
    return map[status] || status
  }

  const handleViewDetails = useCallback((infracaoId: number) => {
    setSelectedInfracaoId(infracaoId)
    setIsModalOpen(true)
  }, [])

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Lista de Infrações
          </h1>
          <p className="text-sm text-gray-600">
            Listagem das Infrações abertas ou recebidas pela conta
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
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Data de Criação
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Data Limite
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Valor
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  End to End
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: perPage }).map((_, index) => (
                  <tr key={index} className="border-b border-gray-100">
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
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-8 w-8" />
                    </td>
                  </tr>
                ))
              ) : hasData ? (
                processedData.items.map((infracao: InfracaoItem) => (
                  <tr
                    key={infracao.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          formatStatus(infracao.status),
                        )}`}
                      >
                        {formatStatus(infracao.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(infracao.data_criacao)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(infracao.data_limite)}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {formatCurrency(infracao.valor)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                      {infracao.end_to_end}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye size={16} />}
                        title="Ver Detalhes"
                        onClick={() => handleViewDetails(infracao.id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <FileText size={32} className="text-gray-400" />
                      </div>
                      <div className="text-gray-500">
                        <p className="text-lg font-medium">
                          Nenhuma infração encontrada
                        </p>
                        <p className="text-sm mt-1">
                          Não há infrações para o período selecionado. Tente
                          ajustar os filtros de data ou verificar novamente em
                          alguns instantes.
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

      <InfracaoDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        infracaoId={selectedInfracaoId}
      />
    </div>
  )
})

export default PixInfracoesPage
