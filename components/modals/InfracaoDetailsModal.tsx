'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  AlertCircle,
  Calendar,
  DollarSign,
  Hash,
  FileText,
  ShieldCheck,
  Info,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { pixAPI } from '@/lib/api'
import { useInvalidateQueries } from '@/hooks/useReactQuery'
import { formatCurrencyBRL, formatDateTimeBR } from '@/lib/format'

type DetalheAdicional = { label: string; value: string }

interface InfracaoDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  infracaoId: number | null
}

interface InfracaoDetails {
  id: number
  status: string
  desfecho_titulo?: string | null
  desfecho_mensagem?: string | null
  favoravel_lojista?: boolean | null
  data_criacao: string
  data_limite: string
  valor: number
  end_to_end: string
  tipo: string
  tipo_legivel?: string
  descricao: string
  detalhes: string
  detalhes_adicionais?: DetalheAdicional[]
  pode_apresentar_defesa?: boolean
  defesa_enviada_para?: string
  provider?: string
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
  const [defenseText, setDefenseText] = useState('')
  const [defenseFiles, setDefenseFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { invalidatePixInfracoes } = useInvalidateQueries()

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
    if (!isOpen) {
      setDefenseText('')
      setDefenseFiles([])
    }
  }, [isOpen, infracaoId, fetchInfracaoDetails])

  const tipoLegivel = infracao?.tipo_legivel ?? infracao?.tipo ?? ''

  const detalhesAdicionais: DetalheAdicional[] =
    infracao?.detalhes_adicionais ?? []

  const desfecho =
    infracao?.desfecho_titulo && infracao?.desfecho_mensagem
      ? {
          titulo: infracao.desfecho_titulo,
          mensagem: infracao.desfecho_mensagem,
          favoravel_lojista: infracao.favoravel_lojista ?? null,
        }
      : null

  const canDefend = useMemo(() => {
    if (infracao?.pode_apresentar_defesa !== undefined) {
      return infracao.pode_apresentar_defesa
    }
    const s = (infracao?.status || '').toLowerCase()
    return ['pendente', 'em análise', 'em analise'].includes(s)
  }, [infracao])

  const acquirerLabel = useMemo(() => {
    if (infracao?.defesa_enviada_para) {
      const match = infracao.defesa_enviada_para.match(/^([^(]+)/)
      if (match?.[1]) {
        return match[1].trim()
      }
    }
    if (infracao?.provider === 'fluxpayments') {
      return 'FluxPayments'
    }
    return 'Treeal'
  }, [infracao?.defesa_enviada_para, infracao?.provider])

  const handleSubmitDefense = useCallback(async () => {
    if (!infracaoId) {
      return
    }
    if (defenseText.trim().length < 3) {
      toast.error('Descreva a defesa com pelo menos 3 caracteres.')
      return
    }

    setIsSubmitting(true)
    try {
      await pixAPI.defenderInfracao(infracaoId, defenseText.trim(), defenseFiles)
      toast.success(
        `Defesa enviada à ${acquirerLabel}. Você será notificado quando houver atualização.`,
      )
      setDefenseText('')
      setDefenseFiles([])
      invalidatePixInfracoes()
      await fetchInfracaoDetails()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Falha ao enviar defesa.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }, [
    infracaoId,
    defenseText,
    defenseFiles,
    invalidatePixInfracoes,
    fetchInfracaoDetails,
    acquirerLabel,
  ])

  const formatCurrency = formatCurrencyBRL
  const formatDate = formatDateTimeBR

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolvida':
        return 'bg-green-100 text-green-700'
      case 'estorno':
        return 'bg-orange-100 text-orange-800'
      case 'em análise':
      case 'em analise':
        return 'bg-yellow-100 text-yellow-700'
      case 'pendente':
        return 'bg-red-100 text-red-700'
      case 'cancelada':
        return 'bg-gray-100 text-gray-700'
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
            Contestação Pix (MED) registrada na adquirente
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
          {desfecho && (
            <div
              className={`rounded-lg border p-4 ${
                desfecho.favoravel_lojista === false
                  ? 'border-orange-200 bg-orange-50'
                  : desfecho.favoravel_lojista === true
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                {desfecho.favoravel_lojista === false ? (
                  <RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
                ) : desfecho.favoravel_lojista === true ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                ) : (
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-gray-600" />
                )}
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      desfecho.favoravel_lojista === false
                        ? 'text-orange-900'
                        : desfecho.favoravel_lojista === true
                          ? 'text-green-900'
                          : 'text-gray-900'
                    }`}
                  >
                    {desfecho.titulo}
                  </p>
                  <p
                    className={`mt-1 text-sm leading-relaxed ${
                      desfecho.favoravel_lojista === false
                        ? 'text-orange-800'
                        : desfecho.favoravel_lojista === true
                          ? 'text-green-800'
                          : 'text-gray-700'
                    }`}
                  >
                    {desfecho.mensagem}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Status
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
                <span className="text-sm font-medium text-gray-700">Tipo</span>
              </div>
              <span className="text-sm text-gray-900">{tipoLegivel}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Data de criação
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
                  Prazo para defesa
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
                <span className="text-sm font-medium text-gray-700">Valor</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(infracao.valor)}
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Identificador Pix (End to End)
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

          {infracao.descricao && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Motivo informado pelo pagador
                </span>
              </div>
              <p className="text-sm text-gray-900 leading-relaxed">
                {infracao.descricao}
              </p>
            </div>
          )}

          {detalhesAdicionais.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Informações da adquirente
                </span>
              </div>
              <dl className="space-y-3">
                {detalhesAdicionais.map((item: DetalheAdicional) => (
                  <div key={item.label} className="flex flex-col gap-0.5">
                    <dt className="text-xs font-medium text-gray-500">
                      {item.label}
                    </dt>
                    <dd className="text-sm text-gray-900 break-all">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {infracao.transacao_relacionada && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Hash className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Depósito relacionado na Coratri
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-blue-600 shrink-0">
                    ID da transação
                  </span>
                  <span className="text-sm text-blue-900 text-right break-all">
                    {infracao.transacao_relacionada.transaction_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-600">Valor</span>
                  <span className="text-sm text-blue-900">
                    {formatCurrency(infracao.transacao_relacionada.valor)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-600">Data do Pix</span>
                  <span className="text-sm text-blue-900">
                    {formatDate(infracao.transacao_relacionada.data)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {canDefend ? (
            <div className="border border-emerald-200 bg-emerald-50/40 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-gray-800">
                  Apresentar defesa
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                Sua defesa é enviada diretamente à{' '}
                <strong>{acquirerLabel}</strong> (adquirente Pix), responsável
                pela análise no âmbito do{' '}
                <strong>MED — Mecanismo Especial de Devolução</strong> do Pix.
                Anexe comprovantes se necessário (até 10 arquivos, 10 MB cada).
                Após o envio, o status passa para &quot;Em Análise&quot; e a{' '}
                {acquirerLabel} comunicará o resultado — se favorável, o valor
                retorna ao seu saldo disponível; se desfavorável, haverá
                devolução ao pagador.
              </p>
              <textarea
                value={defenseText}
                onChange={(e) => setDefenseText(e.target.value)}
                rows={4}
                maxLength={5000}
                placeholder="Ex.: Cliente reconhece a compra; segue comprovante de entrega e conversa com o pagador..."
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="file"
                multiple
                onChange={(e) =>
                  setDefenseFiles(Array.from(e.target.files ?? []))
                }
                className="mt-3 block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-50"
              />
              {defenseFiles.length > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  {defenseFiles.length} arquivo(s) selecionado(s)
                </p>
              )}
              <div className="mt-3 flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleSubmitDefense}
                  disabled={isSubmitting || defenseText.trim().length < 3}
                >
                  {isSubmitting
                    ? `Enviando à ${acquirerLabel}...`
                    : 'Enviar defesa'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                {infracao.status === 'Resolvida'
                  ? 'Esta contestação foi encerrada a seu favor. O valor não será devolvido ao pagador.'
                  : infracao.status === 'Estorno'
                    ? 'Esta contestação foi aceita. O valor foi estornado ao pagador e não é possível enviar nova defesa.'
                    : infracao.status === 'Cancelada'
                      ? 'Esta infração foi cancelada. Não é possível enviar defesa.'
                      : 'O prazo ou a situação atual não permite apresentar defesa por aqui.'}
              </p>
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
