'use client'

import React, { useState, useEffect } from 'react'
import { Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { twoFactorAPI } from '@/lib/api'
import { PinInput } from './PinInput'

type TwoFactorMode = 'initial-setup' | 'enable' | 'disable' | 'change-password'

interface TwoFactorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (pin?: string) => void // Retorna PIN para change-password
  mode: TwoFactorMode
  isBlocking?: boolean // Para o modo initial-setup obrigatório
}

export function TwoFactorModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  isBlocking = false,
}: TwoFactorModalProps) {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [step, setStep] = useState<'setup' | 'verify'>('setup')
  const [isLoading, setIsLoading] = useState(false)
  const [configuredPin, setConfiguredPin] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // Reset state quando modal abre/fecha ou mode muda
  useEffect(() => {
    if (isOpen) {
      setPin('')
      setConfirmPin('')
      setError(null)
      setStep('setup')
      setConfiguredPin('')
    }
  }, [isOpen, mode])

  // Bloquear scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [isOpen])

  // Handler para setup inicial (2 etapas)
  const handleInitialSetup = async () => {
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

  // Handler para verificar PIN no setup inicial
  const handleVerifySetup = async () => {
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

  // Handler para enable/disable simples e change-password
  const handleSimpleAction = async () => {
    setError(null)

    if (pin.length !== 6) {
      setError('PIN deve ter 6 dígitos')
      return
    }

    try {
      setIsLoading(true)

      // Se for change-password, retorna o PIN sem chamar API
      if (mode === 'change-password') {
        toast.success('PIN confirmado!', {
          description: 'Processando mudança de senha...',
        })
        setPin('')
        onSuccess(pin) // Retorna PIN para componente pai
        onClose()
        return
      }

      const response =
        mode === 'enable'
          ? await twoFactorAPI.enable(pin)
          : await twoFactorAPI.disable(pin)

      if (response.success) {
        toast.success(
          mode === 'enable'
            ? '2FA ativado com sucesso!'
            : '2FA desativado com sucesso!',
        )
        setPin('')
        onSuccess()
        onClose()
      } else {
        setError(response.message || 'Erro ao processar 2FA')
      }
    } catch (err: any) {
      console.error('Erro:', err)
      setError(err?.message || 'Erro ao processar solicitação')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (mode === 'initial-setup') {
        if (step === 'setup' && pin.length === 6 && confirmPin.length === 6) {
          handleInitialSetup()
        } else if (step === 'verify' && pin.length === 6) {
          handleVerifySetup()
        }
      } else if (pin.length === 6) {
        handleSimpleAction()
      }
    }
  }

  const handleClose = () => {
    if (isBlocking && mode === 'initial-setup') {
      // Não permite fechar se for bloqueante
      return
    }
    setPin('')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  // Conteúdo do header baseado no modo
  const getHeaderContent = () => {
    switch (mode) {
      case 'initial-setup':
        return {
          title: 'Configure a Autenticação de Dois Fatores',
          description: 'É obrigatório configurar o 2FA para acessar sua conta',
          showWarning: true,
        }
      case 'enable':
        return {
          title: 'Ativar 2FA',
          description:
            'Digite um PIN de 6 dígitos para ativar a autenticação de dois fatores',
          showWarning: false,
        }
      case 'disable':
        return {
          title: 'Desativar 2FA',
          description:
            'Digite seu PIN atual para desativar a autenticação de dois fatores',
          showWarning: false,
        }
      case 'change-password':
        return {
          title: 'Confirme com 2FA',
          description:
            'Digite seu PIN de 6 dígitos para confirmar a mudança de senha',
          showWarning: false,
        }
    }
  }

  const headerContent = getHeaderContent()

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-[1000]"
      style={{ margin: 0, padding: 0 }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto mx-4">
        <div className="mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 sm:mb-4 mx-auto">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center break-words">
            {headerContent.title}
          </h2>
          <p className="text-gray-600 mt-2 text-center text-sm sm:text-base break-words">
            {headerContent.description}
          </p>
          {headerContent.showWarning && (
            <div className="mt-3 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                ⚠️ Você não poderá acessar o sistema sem completar esta
                configuração
              </p>
            </div>
          )}
        </div>

        {mode === 'initial-setup' && step === 'setup' && (
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
              onClick={handleInitialSetup}
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

        {mode === 'initial-setup' && step === 'verify' && (
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
              onClick={handleVerifySetup}
              className="w-full"
              disabled={isLoading || pin.length !== 6}
            >
              {isLoading ? 'Verificando...' : 'Ativar 2FA'}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setStep('setup')
                setPin('')
                setConfirmPin('')
              }}
              className="w-full"
              disabled={isLoading}
            >
              Voltar
            </Button>
          </div>
        )}

        {(mode === 'enable' || mode === 'disable') && (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 sm:mb-4 text-center">
                PIN de 6 dígitos
              </label>
              <PinInput
                value={pin}
                onChange={setPin}
                onKeyPress={handleKeyPress}
                autoFocus
              />
            </div>

            {error && (
              <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle
                  className="text-red-600 flex-shrink-0 mt-0.5"
                  size={18}
                />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleSimpleAction}
                disabled={isLoading || pin.length !== 6}
                className="flex-1 w-full sm:w-auto order-2 sm:order-1"
                icon={<Shield size={18} />}
              >
                {isLoading
                  ? 'Processando...'
                  : mode === 'enable'
                  ? 'Ativar 2FA'
                  : 'Desativar 2FA'}
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 w-full sm:w-auto order-1 sm:order-2"
              >
                Cancelar
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                {mode === 'enable'
                  ? 'Use apenas números (0-9)'
                  : 'Digite o PIN que você configurou'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
