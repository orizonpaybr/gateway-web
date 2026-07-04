'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Shield, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { twoFactorAPI } from '@/lib/api'
import { PinInput } from './PinInput'

type TwoFactorMode = 'initial-setup' | 'enable' | 'disable' | 'change-password'

interface TwoFactorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (pin?: string) => void
  mode: TwoFactorMode
  isBlocking?: boolean
  authToken?: string | null
}

export function TwoFactorModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  isBlocking = false,
  authToken = null,
}: TwoFactorModalProps) {
  const [pin, setPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [qrSvg, setQrSvg] = useState<string | null>(null)
  const [loadingQr, setLoadingQr] = useState(false)

  const shouldLoadQr = mode === 'initial-setup' || mode === 'enable'

  const loadQrCode = useCallback(async () => {
    if (!shouldLoadQr) {
      return
    }

    setLoadingQr(true)
    try {
      const response = await twoFactorAPI.generateQRCode(authToken ?? undefined)
      if (response.success && response.data) {
        setQrSvg(response.data.qr_svg)
      } else {
        toast.error('Erro ao gerar QR Code', {
          description: response.message || 'Tente novamente',
        })
      }
    } catch (loadError) {
      console.error(loadError)
      toast.error('Erro ao gerar QR Code')
    } finally {
      setLoadingQr(false)
    }
  }, [shouldLoadQr, authToken])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setPin('')
    setError(null)
    setQrSvg(null)

    if (shouldLoadQr) {
      void loadQrCode()
    }
  }, [isOpen, mode, shouldLoadQr, loadQrCode])

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

  const handleVerifySetup = async () => {
    if (pin.length !== 6) {
      toast.error('Código inválido', {
        description: 'Digite o código de 6 dígitos do app autenticador',
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await twoFactorAPI.enable(pin, authToken ?? undefined)

      if (response.success) {
        toast.success('2FA configurado com sucesso!', {
          description: 'Sua conta agora está mais segura',
        })
        onSuccess(pin)
      } else {
        toast.error('Erro ao ativar 2FA', {
          description: response.message || 'Verifique o código e tente novamente',
        })
      }
    } catch (setupError: unknown) {
      const errorMessage =
        setupError instanceof Error ? setupError.message : 'Erro de conexão'
      toast.error('Erro ao ativar 2FA', { description: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSimpleAction = async () => {
    setError(null)

    if (pin.length !== 6) {
      setError('PIN deve ter 6 dígitos')
      return
    }

    try {
      setIsLoading(true)

      if (mode === 'change-password') {
        onSuccess(pin)
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
    } catch (actionError: unknown) {
      console.error('Erro:', actionError)
      const errorMessage =
        actionError instanceof Error
          ? actionError.message
          : 'Erro ao processar solicitação'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pin.length === 6) {
      if (mode === 'initial-setup') {
        void handleVerifySetup()
      } else {
        void handleSimpleAction()
      }
    }
  }

  const handleClose = () => {
    if (isBlocking && mode === 'initial-setup') {
      return
    }
    setPin('')
    setError(null)
    onClose()
  }

  if (!isOpen) {
    return null
  }

  const getHeaderContent = () => {
    switch (mode) {
      case 'initial-setup':
        return {
          title: 'Configura a 2fa',
          description: 'Escaneie o QR Code com seu app autenticador',
          showWarning: false,
        }
      case 'enable':
        return {
          title: 'Ativar 2FA',
          description:
            'Escaneie o QR Code com Google Authenticator e digite o código gerado',
          showWarning: false,
        }
      case 'disable':
        return {
          title: 'Desativar 2FA',
          description:
            'Digite o código do app autenticador para desativar o 2FA',
          showWarning: false,
        }
      case 'change-password':
        return {
          title: 'Confirme com 2FA',
          description: 'Digite o código de 6 dígitos do app autenticador',
          showWarning: false,
        }
    }
  }

  const headerContent = getHeaderContent()

  const renderQrSection = () => (
    <>
      {loadingQr ? (
        <p className="text-center text-sm text-gray-500">Gerando QR Code...</p>
      ) : qrSvg ? (
        <div className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrSvg} alt="QR Code 2FA" className="w-48 h-48" />
          <p className="text-xs text-center text-gray-500">
            Escaneie com Google Authenticator ou app compatível
          </p>
        </div>
      ) : null}
    </>
  )

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-[10000]"
      style={{ margin: 0, padding: 0 }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto mx-4">
        <div className="mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4 mx-auto">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#101010]" />
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
                Recomendamos configurar o 2FA para proteger sua conta
              </p>
            </div>
          )}
        </div>

        {mode === 'initial-setup' && (
          <div className="space-y-6">
            {renderQrSection()}

            <div>
              <div className="block text-sm font-medium text-gray-700 mb-2">
                Código do app:
              </div>
              <PinInput
                value={pin}
                onChange={setPin}
                onKeyPress={handleKeyPress}
              />
            </div>

            <Button
              variant="inkSolid"
              onClick={handleVerifySetup}
              className="w-full"
              disabled={isLoading || pin.length !== 6}
            >
              {isLoading ? 'Ativando...' : 'Ativar 2FA'}
            </Button>
          </div>
        )}

        {mode === 'enable' && (
          <div className="space-y-6">
            {renderQrSection()}

            <div>
              <div className="block text-sm font-medium text-gray-700 mb-2">
                Código do app:
              </div>
              <PinInput value={pin} onChange={setPin} onKeyPress={handleKeyPress} />
            </div>

            <Button
              variant="inkSolid"
              onClick={handleSimpleAction}
              className="w-full"
              disabled={isLoading || pin.length !== 6}
            >
              {isLoading ? 'Ativando...' : 'Ativar 2FA'}
            </Button>
          </div>
        )}

        {(mode === 'disable' || mode === 'change-password') && (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <div className="block text-sm font-medium text-gray-700 mb-3 sm:mb-4 text-center">
                Código de 6 dígitos
              </div>
              <PinInput
                value={pin}
                onChange={setPin}
                onKeyPress={handleKeyPress}
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
                variant="inkSolid"
                onClick={handleSimpleAction}
                disabled={isLoading || pin.length !== 6}
                className="flex-1 w-full sm:w-auto order-2 sm:order-1"
                icon={<Shield size={18} />}
              >
                {isLoading
                  ? 'Processando...'
                  : mode === 'change-password'
                    ? 'Confirmar'
                    : 'Desativar 2FA'}
              </Button>
              <Button
                variant="inkOutline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 w-full sm:w-auto order-1 sm:order-2"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
