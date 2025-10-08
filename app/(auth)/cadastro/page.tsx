'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import Image from 'next/image'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ArrowRight, ArrowLeft, HelpCircle } from 'lucide-react'

const step1Schema = z.object({
  fullName: z.string().min(3, 'Nome completo é obrigatório'),
  username: z.string().min(3, 'Nome de usuário é obrigatório'),
  email: z.string().email('Email inválido'),
  city: z.string().min(2, 'Cidade é obrigatória'),
})

const step2Schema = z
  .object({
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string(),
    phone: z.string().min(10, 'Telefone inválido'),
    cpfCnpj: z.string().min(11, 'CPF/CNPJ inválido'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type Step1FormData = z.infer<typeof step1Schema>
type Step2FormData = z.infer<typeof step2Schema>

export default function CadastroPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [step1Data, setStep1Data] = useState<Step1FormData | null>(null)

  const step1Form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
  })

  const step2Form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
  })

  const onStep1Submit = (data: Step1FormData) => {
    setStep1Data(data)
    setStep(2)
  }

  const onStep2Submit = async (data: Step2FormData) => {
    setIsLoading(true)
    // Aqui você irá integrar com a API
    const fullData = { ...step1Data, ...data }
    console.log(fullData)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const progress = step === 1 ? 33 : 67

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/LOGO-ORIZON-AZUL-PRETA.png"
              alt="Orizon Pay"
              width={200}
              height={60}
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
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-600">Etapa {step} de 3</span>
              <span className="text-xs font-medium text-gray-900">
                {progress}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {step === 1 && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Dados Pessoais
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Informe seus dados básicos
                </p>
              </div>

              <form
                onSubmit={step1Form.handleSubmit(onStep1Submit)}
                className="space-y-5"
              >
                <Input
                  {...step1Form.register('fullName')}
                  label="NOME COMPLETO"
                  placeholder="Seu nome completo"
                  error={step1Form.formState.errors.fullName?.message}
                />

                <Input
                  {...step1Form.register('username')}
                  label="NOME DE USUÁRIO"
                  placeholder="@usuario"
                  error={step1Form.formState.errors.username?.message}
                />

                <Input
                  {...step1Form.register('email')}
                  type="email"
                  label="EMAIL"
                  placeholder="email@exemplo.com"
                  error={step1Form.formState.errors.email?.message}
                />

                <Input
                  {...step1Form.register('city')}
                  label="CIDADE"
                  placeholder="Sua cidade"
                  error={step1Form.formState.errors.city?.message}
                />

                <Button type="submit" fullWidth icon={<ArrowRight size={18} />}>
                  Próximo
                </Button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Segurança</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Defina sua senha e dados de contato
                </p>
              </div>

              <form
                onSubmit={step2Form.handleSubmit(onStep2Submit)}
                className="space-y-5"
              >
                <Input
                  {...step2Form.register('password')}
                  type="password"
                  label="SENHA"
                  placeholder="Mínimo 6 caracteres"
                  error={step2Form.formState.errors.password?.message}
                />

                <Input
                  {...step2Form.register('confirmPassword')}
                  type="password"
                  label="CONFIRMAR SENHA"
                  placeholder="Repita sua senha"
                  error={step2Form.formState.errors.confirmPassword?.message}
                />

                <Input
                  {...step2Form.register('phone')}
                  type="tel"
                  label="TELEFONE"
                  placeholder="(11) 99999-9999"
                  error={step2Form.formState.errors.phone?.message}
                />

                <Input
                  {...step2Form.register('cpfCnpj')}
                  label="CPF/CNPJ"
                  placeholder="000.000.000-00"
                  error={step2Form.formState.errors.cpfCnpj?.message}
                />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(1)}
                    icon={<ArrowLeft size={18} />}
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    fullWidth
                    disabled={isLoading}
                    icon={<ArrowRight size={18} />}
                  >
                    {isLoading ? 'Criando conta...' : 'Próximo'}
                  </Button>
                </div>
              </form>
            </>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Fazer login
            </Link>
          </div>

          <div className="mt-6">
            <Button variant="outline" fullWidth icon={<HelpCircle size={18} />}>
              Precisa de ajuda?
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-gray-500">
            Ao criar uma conta, você concorda com os nossos{' '}
            <Link href="/termos" className="text-primary hover:underline">
              termos de uso
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
