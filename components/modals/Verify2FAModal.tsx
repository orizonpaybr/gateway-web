'use client'

import { useState } from 'react'
import { X, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { PinInput } from './PinInput'

interface Verify2FAModalProps {
  isOpen: boolean
  tempToken: string
  onVerify: (code: string) => Promise<void>
  onClose: () => void
}

export function Verify2FAModal({
  isOpen,

  onVerify,
  onClose,
}: Verify2FAModalProps) {
  const [code, setCode] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (code.length !== 6) {
      toast.error('Código inválido', {
        description: 'O código deve ter 6 dígitos',
      })
      return
    }

    try {
      setIsLoading(true)
      await onVerify(code)
    } catch (error: any) {
      console.error('Erro na verificação 2FA:', error)
      setCode('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6) {
      handleSubmit()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <Button
          variant="ghost"
          size="sm"
          icon={<X size={24} />}
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        />

        <div className="mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Verificação de Segurança
          </h2>
          <p className="text-gray-600 mt-2">
            Digite o código de 6 dígitos do seu aplicativo autenticador
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
              Código de Autenticação
            </label>
            <PinInput
              value={code}
              onChange={setCode}
              onKeyPress={handleKeyPress}
              autoFocus={true}
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? 'Verificando...' : 'Verificar'}
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Não consegue acessar seu aplicativo autenticador?{' '}
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:underline p-0 h-auto"
            >
              Entre em contato com o suporte
            </Button>
          </p>
        </div>
      </div>
    </div>
  )
}
