'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { TurnstileWidget } from '@/components/auth/TurnstileWidget'
import { useAuth } from '@/contexts/AuthContext'
import { getAuthApiError, showAuthErrorToast } from '@/lib/auth-errors'
import { TURNSTILE_SITE_KEY } from '@/lib/config/auth'

const loginSchema = z.object({
  username: z.string().min(1, 'Usuário ou email é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [requiresCaptcha, setRequiresCaptcha] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileReset, setTurnstileReset] = useState(0)

  const { login } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    if (requiresCaptcha && TURNSTILE_SITE_KEY && !turnstileToken) {
      toast.error('Complete a verificação de segurança')
      return
    }

    setIsLoading(true)

    try {
      const result = await login(
        data.username,
        data.password,
        turnstileToken ?? undefined,
      )

      if (result.requires2FA || result.requires2FASetup) {
        return
      }

      toast.success('Login realizado com sucesso!', {
        description: 'Bem-vindo!',
        duration: 3000,
      })

      router.push('/dashboard')
    } catch (error: unknown) {
      showAuthErrorToast(error, {
        title: 'Erro no login',
        onRequiresCaptcha: () => setRequiresCaptcha(true),
      })

      const err = getAuthApiError(error)
      if (!err.retryAfter) {
        setTurnstileToken(null)
        setTurnstileReset((k) => k + 1)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logoSrc = encodeURI('/Logo Coratri Finance.png')
  const showTurnstile = Boolean(TURNSTILE_SITE_KEY && requiresCaptcha)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src={logoSrc}
              alt="Coratri Finance"
              width={260}
              height={72}
              priority
              className="object-contain mx-auto drop-shadow-sm"
            />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200/80 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              {...register('username')}
              type="text"
              label="USUÁRIO OU EMAIL"
              placeholder="Digite seu usuário ou email"
              error={errors.username?.message}
            />

            <Input
              {...register('password')}
              type="password"
              label="SENHA"
              placeholder="Digite sua senha"
              error={errors.password?.message}
              showPasswordToggle
            />

            {showTurnstile && (
              <TurnstileWidget
                siteKey={TURNSTILE_SITE_KEY}
                onVerify={setTurnstileToken}
                onExpire={() => setTurnstileToken(null)}
                resetKey={turnstileReset}
              />
            )}

            <Button
              type="submit"
              variant="inkSolid"
              fullWidth
              disabled={isLoading}
              icon={<ArrowRight size={18} />}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          Ainda não tem uma conta?{' '}
          <Link
            href="/cadastro"
            className="font-semibold text-[#101010] underline-offset-2 hover:underline hover:opacity-80"
          >
            Criar conta
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Ao acessar a conta, você concorda com os nossos{' '}
          <Link
            href="/termos"
            className="font-medium text-[#101010] underline-offset-2 hover:underline hover:opacity-80"
          >
            termos de uso
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
