'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'

import { Clock, CheckCircle, Info, Send } from 'lucide-react'

import { PixDepositModal } from '@/components/modals/PixDepositModal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CurrencyInput } from '@/components/ui/CurrencyInput'
import { formatCurrencyBRL } from '@/lib/format'
import { useAuth } from '@/contexts/AuthContext'

const MSG_CONTA_NAO_APROVADA =
  'Contas não aprovadas não são permitidas para depósito.'

export default function DepositarPage() {
  const { user } = useAuth()
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState('')

  const quickAmounts = useMemo(() => [50, 100, 200, 500, 1000, 2000], [])

  const isApproved =
    user?.status === 1 || user?.status_text === 'Aprovado'

  const handleQuickAmount = (amount: number) => {
    // Converter valor para centavos (formato esperado pelo CurrencyInput)
    const valueInCents = Math.round(amount * 100).toString()
    setSelectedAmount(valueInCents)
  }

  const handleGenerateQRCode = () => {
    if (!isApproved) {
      toast.error(MSG_CONTA_NAO_APROVADA)
      return
    }
    setIsDepositModalOpen(true)
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Depositar via PIX
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Adicione saldo à sua conta de forma rápida e segura
          </p>
        </div>
      </div>

      <Card className="p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Info size={20} className="text-primary" />
            Como Funciona
          </h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-sm">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Escolha o Valor</p>
                <p className="text-sm text-gray-600">
                  Selecione um valor sugerido ou digite o valor desejado
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-sm">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Gere o QR Code</p>
                <p className="text-sm text-gray-600">
                  Clique em &quot;Gerar QR Code&quot; e aguarde a geração do
                  código PIX
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-sm">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Faça o Pagamento</p>
                <p className="text-sm text-gray-600">
                  Escaneie o QR Code ou copie o código PIX Copia e Cola no app
                  do seu banco
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-sm">4</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Receba o Saldo</p>
                <p className="text-sm text-gray-600">
                  Após a confirmação do pagamento, o valor será creditado
                  automaticamente
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Valores Sugeridos (Rápido)
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handleQuickAmount(amount)}
                className="bg-gray-50 hover:bg-primary/5 border border-gray-200 hover:border-primary rounded-lg p-4 transition-all duration-200 group"
              >
                <p className="text-sm text-gray-600 mb-1 group-hover:text-primary">
                  Depositar
                </p>
                <p className="text-xl font-bold text-gray-900 group-hover:text-primary">
                  {formatCurrencyBRL(amount)}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ou Digite o Valor
          </h2>
          <div className="flex">
            <div className="flex-1 min-w-0">
              <CurrencyInput
                label="VALOR DO DEPÓSITO"
                value={selectedAmount}
                onChange={setSelectedAmount}
                placeholder="R$ 0,00"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-center">
            <Button
              onClick={handleGenerateQRCode}
              size="lg"
              icon={<Send size={20} />}
              className="px-8"
              disabled={!selectedAmount}
            >
              Gerar QR Code PIX
            </Button>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informações Importantes
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex gap-2">
              <Clock className="text-primary flex-shrink-0 mt-0.5" size={16} />
              <p>
                <span className="font-medium text-gray-900">
                  Tempo de Processamento:
                </span>{' '}
                O crédito é automático e ocorre em segundos após a confirmação
                do pagamento.
              </p>
            </div>

            <div className="flex gap-2">
              <CheckCircle
                className="text-primary flex-shrink-0 mt-0.5"
                size={16}
              />
              <p>
                <span className="font-medium text-gray-900">Segurança:</span>{' '}
                Todas as transações são processadas através de adquirentes
                certificados e seguem as normas do Banco Central.
              </p>
            </div>

            <div className="flex gap-2">
              <Info className="text-primary flex-shrink-0 mt-0.5" size={16} />
              <p>
                <span className="font-medium text-gray-900">
                  Disponibilidade:
                </span>{' '}
                Os depósitos via PIX funcionam 24 horas por dia, 7 dias por
                semana, incluindo finais de semana e feriados.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <PixDepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        initialAmount={selectedAmount}
        minAmount={1}
      />
    </div>
  )
}
