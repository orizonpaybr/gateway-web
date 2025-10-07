'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Send, AlertCircle, CheckCircle } from 'lucide-react'

const pixSchema = z.object({
  pixKey: z.string().min(1, 'Chave Pix é obrigatória'),
  amount: z.string().min(1, 'Valor é obrigatório'),
  description: z.string().optional(),
})

type PixFormData = z.infer<typeof pixSchema>

export default function PixPage() {
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form')
  const [pixData, setPixData] = useState<PixFormData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PixFormData>({
    resolver: zodResolver(pixSchema),
  })

  const onSubmit = (data: PixFormData) => {
    setPixData(data)
    setStep('confirm')
  }

  const handleConfirm = async () => {
    setIsProcessing(true)
    // Simular processamento da transação
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsProcessing(false)
    setStep('success')
  }

  const handleNewTransaction = () => {
    setStep('form')
    setPixData(null)
    reset()
  }

  const limites = {
    disponivel: 5000,
    diario: 10000,
    usado: 2500,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transferência Pix</h1>
        <p className="text-gray-600 text-sm mt-1">
          Realize transferências via chave Pix
        </p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Limites de Transferência
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Limite Disponível</p>
            <p className="text-xl font-bold text-green-600">
              {limites.disponivel.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Limite Diário</p>
            <p className="text-xl font-bold text-gray-900">
              {limites.diario.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Já Utilizado Hoje</p>
            <p className="text-xl font-bold text-gray-600">
              {limites.usado.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${(limites.usado / limites.diario) * 100}%` }}
            />
          </div>
        </div>
      </Card>

      {step === 'form' && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Dados da Transferência
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              {...register('pixKey')}
              label="CHAVE PIX"
              placeholder="CPF, telefone, e-mail ou chave aleatória"
              error={errors.pixKey?.message}
            />

            <Input
              {...register('amount')}
              label="VALOR"
              type="text"
              placeholder="R$ 0,00"
              error={errors.amount?.message}
            />

            <Input
              {...register('description')}
              label="DESCRIÇÃO (OPCIONAL)"
              placeholder="Motivo da transferência"
              error={errors.description?.message}
            />

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
              <AlertCircle
                className="text-yellow-600 flex-shrink-0"
                size={20}
              />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Atenção!</p>
                <p className="mt-1">
                  Verifique todos os dados antes de confirmar. Transferências
                  Pix não podem ser canceladas após a confirmação.
                </p>
              </div>
            </div>

            <Button type="submit" fullWidth icon={<Send size={18} />}>
              Continuar
            </Button>
          </form>
        </Card>
      )}

      {step === 'confirm' && pixData && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Confirmar Transferência
          </h2>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-xs font-semibold text-gray-600 uppercase">
                Chave Pix
              </label>
              <p className="text-sm text-gray-900 mt-1 font-medium">
                {pixData.pixKey}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-xs font-semibold text-gray-600 uppercase">
                Valor
              </label>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                R$ {pixData.amount}
              </p>
            </div>

            {pixData.description && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-xs font-semibold text-gray-600 uppercase">
                  Descrição
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {pixData.description}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setStep('form')}
              disabled={isProcessing}
            >
              Voltar
            </Button>
            <Button
              fullWidth
              onClick={handleConfirm}
              disabled={isProcessing}
              icon={<Send size={18} />}
            >
              {isProcessing ? 'Processando...' : 'Confirmar Transferência'}
            </Button>
          </div>
        </Card>
      )}

      {step === 'success' && (
        <Card>
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Transferência Realizada!
            </h2>
            <p className="text-gray-600 mb-6">
              Sua transferência foi processada com sucesso.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6 max-w-md mx-auto">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600">Chave Pix</label>
                  <p className="text-sm font-medium text-gray-900">
                    {pixData?.pixKey}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-600">
                    Valor Transferido
                  </label>
                  <p className="text-xl font-bold text-gray-900">
                    R$ {pixData?.amount}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Data e Hora</label>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date().toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={handleNewTransaction} icon={<Send size={18} />}>
              Nova Transferência
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
