'use client'

import React, { useState } from 'react'
import { Shield, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { twoFactorAPI } from '@/lib/api'
import { PinInput } from './PinInput'

interface Setup2FAModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function Setup2FAModal({
  isOpen,
  onClose,
  onSuccess,
}: Setup2FAModalProps) {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [step, setStep] = useState<'setup' | 'verify'>('setup')
  const [isLoading, setIsLoading] = useState(false)
  const [configuredPin, setConfiguredPin] = useState<string>('')

  const handleSetupPin = async () => {
    if (pin.length !== 6) {
      toast.error('PIN inválido', {
        description: 'O PIN deve ter 6 dígitos',
      })
      return
    }

    if (pin !== confirmPin) {
      toast.error('PINs não coincidem', {
        description: 'Os PINs digitados não são iguais',
      })
      return
    }

    setConfiguredPin(pin)
    setPin('')
    setStep('verify')

    toast.success('PIN configurado!', {
      description: 'Agora digite novamente para confirmar',
    })
  }

  const handleVerifyPin = async () => {
    if (pin.length !== 6) {
      toast.error('PIN inválido', {
        description: 'O PIN deve ter 6 dígitos',
      })
      return
    }

    if (pin !== configuredPin) {
      toast.error('PIN incorreto', {
        description: 'O PIN digitado não corresponde ao configurado',
      })
      setPin('')
      return
    }

    try {
      setIsLoading(true)

      const response = await twoFactorAPI.enable(pin)

      if (response.success) {
        toast.success('2FA configurado com sucesso!', {
          description: 'Sua conta agora está mais segura',
        })
        onSuccess()
      } else {
        toast.error('Erro ao ativar 2FA', {
          description: response.message || 'Tente novamente',
        })
      }
    } catch (error: any) {
      console.error('Erro ao verificar PIN:', error)
      toast.error('Erro ao ativar 2FA', {
        description: error.message || 'Erro de conexão',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 'setup' && pin.length === 6 && confirmPin.length === 6) {
        handleSetupPin()
      } else if (step === 'verify' && pin.length === 6) {
        handleVerifyPin()
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <div className="mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Configure a Autenticação de Dois Fatores
          </h2>
          <p className="text-gray-600 mt-2">
            É obrigatório configurar o 2FA para acessar sua conta
          </p>
          <div className="mt-3 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              ⚠️ Você não poderá acessar o sistema sem completar esta
              configuração
            </p>
          </div>
        </div>

        {step === 'setup' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Configurar PIN de Segurança:
              </h3>
              <p className="text-sm text-gray-600">
                Escolha um PIN de 6 dígitos para proteger sua conta
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Novo PIN
              </label>
              <PinInput
                value={pin}
                onChange={setPin}
                onKeyPress={handleKeyPress}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar PIN
              </label>
              <PinInput
                value={confirmPin}
                onChange={setConfirmPin}
                onKeyPress={handleKeyPress}
              />
            </div>

            <Button
              onClick={handleSetupPin}
              className="w-full"
              disabled={
                isLoading ||
                pin.length !== 6 ||
                confirmPin.length !== 6 ||
                pin !== confirmPin
              }
            >
              {isLoading ? 'Configurando...' : 'Configurar PIN'}
            </Button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Este PIN será solicitado a cada login para sua segurança
              </p>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Verificar PIN
              </h3>
              <p className="text-sm text-gray-600">
                Digite o PIN de 6 dígitos para confirmar a configuração:
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN de Verificação
              </label>
              <PinInput
                value={pin}
                onChange={setPin}
                onKeyPress={handleKeyPress}
                autoFocus
              />
            </div>

            <Button
              onClick={handleVerifyPin}
              className="w-full"
              disabled={isLoading || pin.length !== 6}
            >
              {isLoading ? 'Verificando...' : 'Ativar 2FA'}
            </Button>

            <Button
              variant="outline"
              onClick={() => setStep('setup')}
              className="w-full"
              disabled={isLoading}
            >
              Voltar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
