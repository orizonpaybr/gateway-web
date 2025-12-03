import { memo, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Copy, CheckCircle, RefreshCw, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { usePixDeposit } from '@/hooks/usePixDeposit'
import { formatCurrencyBRL } from '@/lib/format'

interface PixDepositModalProps {
  isOpen: boolean
  onClose: () => void
  minAmount?: number
  initialAmount?: string
  initialDescription?: string
}

export const PixDepositModal = memo(
  ({
    isOpen,
    onClose,
    minAmount = 1,
    initialAmount = '',
    initialDescription = '',
  }: PixDepositModalProps) => {
    const {
      depositData,
      isGenerating,
      isPaid,
      generateDeposit,
      cancelDeposit,
      checkStatus,
    } = usePixDeposit({
      enablePolling: true,
      pollingInterval: 5000,
    })

    // Gerar QR Code automaticamente quando modal abrir com valores iniciais
    useEffect(() => {
      if (isOpen && initialAmount && !depositData && !isGenerating) {
        // initialAmount vem em centavos (string), converter para reais
        const numericAmount = parseFloat(initialAmount) / 100
        if (!isNaN(numericAmount) && numericAmount >= minAmount) {
          generateDeposit({
            amount: numericAmount,
            description: initialDescription || 'Depósito via PIX',
          })
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialAmount, depositData])

    const handleCopyPixCode = useCallback(() => {
      const pixCode = depositData?.data?.qrcode || depositData?.data?.qr_code
      if (pixCode) {
        navigator.clipboard.writeText(pixCode)
        toast.success('Código PIX copiado!', {
          description: 'Cole no app do seu banco para fazer o pagamento.',
        })
      }
    }, [depositData])

    const handleClose = useCallback(() => {
      cancelDeposit()
      onClose()
    }, [cancelDeposit, onClose])

    // Quando o depósito for pago, mostrar mensagem de sucesso
    useEffect(() => {
      if (isPaid && isOpen) {
        setTimeout(() => {
          handleClose()
        }, 3000)
      }
    }, [isPaid, isOpen, handleClose])

    const renderQRCode = () => {
      if (!depositData?.data) {
        return null
      }

      // Suportar ambos os formatos de resposta (novo e legado)
      const qrcode = depositData.data.qrcode || depositData.data.qr_code
      const qrCodeImage =
        depositData.data.qrCodeImage || depositData.data.qr_code_image_url
      const depositAmount = depositData.data.amount
      const _transactionId =
        depositData.data.idTransaction || depositData.data.transaction_id

      return (
        <div className="space-y-5">
          {isPaid ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
              <div className="text-sm text-green-800">
                <p className="font-medium">Pagamento Confirmado!</p>
                <p className="mt-1">
                  Seu depósito de {formatCurrencyBRL(depositAmount)} foi
                  creditado com sucesso.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
              <div className="flex items-center gap-3 flex-1">
                <Loader2
                  className="text-yellow-600 animate-spin flex-shrink-0"
                  size={20}
                />
                <div className="text-sm text-yellow-800 flex-1">
                  <p className="font-medium">Aguardando Pagamento</p>
                  <p className="mt-1">
                    Escaneie o QR Code ou copie o código PIX para realizar o
                    pagamento.
                  </p>
                </div>
              </div>
              <button
                onClick={checkStatus}
                className="text-yellow-600 hover:text-yellow-700 transition-colors"
                title="Atualizar status"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Valor do Depósito</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrencyBRL(depositAmount)}
            </p>
          </div>

          {qrCodeImage && (
            <div className="flex justify-center">
              <div className="bg-white p-3 rounded-lg border-2 border-gray-200 shadow-sm">
                <Image
                  src={qrCodeImage}
                  alt="QR Code PIX"
                  width={180}
                  height={180}
                  className="rounded"
                />
              </div>
            </div>
          )}

          <div>
            <div className="block text-sm font-medium text-gray-700 mb-2">
              PIX Copia e Cola
            </div>
            <div className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 font-mono break-all max-h-20 overflow-y-auto">
              {qrcode}
            </div>
          </div>

          <div className="flex gap-3">
            {isPaid ? (
              <Button
                fullWidth
                onClick={handleClose}
                icon={<CheckCircle size={18} />}
              >
                Fechar
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={handleClose}
                  className="border-red-500 text-red-600 hover:!bg-transparent hover:!text-red-600"
                >
                  Cancelar
                </Button>
                <Button
                  fullWidth
                  onClick={handleCopyPixCode}
                  icon={<Copy size={18} />}
                >
                  Copiar Código
                </Button>
              </>
            )}
          </div>
        </div>
      )
    }

    return (
      <Dialog open={isOpen} onClose={handleClose} title="QR Code PIX" size="md">
        {depositData?.data ? (
          renderQRCode()
        ) : (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={48} className="animate-spin text-primary" />
          </div>
        )}
      </Dialog>
    )
  },
)
