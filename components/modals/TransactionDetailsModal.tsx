'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Dialog } from '@/components/ui/Dialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { transactionsAPI } from '@/lib/api'
import {
  formatCurrencyBRL,
  formatDateTimeBR,
  formatDocumentBR,
} from '@/lib/format'
interface TransactionData {
  transaction_id?: string
  tipo?: string
  status_legivel?: string
  data?: string | Date
  amount?: number
  taxa?: number
  valor_liquido?: number
  origem?: {
    nome?: string
    documento?: string
  }
  destino?: {
    nome?: string
    documento?: string
  }
  codigo_autenticacao?: string
  end_to_end?: string
  pix_key?: string
  pix_key_type?: string
  adquirente?: string
  descricao?: string
}

interface TransactionDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  transactionId: string | number | null
}

export function TransactionDetailsModal({
  isOpen,
  onClose,
  transactionId,
}: TransactionDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<TransactionData | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (!transactionId) {
      return
    }
    let ignore = false
    const fetchDetails = async () => {
      setIsLoading(true)
      try {
        const res = await transactionsAPI.getById(String(transactionId))
        if (!ignore) {
          if (res?.success) {
            setData(res.data)
          } else {
            toast.error('Não foi possível carregar detalhes da transação')
            onClose()
          }
        }
      } catch (e) {
        if (!ignore) {
          toast.error('Erro ao carregar detalhes da transação')
          onClose()
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }
    fetchDetails()
    return () => {
      ignore = true
    }
  }, [isOpen, transactionId, onClose])

  const formatCurrency = formatCurrencyBRL
  const formatDate = formatDateTimeBR
  const formatDocument = formatDocumentBR

  const handleClose = () => {
    setData(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} size="lg">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Detalhes da Transação
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-600">Transação</p>
                <p className="text-sm font-mono break-all">
                  {data.transaction_id || '---'}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Tipo:{' '}
                  <span className="font-medium capitalize">
                    {data.tipo || '---'}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Status:{' '}
                  <span className="font-medium">
                    {data.status_legivel || '---'}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Data:{' '}
                  <span className="font-medium">
                    {data.data ? formatDate(data.data) : '---'}
                  </span>
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-600">Valores</p>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Bruto</span>
                  <span className="font-semibold">
                    {formatCurrency(data.amount ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Taxa</span>
                  <span className="font-semibold text-red-600">
                    - {formatCurrency(data.taxa ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-base border-t border-gray-200 pt-2 mt-2">
                  <span className="font-semibold text-gray-900">Líquido</span>
                  <span
                    className={
                      data.tipo === 'deposito'
                        ? 'font-bold text-green-600'
                        : 'font-bold text-red-600'
                    }
                  >
                    {formatCurrency(data.valor_liquido ?? 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-600">Origem:</p>
                <p className="text-sm font-semibold text-gray-900">
                  {data.origem?.nome || '---'}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDocument(data.origem?.documento || '')}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-600">Destino:</p>
                <p className="text-sm font-semibold text-gray-900">
                  {data.destino?.nome || '---'}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDocument(data.destino?.documento || '')}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50">
              <p className="text-xs text-gray-600">Código de Autenticação:</p>
              <p className="text-sm font-mono break-all">
                {data.codigo_autenticacao || '---'}
              </p>
              {data.end_to_end && (
                <p className="text-sm text-gray-600 mt-2">
                  EndToEndID:{' '}
                  <span className="font-mono">{data.end_to_end}</span>
                </p>
              )}
              {data.pix_key && (
                <p className="text-sm text-gray-600">
                  Chave PIX: <span className="font-mono">{data.pix_key}</span>
                  {data.pix_key_type && ` (${data.pix_key_type})`}
                </p>
              )}
              <p className="text-sm text-gray-600 mt-2">
                Adquirente:{' '}
                <span className="font-medium">{data.adquirente || '---'}</span>
              </p>
              <p className="text-sm text-gray-600">
                Descrição:{' '}
                <span className="font-medium">{data.descricao || '---'}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">Dados não disponíveis.</div>
        )}
      </div>
    </Dialog>
  )
}
