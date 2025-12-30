'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertCircle, Calendar, DollarSign, Hash, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { pixAPI } from '@/lib/api'
import { formatCurrencyBRL, formatDateTimeBR } from '@/lib/format'
interface InfracaoDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  infracaoId: number | null
}
interface InfracaoDetails {
  id: number
  status: string
  data_criacao: string
  data_limite: string
  valor: number
  end_to_end: string
  tipo: string
  descricao: string
  detalhes: string
  transacao_relacionada?: {
    id: number
    transaction_id: string
    valor: number
    data: string
  }
  created_at: string
  updated_at: string
}

export function InfracaoDetailsModal({
  isOpen,
  onClose,
  infracaoId,
}: InfracaoDetailsModalProps) {
  const [infracao, setInfracao] = useState<InfracaoDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchInfracaoDetails = useCallback(async () => {
    if (!infracaoId) {
      return
    }

    setIsLoading(true)
    try {
      const response = await pixAPI.getInfracao(infracaoId.toString())
      if (response?.success) {
        setInfracao(response.data)
      } else {
        toast.error('Erro ao carregar detalhes da infração')
        onClose()
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da infração:', error)
      toast.error('Erro ao carregar detalhes da infração')
      onClose()
    } finally {
      setIsLoading(false)
    }
  }, [infracaoId, onClose])

  useEffect(() => {
    if (isOpen && infracaoId) {
      fetchInfracaoDetails()
    }
  }, [isOpen, infracaoId, fetchInfracaoDetails])

  const formatCurrency = formatCurrencyBRL
  const formatDate = formatDateTimeBR

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolvida':
        return 'bg-green-100 text-green-700'
      case 'em análise':
        return 'bg-yellow-100 text-yellow-700'
      case 'pendente':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const handleClose = () => {
    setInfracao(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} size="lg">
      <div className="flex items-center gap-3 mb-6 overflow-hidden">
        <div className="p-2 bg-red-100 rounded-lg">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Detalhes da Infração
          </h2>
          <p className="text-sm text-gray-600">
            Informações completas sobre a infração
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : infracao ? (
        <div className="space-y-6 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Status:
                </span>
              </div>
              <span
                className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                  infracao.status,
                )}`}
              >
                {infracao.status}
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Tipo:</span>
              </div>
              <span className="text-sm text-gray-900">{infracao.tipo}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Data de Criação:
                </span>
              </div>
              <span className="text-sm text-gray-900">
                {formatDate(infracao.data_criacao)}
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Data Limite:
                </span>
              </div>
              <span className="text-sm text-gray-900">
                {formatDate(infracao.data_limite)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Valor:
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(infracao.valor)}
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  End to End:
                </span>
              </div>
              <span
                className="text-sm text-gray-900 font-mono break-all block max-w-full"
                title={infracao.end_to_end}
              >
                {infracao.end_to_end}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Descrição:
              </span>
            </div>
            <p className="text-sm text-gray-900">{infracao.descricao}</p>
          </div>

          {infracao.detalhes && (
            <div className="bg-gray-50 rounded-lg p-4 overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Detalhes Adicionais:
                </span>
              </div>
              <pre className="text-sm text-gray-900 whitespace-pre-wrap break-words break-all overflow-wrap-anywhere font-mono max-w-full overflow-hidden w-full">
                {(() => {
                  try {
                    const parsed = JSON.parse(infracao.detalhes)
                    return JSON.stringify(parsed, null, 2)
                  } catch {
                    return infracao.detalhes
                  }
                })()}
              </pre>
            </div>
          )}

          {infracao.transacao_relacionada && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Hash className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Transação Relacionada
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-600">ID:</span>
                  <span className="text-sm text-blue-900">
                    {infracao.transacao_relacionada.transaction_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-600">Valor:</span>
                  <span className="text-sm text-blue-900">
                    {formatCurrency(infracao.transacao_relacionada.valor)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-600">Data:</span>
                  <span className="text-sm text-blue-900">
                    {formatDate(infracao.transacao_relacionada.data)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Erro ao carregar detalhes da infração</p>
        </div>
      )}

      <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={handleClose}>
          Fechar
        </Button>
      </div>
    </Dialog>
  )
}
