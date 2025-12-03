'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Shield } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { twoFactorAPI } from '@/lib/api'
interface PinInputProps {
  value: string
  onChange: (value: string) => void
  onKeyPress?: (e: React.KeyboardEvent) => void
  autoFocus?: boolean
}

function PinInput({ value, onChange, onKeyPress, autoFocus }: PinInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [_focusedIndex, setFocusedIndex] = useState(0)

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  const handleChange = (index: number, digit: string) => {
    if (!/^\d$/.test(digit) && digit !== '') {
      return
    }

    const newValue = value.split('')
    newValue[index] = digit
    const newPin = newValue.join('')

    onChange(newPin)

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    onKeyPress?.(e)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6)
    onChange(pastedData)

    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="password"
          inputMode="numeric"
          pattern="[0-9]"
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => setFocusedIndex(index)}
          className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
          maxLength={1}
        />
      ))}
    </div>
  )
}

export function TwoFactorVerify() {
  const [showModal, setShowModal] = useState(false)
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const { user, logout, tempToken, verify2FA } = useAuth()
  const router = useRouter()
  const hasChecked = useRef(false)

  const checkIfNeedsVerification = useCallback(async () => {
    if (tempToken) {
      setShouldRender(true)
      setShowModal(true)
      return
    }

    const verified = sessionStorage.getItem('2fa_verified')

    if (verified === 'true') {
      setIsVerified(true)
      setShouldRender(false)
      return
    }

    setShouldRender(false)
    setIsVerified(true)
  }, [tempToken])

  useEffect(() => {
    if ((user || tempToken) && !hasChecked.current) {
      hasChecked.current = true
      checkIfNeedsVerification()
    }
  }, [user, tempToken, checkIfNeedsVerification])

  if (!shouldRender) {
    return null
  }

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      toast.error('PIN inválido', {
        description: 'O PIN deve ter 6 dígitos',
      })
      return
    }

    try {
      setIsLoading(true)

      if (tempToken) {
        await verify2FA(tempToken, code)

        sessionStorage.setItem('2fa_verified', 'true')
        setIsVerified(true)
        setShowModal(false)

        return
      }

      const response = await twoFactorAPI.verifyCode(code)

      if (response.success) {
        sessionStorage.setItem('2fa_verified', 'true')
        setIsVerified(true)
        setShowModal(false)

        toast.success('Verificação concluída!', {
          description: 'Acesso liberado',
        })
      } else {
        toast.error('PIN incorreto', {
          description: response.message || 'Verifique o PIN e tente novamente',
        })
        setCode('')
      }
    } catch (error: unknown) {
      console.error('Erro ao verificar PIN:', error)
      toast.error('Erro na verificação', {
        description: 'Erro ao conectar com o servidor',
      })
      setCode('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6) {
      handleVerifyCode()
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (!showModal || isVerified) {
    return null
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/80 z-40" />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <div className="mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Verificação de Segurança
            </h2>
            <p className="text-gray-600 mt-2">
              Digite o PIN de 6 dígitos para continuar
            </p>
            <div className="mt-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                🔒 Esta verificação é necessária a cada login
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="two-factor-pin-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                PIN de Segurança
              </label>
              <PinInput
                value={code}
                onChange={setCode}
                onKeyPress={handleKeyPress}
              />
            </div>

            <Button
              onClick={handleVerifyCode}
              className="w-full"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? 'Verificando...' : 'Verificar'}
            </Button>

            <Button
              variant="outline"
              fullWidth
              onClick={handleLogout}
              className="border-red-500 text-red-500 hover:bg-red-100 hover:border-red-500 hover:text-red-500"
            >
              Sair e fazer login novamente
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Esqueceu seu PIN?{' '}
              <a
                href="https://wa.me/5549988906647"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Entre em contato com o suporte
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
