'use client'

import { memo, useCallback, useMemo, useState } from 'react'

import {
  ClipboardList,
  Info,
  Loader2,
  PlusCircle,
  RotateCcw,
  Search,
  ShieldCheck,
} from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CurrencyInput } from '@/components/ui/CurrencyInput'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/contexts/AuthContext'
import { useAdminUsers } from '@/hooks/useAdminDashboard'
import { useDebounce } from '@/hooks/useDebounce'
import { useDeposits } from '@/hooks/useFinancial'
import { useManualDepositForm } from '@/hooks/useManualDepositForm'
import { USER_PERMISSION } from '@/lib/constants'
import {
  QUICK_DEPOSIT_AMOUNTS,
  DEPOSITS_LIST_CONFIG,
  DEBOUNCE_DELAYS,
  MODAL_CONFIG,
} from '@/lib/constants/manualTransactions'
import { formatCurrencyBRL } from '@/lib/format'
import { formatTransactionDateTime } from '@/lib/helpers/financialUtils'

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

const CriarTransacoesEntradaPage = memo(() => {
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
  const [depositsPage, setDepositsPage] = useState(1)
  const [depositsStatusFilter, setDepositsStatusFilter] = useState<
    'all' | 'PAID_OUT' | 'PENDING' | 'CANCELLED'
  >(DEPOSITS_LIST_CONFIG.defaultStatus)
  const [depositsSearch, setDepositsSearch] = useState('')
  const debouncedDepositsSearch = useDebounce(
    depositsSearch,
    DEBOUNCE_DELAYS.depositsSearch,
  )

  const form = useManualDepositForm({
    onSuccess: () => {
      setIsModalOpen(false)
      refetchRecentDeposits()
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
    data: recentDepositsResponse,
    isLoading: isLoadingRecent,
    refetch: refetchRecentDeposits,
  } = useDeposits(
    {
      page: depositsPage,
      limit: DEPOSITS_LIST_CONFIG.perPage,
      ...(depositsStatusFilter !== 'all' && { status: depositsStatusFilter }),
      ...(debouncedDepositsSearch && { busca: debouncedDepositsSearch }),
    },
    isAdmin,
  )

  const recentDeposits = useMemo(
    () => recentDepositsResponse?.data?.data ?? [],
    [recentDepositsResponse],
  )
  const depositsPagination = recentDepositsResponse?.data
  const canPrevDeposits = (depositsPagination?.current_page || 1) > 1
  const canNextDeposits =
    (depositsPagination?.current_page || 1) <
    (depositsPagination?.last_page || 1)

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
            <PlusCircle className="text-primary" size={28} />
            <h1 className="text-2xl font-bold text-gray-900">
              Criar Transações de Entrada
            </h1>
          </div>
          <p className="text-sm text-gray-600">
            Gere créditos imediatos para usuários com o mesmo cálculo de taxas
            aplicado no restante do sistema.
          </p>
        </div>
        <Button
          icon={<PlusCircle size={18} />}
          onClick={() => setIsModalOpen(true)}
        >
          Nova Entrada
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <Info className="text-blue-500" size={24} />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Como funciona
              </h2>
              <p className="text-sm text-gray-600">
                Essas transações replicam a lógica dos depósitos aprovados pela
                adquirente.
              </p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
            <li>As taxas são calculadas automaticamente pelo Taxa Flexível.</li>
            <li>O saldo líquido é creditado imediatamente ao usuário.</li>
            <li>
              Toda criação é registrada em <strong>Solicitações</strong> com
              status <strong>PAID_OUT</strong>.
            </li>
            <li>
              Use descrições para identificar ajustes, premiações ou estornos.
            </li>
          </ul>
        </Card>

        <Card className="border border-green-100">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="text-green-500" size={24} />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Boas práticas
              </h2>
              <p className="text-sm text-gray-600">
                Alguns cuidados para manter consistência financeira.
              </p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
            <li>Valide a identidade do usuário antes de creditar valores.</li>
            <li>Utilize valores padronizados nos atalhos para evitar erros.</li>
            <li>Documente a operação na descrição.</li>
            <li>Sincronize com sua equipe de suporte quando necessário.</li>
          </ul>
        </Card>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="text-gray-500" size={20} />
            <h2 className="text-lg font-bold text-gray-900">
              Depósitos recentes
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw size={16} />}
            onClick={() => refetchRecentDeposits()}
            disabled={isLoadingRecent}
            className="text-gray-600 hover:text-primary"
          >
            Atualizar
          </Button>
        </div>

        <div className="space-y-4 mb-4">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-600">Buscar</span>
            <Input
              placeholder="Nome, documento ou descrição..."
              value={depositsSearch}
              onChange={(event) => {
                setDepositsSearch(event.target.value)
                setDepositsPage(1)
              }}
            />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-600">Status</span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Todos', value: 'all' },
                { label: 'Pago', value: 'PAID_OUT' },
                { label: 'Pendente', value: 'PENDING' },
                { label: 'Cancelado', value: 'CANCELLED' },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={
                    depositsStatusFilter === option.value
                      ? 'primary'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() => {
                    setDepositsStatusFilter(
                      option.value as typeof depositsStatusFilter,
                    )
                    setDepositsPage(1)
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {isLoadingRecent ? (
          <div className="flex items-center justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : recentDeposits.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {recentDeposits.map((deposit) => (
              <li
                key={deposit.id}
                className="py-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {deposit.cliente_nome || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTransactionDateTime(deposit.data)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={getStatusVariant(deposit.status)}>
                    {deposit.status_legivel || deposit.status}
                  </Badge>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrencyBRL(deposit.valor_total)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-10 text-center text-sm text-gray-500">
            Nenhuma transação encontrada.
          </div>
        )}

        <div className="mt-4 flex flex-col items-center gap-3 xl:flex-row xl:items-center xl:justify-between text-sm text-gray-600">
          <span>
            Página {depositsPagination?.current_page ?? 1} de{' '}
            {depositsPagination?.last_page ?? 1}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!canPrevDeposits}
              onClick={() => {
                if (canPrevDeposits) {
                  setDepositsPage((prev) => Math.max(prev - 1, 1))
                }
              }}
            >
              {'<'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!canNextDeposits}
              onClick={() => {
                if (canNextDeposits) {
                  setDepositsPage((prev) => prev + 1)
                }
              }}
            >
              {'>'}
            </Button>
          </div>
        </div>
      </Card>

      <Dialog
        open={isModalOpen}
        onClose={closeModal}
        title="Novo depósito manual"
        size="lg"
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
              Adicionar
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="space-y-3">
            <Input
              label="Buscar usuário"
              placeholder="Digite nome, username ou ID..."
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              icon={<Search size={16} />}
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
            label="Valor"
            value={form.amount}
            onChange={form.setAmount}
            error={form.formErrors.amount}
          />

          <div className="flex flex-wrap gap-2">
            {QUICK_DEPOSIT_AMOUNTS.map((item) => (
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
            placeholder="Ex: bônus de performance"
            value={form.description}
            onChange={(event) => form.setDescription(event.target.value)}
          />

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-900 mb-2">
              Revisão antes de confirmar
            </p>
            <p>
              O usuário receberá o valor líquido após taxas. A operação ficará
              registrada no histórico financeiro com o status{' '}
              <strong>PAID_OUT</strong>.
            </p>
          </div>
        </div>
      </Dialog>
    </div>
  )
})

export default CriarTransacoesEntradaPage
