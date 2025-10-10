'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ArrowRight, HelpCircle } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'

const loginSchema = z.object({
  username: z.string().min(1, 'Usuário ou email é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [tempToken, setTempToken] = useState<string | null>(null)
  const [code2FA, setCode2FA] = useState('')

  const { login, verify2FA } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      const result = await login(data.username, data.password)

      // Guard clause para 2FA
      if (result.requires2FA && result.tempToken) {
        setShow2FA(true)
        setTempToken(result.tempToken)
        setIsLoading(false)
        return
      }

      // Mostrar toast de sucesso
      toast.success('Login realizado com sucesso!', {
        description: 'Bem-vindo!',
        duration: 3000,
      })

      // Redirecionar para dashboard
      router.push('/dashboard')
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao fazer login'

      // Mostrar toast de erro
      toast.error('Erro no login', {
        description: errorMessage,
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação early return
    if (!tempToken || !code2FA) {
      toast.error('Código 2FA é obrigatório', {
        description: 'Por favor, digite o código de 6 dígitos',
        duration: 4000,
      })
      return
    }

    setIsLoading(true)

    try {
      await verify2FA(tempToken, code2FA)

      // Mostrar toast de sucesso
      toast.success('Verificação 2FA concluída!', {
        description: 'Login realizado com sucesso!',
        duration: 3000,
      })

      router.push('/dashboard')
    } catch (err: any) {
      const errorMessage = err.message || 'Código 2FA inválido'

      // Mostrar toast de erro
      toast.error('Erro na verificação 2FA', {
        description: errorMessage,
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-light p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <Image
              src="/LOGO-ORIZON-AZUL-PRETA.png"
              alt="Orizon Pay"
              width={120}
              height={36}
              priority
            />
          </div>
          <Link
            href="/"
            className="text-primary text-sm font-medium hover:underline"
          >
            Finance
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          {!show2FA ? (
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
                showPasswordToggle={true}
              />

              <Button
                type="submit"
                fullWidth
                disabled={isLoading}
                icon={<ArrowRight size={18} />}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handle2FASubmit} className="space-y-5">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Verificação em Duas Etapas
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Digite o código de 6 dígitos do seu app autenticador
                </p>
              </div>

              <Input
                type="text"
                label="CÓDIGO 2FA"
                placeholder="000000"
                value={code2FA}
                onChange={(e) => setCode2FA(e.target.value)}
                maxLength={6}
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShow2FA(false)
                    setTempToken(null)
                    setCode2FA('')
                  }}
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  fullWidth
                  disabled={isLoading || code2FA.length !== 6}
                  icon={<ArrowRight size={18} />}
                >
                  {isLoading ? 'Verificando...' : 'Verificar'}
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          Ainda não tem uma conta?{' '}
          <Link
            href="/cadastro"
            className="text-primary font-medium hover:underline"
          >
            Criar conta
          </Link>
        </div>

        <div className="mt-6">
          <Button
            variant="outline"
            fullWidth
            icon={<HelpCircle size={18} />}
            onClick={() => window.open('tel:+5511981644351', '_self')}
          >
            Precisa de ajuda?
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Ao acessar a conta, você concorda com os nossos{' '}
          <Link href="/termos" className="text-primary hover:underline">
            termos de uso
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
