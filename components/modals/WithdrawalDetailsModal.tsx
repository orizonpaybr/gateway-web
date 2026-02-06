'use client'

import { memo } from 'react'
import {
  User,
  CreditCard,
  DollarSign,
  CheckCircle,
  XCircle,
  Hash,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { useWithdrawalDetails } from '@/hooks/useWithdrawals'
import { formatCurrencyBRL, formatDateTimeBR } from '@/lib/format'
interface WithdrawalDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  withdrawalId: number | null
  onApprove?: (id: number) => void
  onReject?: (id: number) => void
}

export const WithdrawalDetailsModal = memo(
  ({
    isOpen,
    onClose,
    withdrawalId,
    onApprove,
    onReject,
  }: WithdrawalDetailsModalProps) => {
    const { data, isLoading } = useWithdrawalDetails(withdrawalId, isOpen)

    const saque = data?.data

    return (
      <Dialog
        open={isOpen}
        onClose={onClose}
        title="Detalhes do Saque"
        size="md"
      >
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : saque ? (
            <>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={20} className="text-gray-600 shrink-0" />
                  <span className="text-sm font-semibold text-gray-700">
                    Valor
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrencyBRL(saque.amount)}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-600">
                    <span>Líquido: <span className="font-medium text-gray-800">{formatCurrencyBRL(saque.valor_liquido)}</span></span>
                    <span>Taxa: <span className="font-medium text-gray-800">{formatCurrencyBRL(saque.taxa)}</span></span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <User size={20} className="text-gray-600 shrink-0" />
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Informações do Cliente
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-500">Nome:</span>
                    <p className="text-sm font-medium text-gray-900">
                      {saque.nome_cliente}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-500">Documento:</span>
                    <p className="text-sm font-medium text-gray-900">
                      {saque.documento}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-500">Email:</span>
                    <p className="text-sm font-medium text-gray-900 break-all">
                      {saque.email}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-500">Saldo do Usuário:</span>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrencyBRL(saque.user_balance)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={20} className="text-gray-600 shrink-0" />
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Informações PIX
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-500">Chave PIX:</span>
                    <p className="text-sm font-medium text-gray-900 break-all">
                      {saque.pix_key}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-500">Tipo de Chave:</span>
                    <p className="text-sm font-medium text-gray-900">
                      {saque.pix_type}
                    </p>
                  </div>
                  {saque.end_to_end && (
                    <div className="md:col-span-2 flex flex-col gap-0.5">
                      <span className="text-xs text-gray-500">End to End:</span>
                      <p className="text-sm font-medium text-gray-900 break-all">
                        {saque.end_to_end}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Hash size={20} className="text-gray-600 shrink-0" />
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Informações da Transação
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-500">ID:</span>
                    <p className="text-sm font-medium text-gray-900">
                      #{saque.id}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-500">Transaction ID:</span>
                    <p className="text-sm font-medium text-gray-900 break-all">
                      {saque.transaction_id}
                    </p>
                  </div>
                  {saque.id_transaction_gateway && (
                    <div className="md:col-span-2 flex flex-col gap-0.5">
                      <span className="text-xs text-gray-500">ID Gateway:</span>
                      <p className="text-sm font-medium text-gray-900 break-all">
                        {saque.id_transaction_gateway}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={20} className="text-gray-600 shrink-0" />
                  <h3 className="font-semibold text-gray-900 text-sm">Datas</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-500">Data do Saque:</span>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDateTimeBR(saque.data)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-500">Criado em:</span>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDateTimeBR(saque.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-500">Atualizado em:</span>
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
  },
)
