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
  CheckCircle,
  RotateCcw,
  Download,
  Calendar,
} from 'lucide-react'
import { formatCurrencyBRL } from '@/lib/format'
import { useAuth } from '@/contexts/AuthContext'
import { USER_PERMISSION } from '@/lib/constants'
import { format } from 'date-fns'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import type { Deposit } from '@/lib/api'
import { Select } from '@/components/ui/Select'
import { Dialog } from '@/components/ui/Dialog'
import { DepositStatsCard } from '@/components/financial/DepositStatsCard'
import { DepositStatusBadge } from '@/components/financial/DepositStatusBadge'
import { useDepositStatusUpdate } from '@/hooks/useDepositStatusUpdate'
import {
  computeFinancialDateRange,
  formatTransactionDateTime,
} from '@/lib/helpers/financialUtils'

const EntradasPage = memo(function EntradasPage() {
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
  const [confirmStatusChange, setConfirmStatusChange] = useState<{
    depositoId: number
    newStatus: string
    depositoInfo?: Deposit
  } | null>(null)
  const perPage = 20

  const isAdmin = useMemo(() => {
    return !!user && Number(user.permission) === USER_PERMISSION.ADMIN
  }, [user])

  // Hook para atualização de status
  const updateStatusMutation = useDepositStatusUpdate()

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

  const handleExport = useCallback(() => {
    if (processedData.items.length === 0) {
      toast.error('Nenhum depósito para exportar')
      return
    }

    const exportData = processedData.items.map((item) => ({
      Meio: item.meio || 'PIX',
      'User ID': item.cliente_id,
      'Transação ID': item.transacao_id,
      Valor: item.valor_total,
      'Valor Líquido': item.valor_liquido,
      Status: item.status_legivel,
      Data: format(new Date(item.data), 'dd/MM/yyyy HH:mm'),
      Taxa: item.taxa,
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Entradas')
    XLSX.writeFile(wb, `entradas_${new Date().toISOString().slice(0, 10)}.xlsx`)
    toast.success('Arquivo exportado com sucesso!')
  }, [processedData.items])

  // Constantes memoizadas
  const canPrev = useMemo(() => page > 1, [page])
  const canNext = useMemo(
    () => page < processedData.totalPages,
    [page, processedData.totalPages],
  )
  const hasData = useMemo(
    () => !isLoading && processedData.items.length > 0,
    [isLoading, processedData.items.length],
  )

  // Opções de status para o select de ações
  const statusOptions = useMemo(
    () => [
      { value: 'PENDING', label: 'Pendente' },
      { value: 'PAID_OUT', label: 'Aprovado' },
      { value: 'COMPLETED', label: 'Completo' },
      { value: 'CANCELLED', label: 'Cancelado' },
    ],
    [],
  )

  // Função para obter opções de status incluindo o status atual se não estiver na lista
  const getStatusOptionsForDeposit = useCallback(
    (deposito: Deposit) => {
      const currentStatusInOptions = statusOptions.find(
        (opt) => opt.value === deposito.status,
      )

      if (!currentStatusInOptions) {
        return [
          ...statusOptions,
          {
            value: deposito.status,
            label: deposito.status_legivel || deposito.status,
          },
        ]
      }

      return statusOptions
    },
    [statusOptions],
  )

  // Handlers memorizados para filtros
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

  // Handler para abrir dialog de confirmação
  const handleStatusChange = useCallback(
    (depositoId: number, newStatus: string) => {
      const deposito = processedData.items.find((d) => d.id === depositoId)
      setConfirmStatusChange({
        depositoId,
        newStatus,
        depositoInfo: deposito,
      })
    },
    [processedData.items],
  )

  // Handler para confirmar mudança de status
  const handleConfirmStatusChange = useCallback(async () => {
    if (!confirmStatusChange) return

    try {
      await updateStatusMutation.mutateAsync({
        depositoId: confirmStatusChange.depositoId,
        newStatus: confirmStatusChange.newStatus,
      })
      setConfirmStatusChange(null)
    } catch (error) {
      // Erro já é tratado pelo hook (toast será exibido)
    }
  }, [confirmStatusChange, updateStatusMutation])

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-primary" size={28} />
            <h1 className="text-2xl font-bold text-primary">
              Relatórios de Entradas
            </h1>
          </div>
          <p className="text-sm text-gray-600">
            Gerencie e monitore todas as transações de entrada do sistema
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DepositStatsCard
          title="Aprovadas (Total)"
          value={stats?.data?.depositos_aprovados_geral ?? 0}
          isLoading={statsLoading}
          icon={CheckCircle}
          iconBgColor="bg-green-500"
          valueColor="text-green-600"
        />
        <DepositStatsCard
          title="Aprovadas (Hoje)"
          value={stats?.data?.depositos_aprovados_hoje ?? 0}
          isLoading={statsLoading}
          icon={CheckCircle}
          iconBgColor="bg-green-500"
          valueColor="text-green-600"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DepositStatsCard
          title="Aprovadas (Mês)"
          value={stats?.data?.depositos_aprovados_mes ?? 0}
          isLoading={statsLoading}
          icon={CheckCircle}
          iconBgColor="bg-green-500"
          valueColor="text-green-600"
        />
        <DepositStatsCard
          title="Transações geral"
          value={stats?.data?.total_depositos_geral ?? 0}
          isLoading={statsLoading}
          icon={RotateCcw}
          iconBgColor="bg-yellow-500"
          valueColor="text-yellow-600"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DepositStatsCard
          title="Aprovadas (Bruto)"
          value={stats?.data?.valor_total_geral ?? 0}
          isLoading={statsLoading}
          icon={CheckCircle}
          iconBgColor="bg-yellow-500"
          valueColor="text-green-600"
          isCurrency
        />
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <Card className="border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">
                Relatório de Transações
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<Download size={16} />}
              onClick={handleExport}
              className="border-blue-400 text-blue-600 hover:bg-blue-50 bg-white"
            >
              Exportar
            </Button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pesquisar
            </label>
            <Input
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
                  variant={statusFilter === 'PAID_OUT' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilterChange('PAID_OUT')}
                >
                  Pago
                </Button>
                <Button
                  variant={statusFilter === 'PENDING' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilterChange('PENDING')}
                >
                  Pendente
                </Button>
                <Button
                  variant={statusFilter === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilterChange('all')}
                >
                  Todos
                </Button>
              </div>
            </div>

            <div className="space-y-2 relative">
              <span className="text-xs font-semibold text-gray-600">
                Período
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={periodFilter === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  className="shrink-0"
                  onClick={() => handlePeriodFilterChange('all')}
                >
                  Todas Datas
                </Button>
                <Button
                  variant={periodFilter === 'hoje' ? 'primary' : 'outline'}
                  size="sm"
                  className="shrink-0"
                  onClick={() => handlePeriodFilterChange('hoje')}
                >
                  Hoje
                </Button>
                <Button
                  variant={periodFilter === '7d' ? 'primary' : 'outline'}
                  size="sm"
                  className="shrink-0"
                  onClick={() => handlePeriodFilterChange('7d')}
                >
                  7 dias
                </Button>
                <Button
                  variant={periodFilter === '30d' ? 'primary' : 'outline'}
                  size="sm"
                  className="shrink-0"
                  onClick={() => handlePeriodFilterChange('30d')}
                >
                  30 dias
                </Button>
                <Button
                  variant={periodFilter === 'custom' ? 'primary' : 'outline'}
                  size="sm"
                  icon={<Calendar size={14} />}
                  className="shrink-0"
                  onClick={() => {
                    if (!showDatePicker) {
                      setTempStartDate(startDate)
                      setTempEndDate(endDate)
                    }
                    setShowDatePicker((v) => !v)
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  icon={<RotateCcw size={14} />}
                  className="shrink-0"
                  onClick={() => {
                    handleClearFilters()
                    setShowDatePicker(false)
                  }}
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
                          value={tempStartDate}
                          onChange={(e) => {
                            setTempStartDate(e.target.value)
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Data final
                        </label>
                        <Input
                          type="date"
                          value={tempEndDate}
                          onChange={(e) => {
                            setTempEndDate(e.target.value)
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTempStartDate(startDate)
                            setTempEndDate(endDate)
                            setShowDatePicker(false)
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setStartDate(tempStartDate)
                            setEndDate(tempEndDate)
                            setPeriodFilter('custom')
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
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Meio
                  </th>
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
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="p-4">
                      <div className="space-y-3">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    </td>
                  </tr>
                ) : !hasData ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center">
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                          <TrendingUp className="text-blue-400" />
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
                      <td className="py-3 px-4 text-sm text-gray-900">PIX</td>
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
                      <td className="py-3 px-4">
                        <div className="w-32">
                          <Select
                            options={getStatusOptionsForDeposit(deposito)}
                            value={deposito.status}
                            onChange={(value) =>
                              handleStatusChange(deposito.id, value)
                            }
                            placeholder=""
                            className="[&>div>div>button]:py-2 [&>div>div>button]:text-xs [&>div>div>button]:px-2"
                          />
                        </div>
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
        </div>
      </Card>

      <Dialog
        open={!!confirmStatusChange}
        onClose={() => setConfirmStatusChange(null)}
        title="Confirmar alteração de status"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmStatusChange(null)}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmStatusChange}>Confirmar</Button>
          </div>
        }
      >
        {confirmStatusChange && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Tem certeza que deseja alterar o status do depósito?
            </p>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transação ID:</span>
                <span className="font-medium text-gray-900">
                  {confirmStatusChange.depositoInfo?.transacao_id || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cliente:</span>
                <span className="font-medium text-gray-900">
                  {confirmStatusChange.depositoInfo?.cliente_nome || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Valor:</span>
                <span className="font-medium text-gray-900">
                  {confirmStatusChange.depositoInfo
                    ? formatCurrencyBRL(
                        confirmStatusChange.depositoInfo.valor_total,
                      )
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600">Novo Status:</span>
                <span className="font-medium text-gray-900">
                  {statusOptions.find(
                    (opt) => opt.value === confirmStatusChange.newStatus,
                  )?.label || confirmStatusChange.newStatus}
                </span>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
})

export default EntradasPage
