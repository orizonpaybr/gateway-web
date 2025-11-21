'use client'

import { memo, useCallback, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { CurrencyInput } from '@/components/ui/CurrencyInput'
import { Dialog } from '@/components/ui/Dialog'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Badge } from '@/components/ui/Badge'
import { useDebounce } from '@/hooks/useDebounce'
import { useAdminUsers } from '@/hooks/useAdminDashboard'
import { useWithdrawalsFinancial } from '@/hooks/useFinancial'
import { useManualWithdrawalForm } from '@/hooks/useManualWithdrawalForm'
import { formatCurrencyBRL } from '@/lib/format'
import { formatTransactionDateTime } from '@/lib/helpers/financialUtils'
import { USER_PERMISSION } from '@/lib/constants'
import {
  QUICK_WITHDRAWAL_AMOUNTS,
  WITHDRAWALS_LIST_CONFIG,
  DEBOUNCE_DELAYS,
  MODAL_CONFIG,
} from '@/lib/constants/manualTransactions'
import { useAuth } from '@/contexts/AuthContext'
import {
  ClipboardList,
  Loader2,
  MinusCircle,
  RotateCcw,
  Search,
  ShieldCheck,
} from 'lucide-react'

const getStatusVariant = (status: string) => {
  const normalized = status.toLowerCase()
  if (normalized.includes('paid') || normalized.includes('complete')) {
    return 'success'
  }
  if (normalized.includes('pending')) {
    return 'warning'
  }
  if (normalized.includes('cancel') || normalized.includes('reject')) {
    return 'error'
  }
  return 'info'
}

const CriarTransacoesSaidaPage = memo(function CriarTransacoesSaidaPage() {
  const { user, authReady } = useAuth()
  const isAdmin = useMemo(
    () => Number(user?.permission) === USER_PERMISSION.ADMIN,
    [user],
  )

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const debouncedUserSearch = useDebounce(
    userSearch,
    DEBOUNCE_DELAYS.userSearch,
  )
  const [withdrawalsPage, setWithdrawalsPage] = useState(1)
  const [withdrawalsStatusFilter, setWithdrawalsStatusFilter] = useState<
    'all' | 'COMPLETED' | 'PENDING' | 'CANCELLED'
  >(WITHDRAWALS_LIST_CONFIG.defaultStatus)
  const [withdrawalsSearch, setWithdrawalsSearch] = useState('')
  const debouncedWithdrawalsSearch = useDebounce(
    withdrawalsSearch,
    DEBOUNCE_DELAYS.withdrawalsSearch,
  )

  // Hook customizado para gerenciar o formulário
  const form = useManualWithdrawalForm({
    onSuccess: () => {
      setIsModalOpen(false)
      refetchRecentWithdrawals()
    },
  })

  const { data: userList, isLoading: isLoadingUsers } = useAdminUsers(
    {
      search: debouncedUserSearch || undefined,
      per_page: MODAL_CONFIG.userSearchLimit,
    },
    isModalOpen && isAdmin,
  )

  const {
    data: recentWithdrawalsResponse,
    isLoading: isLoadingRecent,
    refetch: refetchRecentWithdrawals,
  } = useWithdrawalsFinancial(
    {
      page: withdrawalsPage,
      limit: WITHDRAWALS_LIST_CONFIG.perPage,
      ...(withdrawalsStatusFilter !== 'all' && {
        status: withdrawalsStatusFilter,
      }),
      ...(debouncedWithdrawalsSearch && { busca: debouncedWithdrawalsSearch }),
    },
    isAdmin,
  )

  const recentWithdrawals = useMemo(
    () => recentWithdrawalsResponse?.data?.data ?? [],
    [recentWithdrawalsResponse],
  )
  const withdrawalsPagination = recentWithdrawalsResponse?.data
  const canPrevWithdrawals = (withdrawalsPagination?.current_page || 1) > 1
  const canNextWithdrawals =
    (withdrawalsPagination?.current_page || 1) <
    (withdrawalsPagination?.last_page || 1)

  const userOptions = useMemo(
    () =>
      userList?.users.map((item) => ({
        value: item.user_id,
        label: `${item.name} • ${item.username}`,
      })) ?? [],
    [userList],
  )

  const closeModal = useCallback(() => {
    if (form.isSubmitting) {
      return
    }
    setIsModalOpen(false)
    setUserSearch('')
    form.resetForm()
  }, [form])

  if (!authReady) {
    return (
      <div className="p-6 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card className="border border-red-100 bg-red-50">
          <h1 className="text-xl font-semibold text-red-700 mb-2">
            Acesso restrito
          </h1>
          <p className="text-sm text-red-600">
            Apenas administradores podem criar transações manuais.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <MinusCircle className="text-primary" size={28} />
            <h1 className="text-2xl font-bold text-gray-900">
              Criar Transações de Saída
            </h1>
          </div>
          <p className="text-sm text-gray-600">
            Realize saques manuais debitando saldo dos usuários com o mesmo
            cálculo de taxas aplicado no restante do sistema.
          </p>
        </div>
        <Button
          icon={<MinusCircle size={18} />}
          onClick={() => setIsModalOpen(true)}
        >
          Nova Saída
        </Button>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">
              Como funciona
            </h2>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                <strong>Valor líquido:</strong> O usuário receberá exatamente o
                valor solicitado
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                <strong>Taxa aplicada:</strong> Calculada conforme as regras do
                sistema (percentual + taxa PIX)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                <strong>Débito total:</strong> Valor do saque + taxa será
                descontado do saldo do usuário
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                <strong>Status automático:</strong> Todas as saídas manuais são
                criadas com status <strong>PAID_OUT</strong>
              </span>
            </li>
          </ul>
        </div>
      </Card>

      <Card className="border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="text-gray-500" size={20} />
              <h2 className="text-lg font-bold text-gray-900">
                Saques recentes
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<RotateCcw size={16} />}
              onClick={() => refetchRecentWithdrawals()}
              disabled={isLoadingRecent}
              className="text-gray-600 hover:text-primary"
            >
              Atualizar
            </Button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pesquisar
            </label>
            <Input
              placeholder="Buscar por cliente, ID da transação..."
              value={withdrawalsSearch}
              onChange={(e) => setWithdrawalsSearch(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="space-y-2 mb-4">
            <span className="text-xs font-semibold text-gray-600">Status</span>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={
                  withdrawalsStatusFilter === 'all' ? 'primary' : 'outline'
                }
                size="sm"
                onClick={() => setWithdrawalsStatusFilter('all')}
              >
                Todos
              </Button>
              <Button
                variant={
                  withdrawalsStatusFilter === 'COMPLETED'
                    ? 'primary'
                    : 'outline'
                }
                size="sm"
                onClick={() => setWithdrawalsStatusFilter('COMPLETED')}
              >
                Completo
              </Button>
              <Button
                variant={
                  withdrawalsStatusFilter === 'PENDING' ? 'primary' : 'outline'
                }
                size="sm"
                onClick={() => setWithdrawalsStatusFilter('PENDING')}
              >
                Pendente
              </Button>
              <Button
                variant={
                  withdrawalsStatusFilter === 'CANCELLED'
                    ? 'primary'
                    : 'outline'
                }
                size="sm"
                onClick={() => setWithdrawalsStatusFilter('CANCELLED')}
              >
                Cancelado
              </Button>
            </div>
          </div>

          {isLoadingRecent ? (
            <div className="flex items-center justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : recentWithdrawals.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {recentWithdrawals.map((withdrawal) => (
                <li
                  key={withdrawal.id}
                  className="py-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {withdrawal.cliente_nome || 'Usuário'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTransactionDateTime(withdrawal.data)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusVariant(withdrawal.status)}>
                      {withdrawal.status_legivel || withdrawal.status}
                    </Badge>
                    <span className="text-sm font-semibold text-gray-900">
                      -{formatCurrencyBRL(withdrawal.valor_total)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-10">
              Nenhum saque recente encontrado.
            </p>
          )}

          {withdrawalsPagination && withdrawalsPagination.total > 0 && (
            <div className="mt-4 flex flex-col items-center gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-gray-600 text-center md:text-left">
                Página{' '}
                <span className="font-medium">
                  {withdrawalsPagination.current_page}
                </span>{' '}
                de{' '}
                <span className="font-medium">
                  {withdrawalsPagination.last_page}
                </span>{' '}
                • Total:{' '}
                <span className="font-medium">
                  {withdrawalsPagination.total}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canPrevWithdrawals}
                  onClick={() =>
                    canPrevWithdrawals && setWithdrawalsPage((p) => p - 1)
                  }
                >
                  {'<'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canNextWithdrawals}
                  onClick={() =>
                    canNextWithdrawals && setWithdrawalsPage((p) => p + 1)
                  }
                >
                  {'>'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Dialog
        open={isModalOpen}
        onClose={closeModal}
        title="Criar Nova Saída Manual"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button
              onClick={form.handleSubmit}
              disabled={form.isSubmitting}
              icon={
                form.isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : undefined
              }
            >
              Criar Saque
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <Input
              label="Buscar usuário"
              placeholder="Nome, username ou ID do usuário"
              icon={<Search size={16} />}
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
            {isLoadingUsers ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <LoadingSpinner size="sm" />
                Carregando usuários...
              </div>
            ) : null}
            <Select
              label="Selecionar usuário"
              placeholder="Selecione um usuário"
              options={userOptions}
              value={form.selectedUserId}
              onChange={form.setSelectedUserId}
              error={form.formErrors.user}
            />
          </div>

          <CurrencyInput
            label="Valor do saque"
            value={form.amount}
            onChange={form.setAmount}
            error={form.formErrors.amount}
          />

          <div className="flex flex-wrap gap-2">
            {QUICK_WITHDRAWAL_AMOUNTS.map((item) => (
              <Button
                key={item.value}
                variant="ghost"
                size="sm"
                type="button"
                className="border border-gray-200 text-gray-700 bg-gray-50 hover:bg-primary hover:text-white"
                onClick={() => form.setAmount(String(item.value))}
              >
                {item.label}
              </Button>
            ))}
          </div>

          <Input
            label="Descrição (opcional)"
            placeholder="Ex: pagamento ao usuário"
            value={form.description}
            onChange={(event) => form.setDescription(event.target.value)}
          />

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-900 mb-2">
              Revisão antes de confirmar
            </p>
            <p>
              O usuário receberá o valor solicitado e o sistema debitará o valor
              total (saque + taxas) do saldo disponível. A operação ficará
              registrada no histórico financeiro com o status{' '}
              <strong>PAID_OUT</strong>.
            </p>
          </div>
        </div>
      </Dialog>
    </div>
  )
})

export default CriarTransacoesSaidaPage
