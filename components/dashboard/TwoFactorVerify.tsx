'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Shield } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { TurnstileWidget } from '@/components/auth/TurnstileWidget'
import { PinInput } from '@/components/modals/PinInput'
import { TwoFactorModal } from '@/components/modals/TwoFactorModal'
import { useAuth } from '@/contexts/AuthContext'
import { getAuthApiError, formatRetryAfterWait } from '@/lib/auth-errors'
import {
  hasPending2FA,
  readTempToken,
  TURNSTILE_SITE_KEY,
  TWO_FA_VERIFIED_KEY,
} from '@/lib/config/auth'

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function TwoFactorVerify() {
  const [showModal, setShowModal] = useState(false)
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [requiresCaptcha, setRequiresCaptcha] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileReset, setTurnstileReset] = useState(0)
  const {
    user,
    logout,
    tempToken,
    verify2FA,
    isLoading: authLoading,
    pending2FA,
    pending2FASetup,
  } = useAuth()
  const modalRef = useRef<HTMLDivElement>(null)

  const resolvePendingToken = useCallback(
    () => tempToken ?? readTempToken(),
    [tempToken],
  )

  const checkIfNeedsVerification = useCallback(() => {
    const pendingToken = resolvePendingToken()

    if (pendingToken || pending2FA || hasPending2FA()) {
      setShouldRender(true)
      setShowModal(true)
      return
    }

    const verified = sessionStorage.getItem(TWO_FA_VERIFIED_KEY)

    if (verified === 'true') {
      setIsVerified(true)
      setShouldRender(false)
      return
    }

    if (!user) {
      setShouldRender(false)
      return
    }

    setShouldRender(false)
    setIsVerified(true)
  }, [pending2FA, resolvePendingToken, user])

  useEffect(() => {
    if (authLoading) {
      return
    }
    checkIfNeedsVerification()
  }, [authLoading, checkIfNeedsVerification, pending2FA, tempToken, user])

  useEffect(() => {
    if (!showModal || !modalRef.current || pending2FASetup) {
      return
    }
    const el = modalRef.current
    const focusable = Array.from(
      el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((node) => !node.hasAttribute('disabled'))
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (first) {
      first.focus()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') {
        return
      }
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    el.addEventListener('keydown', onKeyDown)
    return () => el.removeEventListener('keydown', onKeyDown)
  }, [showModal, pending2FASetup])

  const handleSessionTerminated = async (message: string) => {
    toast.error('Sessão encerrada', { description: message, duration: 6000 })
    setShowModal(false)
    await logout()
  }

  const handleVerifyCode = async () => {
    const activeTempToken = resolvePendingToken()

    if (code.length !== 6) {
      toast.error('Código inválido', {
        description: 'Digite os 6 dígitos do app autenticador',
      })
      return
    }

    if (requiresCaptcha && TURNSTILE_SITE_KEY && !turnstileToken) {
      toast.error('Complete a verificação de segurança')
      return
    }

    if (!activeTempToken) {
      toast.error('Sessão expirada', {
        description: 'Faça login novamente para continuar.',
      })
      await logout()
      return
    }

    try {
      setIsLoading(true)
      await verify2FA(activeTempToken, code, turnstileToken ?? undefined)

      sessionStorage.setItem(TWO_FA_VERIFIED_KEY, 'true')
      setIsVerified(true)
      setShowModal(false)
    } catch (error: unknown) {
      const err = getAuthApiError(error)

      if (err.sessionTerminated || err.requiresLogin) {
        await handleSessionTerminated(
          err.message || 'Faça login novamente para continuar.',
        )
        return
      }

      if (err.retryAfter) {
        toast.error('Muitas tentativas', {
          description: `Aguarde ${formatRetryAfterWait(err.retryAfter)} e faça login novamente.`,
          duration: 8000,
        })
        await handleSessionTerminated(err.message)
        return
      }

      if (err.requiresCaptcha) {
        setRequiresCaptcha(true)
      }

      toast.error('Código incorreto', {
        description: err.message || 'Verifique o código do app autenticador',
      })
      setCode('')
      setTurnstileToken(null)
      setTurnstileReset((k) => k + 1)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetupSuccess = async (setupCode?: string) => {
    const activeTempToken = resolvePendingToken()
    const codeToVerify = setupCode ?? ''

    if (!activeTempToken || codeToVerify.length !== 6) {
      toast.error('Erro ao concluir configuração', {
        description: 'Faça login novamente.',
      })
      await logout()
      return
    }

    try {
      setIsLoading(true)
      await verify2FA(activeTempToken, codeToVerify)
      sessionStorage.setItem(TWO_FA_VERIFIED_KEY, 'true')
      setIsVerified(true)
      setShowModal(false)
    } catch (error: unknown) {
      toast.error('Erro ao concluir login', {
        description: getAuthApiError(error).message,
      })
      await logout()
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
  }

  if (!shouldRender || !showModal || isVerified) {
    return null
  }

  if (pending2FASetup) {
    return (
      <>
        <div
          className="fixed inset-0 bg-black/80 z-40"
          aria-hidden
          tabIndex={-1}
        />
        <TwoFactorModal
          isOpen
          onClose={handleLogout}
          onSuccess={handleSetupSuccess}
          mode="initial-setup"
          isBlocking
          authToken={resolvePendingToken()}
        />
      </>
    )
  }

  const showTurnstile = Boolean(TURNSTILE_SITE_KEY && requiresCaptcha)

  return (
    <>
      <div
        className="fixed inset-0 bg-black/80 z-40"
        aria-hidden
        tabIndex={-1}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="two-factor-modal-title"
          className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
        >
          <div className="mb-6">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Shield className="w-6 h-6 text-[#101010]" />
            </div>
            <h2
              id="two-factor-modal-title"
              className="text-2xl font-bold text-gray-900"
            >
              Verificação de Segurança
            </h2>
            <p className="text-gray-600 mt-2">
              Digite os 6 dígitos da 2FA exibidos no Google Authenticator
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="two-factor-pin-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Código da 2FA:
              </label>
              <PinInput
                id="two-factor-pin-input"
                value={code}
                onChange={setCode}
                onKeyPress={handleKeyPress}
                autoFocus
              />
            </div>

            {showTurnstile && (
              <TurnstileWidget
                siteKey={TURNSTILE_SITE_KEY}
                onVerify={setTurnstileToken}
                onExpire={() => setTurnstileToken(null)}
                resetKey={turnstileReset}
              />
            )}

            <Button
              variant="inkSolid"
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
        </div>
      </div>
    </>
  )
}
