'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ArrowRight, HelpCircle } from 'lucide-react'
import Image from 'next/image'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    // Aqui você irá integrar com a API
    console.log(data)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              {...register('email')}
              type="email"
              label="EMAIL"
              placeholder="email@email.com"
              error={errors.email?.message}
            />

            <Input
              {...register('password')}
              type="password"
              label="SENHA"
              placeholder="Digite sua senha"
              error={errors.password?.message}
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
          <Button variant="outline" fullWidth icon={<HelpCircle size={18} />}>
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
