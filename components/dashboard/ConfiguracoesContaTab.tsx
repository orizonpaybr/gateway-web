import { memo, useState, useCallback, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { Lock, Shield } from 'lucide-react'
import { twoFactorAPI, authAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { TwoFactorModal } from '@/components/modals/TwoFactorModal'

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type PasswordFormData = z.infer<typeof passwordSchema>

interface TwoFAStatus {
  enabled: boolean
  configured: boolean
  enabled_at?: string | null
}

export const ConfiguracoesContaTab = memo(() => {
  const router = useRouter()
  const { logout, authReady } = useAuth()

  // Estado de senha
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  // Dados do formulário para usar no modal de confirmação
  const formData = watch()

  // Modal de PIN para confirmar troca de senha
  const [showPinModal, setShowPinModal] = useState(false)
  const [isPinVerifying, setIsPinVerifying] = useState(false)
  const [pinValue, setPinValue] = useState('')

  // Estado de 2FA
  const [twoFAStatus, setTwoFAStatus] = useState<TwoFAStatus>({
    enabled: false,
    configured: false,
  })
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [twoFAModalMode, setTwoFAModalMode] = useState<'enable' | 'disable'>(
    'enable',
  )

  // Carregar status de 2FA ao montar (só quando authReady)
  useEffect(() => {
    if (authReady) {
      loadTwoFAStatus()
    }
  }, [authReady])

  // Bloquear scroll do body quando modal de PIN está aberto
  useEffect(() => {
    if (showPinModal) {
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
  }, [showPinModal])

  const loadTwoFAStatus = useCallback(async () => {
    if (!authReady) return
    try {
      setIsLoadingStatus(true)
      const response = await twoFactorAPI.getStatus()
      if (response.success) {
        setTwoFAStatus({
          enabled: response.enabled || false,
          configured: response.configured || false,
          enabled_at: (response as any).enabled_at,
        })
      }
    } catch (error) {
      console.error('Erro ao carregar status 2FA:', error)
      toast.error('Erro ao carregar status do 2FA')
    } finally {
      setIsLoadingStatus(false)
    }
  }, [authReady])

  const onSubmitPassword = useCallback(
    async (data: PasswordFormData) => {
      try {
        // Se 2FA está ativado, pedir confirmação com PIN
        if (twoFAStatus.enabled) {
          setShowPinModal(true)
          return
        }

        // Se 2FA está desativado, trocar senha diretamente
        await handleChangePasswordDirect(data)
      } catch (error: any) {
        console.error('Erro ao preparar mudança de senha:', error)
        toast.error(error.message || 'Erro ao preparar mudança de senha')
      }
    },
    [twoFAStatus.enabled],
  )

  const handleChangePasswordDirect = useCallback(
    async (data: PasswordFormData) => {
      try {
        setIsPinVerifying(true)

        // Trocar senha sem PIN (2FA desativado)
        const response = await authAPI.changePassword(
          data.currentPassword,
          data.newPassword,
          data.confirmPassword,
          '', // PIN vazio quando 2FA está desativado
        )

        if (response.success) {
          toast.success('Senha alterada com sucesso! Você será desconectado.')

          // Aguardar um pouco antes de fazer logout
          await new Promise((resolve) => setTimeout(resolve, 1500))

          // Fazer logout automático
          await logout()

          // Redirecionar para login
          router.push('/login')

          // Reset formulário
          reset()
        }
      } catch (error: any) {
        console.error('Erro ao alterar senha:', error)

        if (error.message.includes('Senha atual')) {
          toast.error('Senha atual incorreta')
        } else if (error.message.includes('excedeu o limite')) {
          toast.error(
            'Limite de tentativas excedido. Tente novamente em 1 hora.',
          )
        } else {
          toast.error(error.message || 'Erro ao alterar senha')
        }
      } finally {
        setIsPinVerifying(false)
      }
    },
    [logout, router, reset],
  )

  const handlePinConfirm = useCallback(
    async (pin: string) => {
      try {
        setIsPinVerifying(true)

        // Executar a mudança de senha com o PIN confirmado
        const response = await authAPI.changePassword(
          formData.currentPassword,
          formData.newPassword,
          formData.confirmPassword,
          pin,
        )

        if (response.success) {
          toast.success('Senha alterada com sucesso! Você será desconectado.')

          // Fechar modal
          setShowPinModal(false)

          // Aguardar um pouco antes de fazer logout
          await new Promise((resolve) => setTimeout(resolve, 1500))

          // Fazer logout automático
          await logout()

          // Redirecionar para login
          router.push('/login')

          // Reset formulário
          reset()
        }
      } catch (error: any) {
        console.error('Erro ao alterar senha:', error)

        // Tratamento específico para diferentes erros
        if (error.message.includes('2FA')) {
          toast.error('PIN inválido. Tente novamente.')
        } else if (error.message.includes('Senha atual')) {
          toast.error('Senha atual incorreta')
        } else if (error.message.includes('excedeu o limite')) {
          toast.error(
            'Limite de tentativas excedido. Tente novamente em 1 hora.',
          )
        } else {
          toast.error(error.message || 'Erro ao alterar senha')
        }
      } finally {
        setIsPinVerifying(false)
      }
    },
    [formData, logout, router, reset],
  )

  const handleToggle2FA = useCallback(
    (enabled: boolean) => {
      if (enabled && !twoFAStatus.enabled) {
        // Ativar 2FA - abrir modal
        setTwoFAModalMode('enable')
        setShow2FAModal(true)
      } else if (!enabled && twoFAStatus.enabled) {
        // Desativar 2FA - abrir modal
        setTwoFAModalMode('disable')
        setShow2FAModal(true)
      }
    },
    [twoFAStatus.enabled],
  )

  const handleToggle2FASuccess = useCallback(
    async (_pin?: string) => {
      // Recarregar status após sucesso (pin não é usado para toggle)
      await loadTwoFAStatus()
    },
    [loadTwoFAStatus],
  )

  const handleClosePin = useCallback(() => {
    setShowPinModal(false)
    setPinValue('')
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
            <Lock size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              Trocar Senha
            </h2>
            <p className="text-sm text-gray-600">
              Altere sua senha para manter sua conta segura
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
          <Input
            {...register('currentPassword')}
            type="password"
            label="SENHA ATUAL"
            placeholder="Digite sua senha atual"
            error={errors.currentPassword?.message}
            showPasswordToggle={true}
          />

          <Input
            {...register('newPassword')}
            type="password"
            label="NOVA SENHA"
            placeholder="Digite a nova senha"
            error={errors.newPassword?.message}
            showPasswordToggle={true}
          />

          <Input
            {...register('confirmPassword')}
            type="password"
            label="CONFIRMAR NOVA SENHA"
            placeholder="Confirme a nova senha"
            error={errors.confirmPassword?.message}
            showPasswordToggle={true}
          />

          <Button
            type="submit"
            icon={<Lock size={18} />}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Processando...' : 'Trocar Senha'}
          </Button>
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-3 rounded-lg bg-green-100 text-green-600 shrink-0">
              <Shield size={24} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 break-words">
                Autenticação de Dois Fatores (2FA)
              </h2>
              <p className="text-sm text-gray-600">
                Proteja sua conta com um PIN de 6 dígitos
              </p>
            </div>
          </div>
          <Switch
            checked={twoFAStatus.enabled}
            onCheckedChange={handleToggle2FA}
            disabled={isLoadingStatus}
            className="shrink-0"
          />
        </div>

        {twoFAStatus.enabled && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield
                className="text-green-600 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div className="text-sm text-green-800 min-w-0 flex-1">
                <p className="font-semibold mb-1 break-words">
                  Autenticação de dois fatores ativada ✓
                </p>
                <p className="break-words">
                  Sua conta está protegida com uma camada adicional de segurança
                  usando PIN de 6 dígitos. Você precisará do seu PIN para
                  operações de segurança.
                </p>
                {twoFAStatus.enabled_at && (
                  <p className="text-xs mt-2 opacity-75 break-words">
                    Ativado em:{' '}
                    {new Date(twoFAStatus.enabled_at).toLocaleDateString(
                      'pt-BR',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {!twoFAStatus.enabled && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield
                className="text-gray-600 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">
                  Autenticação de dois fatores desativada
                </p>
                <p>
                  Ative a autenticação de dois fatores para adicionar uma camada
                  extra de segurança à sua conta. Use um PIN de 6 dígitos que
                  somente você conhece.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {showPinModal && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-[1000]"
          style={{ margin: 0, padding: 0 }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 mx-4">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Confirme a Mudança de Senha
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                Digite seu PIN de 6 dígitos para confirmar
              </p>
            </div>

            <PinInputComponent
              pin={pinValue}
              setPinValue={setPinValue}
              isVerifying={isPinVerifying}
              onConfirm={handlePinConfirm}
              onClose={handleClosePin}
            />
          </div>
        </div>
      )}

      <TwoFactorModal
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        onSuccess={handleToggle2FASuccess}
        mode={twoFAModalMode}
      />
    </div>
  )
})

ConfiguracoesContaTab.displayName = 'ConfiguracoesContaTab'

// Componente de Input de PIN reutilizável
interface PinInputComponentProps {
  pin: string
  setPinValue: (pin: string) => void
  isVerifying: boolean
  onConfirm: (pin: string) => void
  onClose: () => void
}

const PinInputComponent = memo(function PinInputComponent({
  pin,
  setPinValue,
  isVerifying,
  onConfirm,
  onClose,
}: PinInputComponentProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [focusedIndex, setFocusedIndex] = useState(0)

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, digit: string) => {
    if (!/^\d$/.test(digit) && digit !== '') return

    const newValue = pin.split('')
    newValue[index] = digit
    const newPin = newValue.join('')

    setPinValue(newPin)

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pin.length === 6) {
      onConfirm(pin)
    } else if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6)
    setPinValue(pastedData)

    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  return (
    <>
      <div className="flex gap-2 justify-center mb-6 flex-wrap">
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="password"
            inputMode="numeric"
            pattern="[0-9]"
            value={pin[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isVerifying}
            className="w-10 h-10 sm:w-12 sm:h-12 text-center text-xl sm:text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors disabled:opacity-50"
          />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isVerifying}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          onClick={() => onConfirm(pin)}
          disabled={isVerifying || pin.length !== 6}
          className="flex-1"
        >
          {isVerifying ? 'Confirmando...' : 'Confirmar Troca'}
        </Button>
      </div>
    </>
  )
})
