'use client'

import { memo } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useWithdrawalDetails } from '@/hooks/useWithdrawals'
import { formatCurrencyBRL, formatDateTimeBR } from '@/lib/format'
import { getStatusBadgeClasses } from '@/lib/helpers/withdrawalUtils'
import {
  User,
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Hash,
  Calendar,
} from 'lucide-react'

interface WithdrawalDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  withdrawalId: number | null
  onApprove?: (id: number) => void
  onReject?: (id: number) => void
}

export const WithdrawalDetailsModal = memo(function WithdrawalDetailsModal({
  isOpen,
  onClose,
  withdrawalId,
  onApprove,
  onReject,
}: WithdrawalDetailsModalProps) {
  const { data, isLoading } = useWithdrawalDetails(withdrawalId, isOpen)

  const saque = data?.data

  return (
    <Dialog open={isOpen} onClose={onClose} title="Detalhes do Saque" size="md">
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : saque ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <DollarSign size={20} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Valor
                  </span>
                </div>
                <div className="space-y-0.5">
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrencyBRL(saque.amount)}
                  </div>
                  <div className="text-xs text-gray-600">
                    Líquido:{' '}
                    <span className="font-medium">
                      {formatCurrencyBRL(saque.valor_liquido)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Taxa:{' '}
                    <span className="font-medium">
                      {formatCurrencyBRL(saque.taxa)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Clock size={20} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Status
                  </span>
                </div>
                <div className="space-y-1.5">
                  <span className={getStatusBadgeClasses(saque.status)}>
                    {saque.status_legivel}
                  </span>
                  <div className="text-xs text-gray-600">
                    Tipo:{' '}
                    <span className="font-medium">
                      {saque.tipo_processamento}
                    </span>
                  </div>
                  {saque.executor && (
                    <div className="text-[11px] text-gray-500">
                      Executor: {saque.executor}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center gap-2 mb-2">
                <User size={20} className="text-gray-600" />
                <h3 className="font-semibold text-gray-900 text-sm">
                  Informações do Cliente
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-600">Nome</label>
                  <p className="text-sm font-medium text-gray-900">
                    {saque.nome_cliente}
                  </p>
                </div>
                <div>
                  <label className="text-[11px] text-gray-600">Documento</label>
                  <p className="text-sm font-medium text-gray-900">
                    {saque.documento}
                  </p>
                </div>
                <div>
                  <label className="text-[11px] text-gray-600">Usuário</label>
                  <p className="text-sm font-medium text-gray-900">
                    {saque.username}
                  </p>
                </div>
                <div>
                  <label className="text-[11px] text-gray-600">Email</label>
                  <p className="text-sm font-medium text-gray-900">
                    {saque.email}
                  </p>
                </div>
                <div>
                  <label className="text-[11px] text-gray-600">
                    Saldo do Usuário
                  </label>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrencyBRL(saque.user_balance)}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard size={20} className="text-gray-600" />
                <h3 className="font-semibold text-gray-900 text-sm">
                  Informações PIX
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-600">Chave PIX</label>
                  <p className="text-sm font-medium text-gray-900 break-all">
                    {saque.pix_key}
                  </p>
                </div>
                <div>
                  <label className="text-[11px] text-gray-600">
                    Tipo de Chave
                  </label>
                  <p className="text-sm font-medium text-gray-900">
                    {saque.pix_type}
                  </p>
                </div>
                {saque.end_to_end && (
                  <div className="md:col-span-2">
                    <label className="text-[11px] text-gray-600">
                      End to End
                    </label>
                    <p className="text-sm font-medium text-gray-900 break-all">
                      {saque.end_to_end}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center gap-2 mb-2">
                <Hash size={20} className="text-gray-600" />
                <h3 className="font-semibold text-gray-900 text-sm">
                  Informações da Transação
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-600">ID</label>
                  <p className="text-sm font-medium text-gray-900">
                    #{saque.id}
                  </p>
                </div>
                <div>
                  <label className="text-[11px] text-gray-600">
                    Transaction ID
                  </label>
                  <p className="text-sm font-medium text-gray-900 break-all">
                    {saque.transaction_id}
                  </p>
                </div>
                {saque.id_transaction_gateway && (
                  <div className="md:col-span-2">
                    <label className="text-[11px] text-gray-600">
                      ID Gateway
                    </label>
                    <p className="text-sm font-medium text-gray-900 break-all">
                      {saque.id_transaction_gateway}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-[11px] text-gray-600">Descrição</label>
                  <p className="text-sm font-medium text-gray-900">
                    {saque.descricao}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={20} className="text-gray-600" />
                <h3 className="font-semibold text-gray-900 text-sm">Datas</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-gray-600">
                    Data do Saque
                  </label>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDateTimeBR(saque.data)}
                  </p>
                </div>
                <div>
                  <label className="text-[11px] text-gray-600">Criado em</label>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDateTimeBR(saque.created_at)}
                  </p>
                </div>
                <div>
                  <label className="text-[11px] text-gray-600">
                    Atualizado em
                  </label>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDateTimeBR(saque.updated_at)}
                  </p>
                </div>
              </div>
            </div>

            {saque.status === 'PENDING' && (onApprove || onReject) && (
              <div className="border-t pt-3">
                <div className="flex items-center justify-end gap-3">
                  {onReject && (
                    <Button
                      variant="outline"
                      icon={<XCircle size={18} />}
                      onClick={() => {
                        onReject(saque.id)
                        onClose()
                      }}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Rejeitar
                    </Button>
                  )}
                  {onApprove && (
                    <Button
                      variant="primary"
                      icon={<CheckCircle size={18} />}
                      onClick={() => {
                        onApprove(saque.id)
                        onClose()
                      }}
                    >
                      Aprovar
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-8 text-center text-gray-600">
            <p>Saque não encontrado</p>
          </div>
        )}
      </div>
    </Dialog>
  )
})
