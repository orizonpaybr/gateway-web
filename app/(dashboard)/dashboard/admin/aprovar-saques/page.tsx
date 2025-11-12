'use client'

import { useState, useMemo, useCallback, memo, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CurrencyInput } from '@/components/ui/CurrencyInput'
import { Skeleton } from '@/components/ui/Skeleton'
import { Switch } from '@/components/ui/Switch'
import { Tooltip } from '@/components/ui/Tooltip'
import { Dialog } from '@/components/ui/Dialog'
import { useDebounce } from '@/hooks/useDebounce'
import {
  useWithdrawals,
  useApproveWithdrawal,
  useRejectWithdrawal,
  useWithdrawalStats,
} from '@/hooks/useWithdrawals'
import {
  ArrowUpRight,
  Calendar,
  RotateCcw,
  CheckCircle,
  XCircle,
  Eye,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { createResetDatesHandler } from '@/lib/dateUtils'
import {
  computeDateRange,
  formatWithdrawalValue,
  formatWithdrawalDate,
  getStatusBadgeClasses,
} from '@/lib/helpers/withdrawalUtils'
import { formatCurrencyBRL } from '@/lib/format'
import { WithdrawalDetailsModal } from '@/components/modals/WithdrawalDetailsModal'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { withdrawalsAPI } from '@/lib/api'
import { Settings, Save, Info } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { USER_PERMISSION } from '@/lib/constants'
import { toast } from 'sonner'

const AprovarSaquesPage = memo(function AprovarSaquesPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [statusFilter, setStatusFilter] = useState<
    'PENDING' | 'COMPLETED' | 'CANCELLED' | 'all'
  >('PENDING')
  const [tipoFilter, setTipoFilter] = useState<'manual' | 'automatico' | 'all'>(
    'all',
  )
  const [period, setPeriod] = useState<'hoje' | '7d' | '30d' | 'custom' | null>(
    null,
  )
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 20
  const [detailsId, setDetailsId] = useState<number | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'reject'
    id: number
  } | null>(null)

  // Verificar se é admin (precisa vir antes de usar em React Query 'enabled')
  const isAdmin = useMemo(() => {
    return !!user && Number(user.permission) === USER_PERMISSION.ADMIN
  }, [user])

  // Configurações (React Query)
  const queryClient = useQueryClient()
  const { data: configData, isLoading: isConfigLoading } = useQuery({
    queryKey: ['withdrawal-config'],
    queryFn: () => withdrawalsAPI.getConfig(),
    enabled: showConfig && isAdmin,
    staleTime: 60000,
  })
  const [saqueAutomatico, setSaqueAutomatico] = useState(false)
  const [limite, setLimite] = useState('')

  // Sincronizar quando carregar config
  useEffect(() => {
    if (configData?.data) {
      setSaqueAutomatico(configData.data.saque_automatico)
      const apiLimite = configData.data.limite_saque_automatico
      if (apiLimite === null) {
        setLimite('')
      } else {
        const cents = Math.round(Number(apiLimite) * 100)
        setLimite(String(cents))
      }
    }
  }, [configData?.data])

  const updateConfigMutation = useMutation({
    mutationFn: (payload: {
      saque_automatico: boolean
      limite_saque_automatico: number | null
    }) => withdrawalsAPI.updateConfig(payload),
    onSuccess: () => {
      toast.success('Configurações atualizadas com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['withdrawal-config'] })
      queryClient.invalidateQueries({ queryKey: ['withdrawal-stats'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao atualizar configurações')
    },
  })

  // Filtros para a API
  const filters = useMemo(() => {
    const dateRange = computeDateRange(period, startDate, endDate)

    return {
      page,
      limit: perPage,
      status: statusFilter,
      tipo: tipoFilter,
      ...(debouncedSearch && { busca: debouncedSearch }),
      ...(dateRange.data_inicio && { data_inicio: dateRange.data_inicio }),
      ...(dateRange.data_fim && { data_fim: dateRange.data_fim }),
    }
  }, [
    page,
    perPage,
    debouncedSearch,
    statusFilter,
    tipoFilter,
    period,
    startDate,
    endDate,
  ])

  // Buscar dados
  const { data, isLoading } = useWithdrawals(filters, isAdmin)
  const { data: stats } = useWithdrawalStats('hoje', isAdmin)

  // Mutations
  const approveMutation = useApproveWithdrawal()
  const rejectMutation = useRejectWithdrawal()

  // Processar dados
  const processedData = useMemo(() => {
    if (!data?.data) return { items: [], totalPages: 1, totalItems: 0 }

    return {
      items: data.data.data || [],
      totalPages: data.data.last_page || 1,
      totalItems: data.data.total || 0,
    }
  }, [data])

  // Handlers
  const handleApprove = useCallback((id: number) => {
    setConfirmAction({ type: 'approve', id })
  }, [])

  const handleReject = useCallback((id: number) => {
    setConfirmAction({ type: 'reject', id })
  }, [])

  const handleViewDetails = useCallback((id: number) => {
    setDetailsId(id)
    setIsDetailsOpen(true)
  }, [])

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
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">
            Aprovar Saques
          </h1>
          <p className="text-sm text-gray-600">
            Gerencie as solicitações de saque pendentes
          </p>
        </div>
      </div>

      {stats?.data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.data.total_pendentes}
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
                <p className="text-sm text-gray-600">Aprovados Hoje</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.data.total_aprovados}
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
                <p className="text-sm text-gray-600">Rejeitados Hoje</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.data.total_rejeitados}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg shrink-0">
                <XCircle className="text-red-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Valor Aprovado</p>
                <p className="text-lg font-bold text-gray-900 truncate">
                  {formatCurrencyBRL(stats.data.valor_aprovado)}
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
                <p className="text-sm text-gray-600">Manual / Auto</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.data.saques_manuais} / {stats.data.saques_automaticos}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg shrink-0">
                <ArrowUpRight className="text-purple-600" size={24} />
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex w-full items-center gap-2 flex-col sm:flex-row">
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full sm:max-w-md"
            />
            <div className="w-full sm:w-auto flex justify-end">
              <Button
                variant="outline"
                size="sm"
                icon={<Settings size={14} />}
                onClick={() => setShowConfig((v) => !v)}
              >
                Configurar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-600">
                Status
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={statusFilter === 'PENDING' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setStatusFilter('PENDING')
                    setPage(1)
                  }}
                >
                  Pendentes
                </Button>
                <Button
                  variant={statusFilter === 'COMPLETED' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setStatusFilter('COMPLETED')
                    setPage(1)
                  }}
                >
                  Aprovados
                </Button>
                <Button
                  variant={statusFilter === 'CANCELLED' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setStatusFilter('CANCELLED')
                    setPage(1)
                  }}
                >
                  Rejeitados
                </Button>
                <Button
                  variant={statusFilter === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setStatusFilter('all')
                    setPage(1)
                  }}
                >
                  Todos Status
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-600">Tipo</span>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={tipoFilter === 'manual' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setTipoFilter('manual')
                    setPage(1)
                  }}
                >
                  Manual
                </Button>
                <Button
                  variant={tipoFilter === 'automatico' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setTipoFilter('automatico')
                    setPage(1)
                  }}
                >
                  Automático
                </Button>
                <Button
                  variant={tipoFilter === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setTipoFilter('all')
                    setPage(1)
                  }}
                >
                  Todos Tipos
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

          {showConfig && (
            <div className="mt-3 border-t pt-3">
              {isConfigLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-56" />
                  <Skeleton className="h-6 w-96" />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Saque Automático
                      </p>
                      <p className="text-xs text-gray-500">
                        {saqueAutomatico
                          ? 'Ativado para o sistema'
                          : 'Desativado (tudo manual)'}
                      </p>
                    </div>
                    <Switch
                      checked={saqueAutomatico}
                      onCheckedChange={setSaqueAutomatico}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="sr-only">
                      Limite para automático (R$) — deixe vazio para sem limite
                    </label>
                    <div className="flex items-center gap-3 w-full">
                      <CurrencyInput
                        value={limite}
                        onChange={setLimite}
                        placeholder="0,00"
                        disabled={!saqueAutomatico}
                        className="max-w-xs"
                      />
                      <Button
                        size="sm"
                        icon={<Save size={14} />}
                        className="ml-auto"
                        onClick={() => {
                          const limiteValue =
                            limite.trim() === '' ? null : Number(limite) / 100
                          if (
                            limiteValue !== null &&
                            (isNaN(limiteValue) || limiteValue < 0)
                          ) {
                            toast.error(
                              'Informe um limite válido (ou deixe vazio)',
                            )
                            return
                          }
                          updateConfigMutation.mutate({
                            saque_automatico: saqueAutomatico,
                            limite_saque_automatico: limiteValue,
                          })
                        }}
                        disabled={updateConfigMutation.isPending}
                      >
                        {updateConfigMutation.isPending
                          ? 'Salvando...'
                          : 'Salvar'}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Info size={12} /> Sem limite: todos os saques serão
                      automáticos. Com limite: acima do valor será manual.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4">
          {!hasData ? (
            <div className="py-16 text-center text-gray-600">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-50 flex items-center justify-center">
                  <ArrowUpRight className="text-yellow-400" />
                </div>
              </div>
              <p className="font-medium">Nenhum saque encontrado</p>
              <p className="text-sm text-gray-500 mt-1">
                Não há saques para os filtros selecionados. Tente ajustar os
                filtros ou verificar novamente em alguns instantes.
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
                      Chave PIX
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      Valor
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      Tipo
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      Data
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      Ações
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
                    processedData.items.map((saque) => (
                      <tr
                        key={saque.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {saque.nome_cliente}
                            </div>
                            <div className="text-xs text-gray-500">
                              {saque.documento}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-sm text-gray-600">
                            {saque.pix_key}
                          </div>
                          <div className="text-xs text-gray-500">
                            {saque.pix_type}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatWithdrawalValue(saque.valor_liquido)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Taxa: {formatWithdrawalValue(saque.taxa)}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={getStatusBadgeClasses(saque.status)}>
                            {saque.status_legivel}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-sm text-gray-600">
                            {saque.tipo_processamento}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-600">
                          {formatWithdrawalDate(saque.data)}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <Tooltip content="Ver detalhes">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(saque.id)}
                                className="px-1.5 sm:px-2 md:px-3 border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                aria-label="Ver detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Tooltip>
                            {saque.status === 'PENDING' && (
                              <>
                                <Tooltip content="Aprovar saque">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleApprove(saque.id)}
                                    className="px-1.5 sm:px-2 md:px-3 border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
                                    aria-label="Aprovar saque"
                                    disabled={approveMutation.isPending}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                </Tooltip>
                                <Tooltip content="Rejeitar saque">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReject(saque.id)}
                                    className="px-1.5 sm:px-2 md:px-3 border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    aria-label="Rejeitar saque"
                                    disabled={rejectMutation.isPending}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </Tooltip>
                              </>
                            )}
                          </div>
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

      <WithdrawalDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false)
          setDetailsId(null)
        }}
        withdrawalId={detailsId}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <Dialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={
          confirmAction?.type === 'approve'
            ? 'Confirmar aprovação'
            : 'Confirmar rejeição'
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancelar
            </Button>
            {confirmAction?.type === 'reject' ? (
              <Button
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={async () => {
                  if (!confirmAction) return
                  try {
                    await rejectMutation.mutateAsync(confirmAction.id)
                    setConfirmAction(null)
                  } catch (error) {
                    // Erro já é tratado pela mutation
                  }
                }}
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? 'Rejeitando...' : 'Rejeitar'}
              </Button>
            ) : (
              <Button
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
                onClick={async () => {
                  if (!confirmAction) return
                  try {
                    await approveMutation.mutateAsync(confirmAction.id)
                    setConfirmAction(null)
                  } catch (error) {
                    // Erro já é tratado pela mutation
                  }
                }}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? 'Aprovando...' : 'Aprovar'}
              </Button>
            )}
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          {confirmAction?.type === 'approve'
            ? 'Tem certeza que deseja aprovar este saque? Esta ação irá processar o pagamento.'
            : 'Tem certeza que deseja rejeitar este saque? O valor será devolvido ao saldo do usuário.'}
        </p>
      </Dialog>
    </div>
  )
})

export default AprovarSaquesPage
