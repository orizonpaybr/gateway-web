'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/Input'
import { PhoneInput, validatePhone } from '@/components/ui/PhoneInput'
import { DocumentInput, validateDocument } from '@/components/ui/DocumentInput'
import { Button } from '@/components/ui/Button'
import { ArrowRight, ArrowLeft, HelpCircle, User, Upload } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { authAPI } from '@/lib/api'

const step1Schema = z.object({
  name: z
    .string()
    .min(3, 'Nome completo é obrigatório')
    .regex(
      /^[a-zA-ZÀ-ÿ\s'\-]+$/,
      'O nome deve conter apenas letras, espaços, apóstrofos e hífens.',
    ),
  username: z
    .string()
    .min(3, 'Nome de usuário é obrigatório')
    .regex(
      /^[a-zA-Z0-9À-ÿ\s'\-]+$/,
      'O nome de usuário aceita apenas letras, números, espaços, apóstrofos e hífens.',
    ),
  email: z.string().email('Email inválido'),
})

const step2Schema = z
  .object({
    password: z
      .string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&+#^~`|\\/:";'<>,.=\-_\[\]{}()])/,
        'A senha deve conter pelo menos uma letra minúscula, uma letra maiúscula, um número e um caractere especial',
      ),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
    telefone: z
      .string()
      .refine((val) => val.length > 0, 'Telefone é obrigatório')
      .refine(validatePhone, 'Número de telefone inválido'),
    cpf_cnpj: z
      .string()
      .refine((val) => val.length > 0, 'CPF ou CNPJ é obrigatório')
      .refine(validateDocument, 'CPF ou CNPJ inválido'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

const step3Schema = z.object({
  documentoFrente: z.any().optional(),
  documentoVerso: z.any().optional(),
  selfieDocumento: z.any().optional(),
})

type Step1FormData = z.infer<typeof step1Schema>
type Step2FormData = z.infer<typeof step2Schema>
type Step3FormData = z.infer<typeof step3Schema>

export default function CadastroPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})
  const [selectedFiles, setSelectedFiles] = useState<{
    documentoFrente: File | null
    documentoVerso: File | null
    selfieDocumento: File | null
  }>({
    documentoFrente: null,
    documentoVerso: null,
    selfieDocumento: null,
  })
  const [step1Data, setStep1Data] = useState<Step1FormData | null>(null)
  const [step2Data, setStep2Data] = useState<Step2FormData | null>(null)

  const { register: registerUser } = useAuth()
  const router = useRouter()

  const handleFileSelect = (
    fieldName: keyof typeof selectedFiles,
    file: File | null,
  ) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [fieldName]: file,
    }))
  }

  const step1Form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
  })

  const step2Form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      telefone: '',
      cpf_cnpj: '',
    },
  })

  const step3Form = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
  })

  const onStep1Submit = async (data: Step1FormData) => {
    setIsValidating(true)
    setValidationErrors({})

    try {
      // Validar dados únicos no backend
      const validationResult = await authAPI.validateRegistrationData({
        username: data.username,
        email: data.email,
      })

      if (!validationResult.success && validationResult.errors) {
        // Mostrar erros específicos para cada campo
        setValidationErrors(validationResult.errors)

        // Definir erros nos campos do formulário
        Object.entries(validationResult.errors).forEach(([field, message]) => {
          step1Form.setError(field as keyof Step1FormData, {
            type: 'manual',
            message: message,
          })
        })

        return
      }

      // Se passou na validação, salvar dados e avançar
      setStep1Data(data)
      setStep(2)
    } catch (error: any) {
      console.error('Erro na validação:', error)
      toast.error('Erro na validação', {
        description: 'Erro ao verificar dados. Tente novamente.',
        duration: 4000,
      })
    } finally {
      setIsValidating(false)
    }
  }

  const onStep2Submit = async (data: Step2FormData) => {
    setIsValidating(true)
    setValidationErrors({})

    try {
      // Validar dados únicos no backend (telefone e CPF/CNPJ)
      const validationResult = await authAPI.validateRegistrationData({
        username: step1Data?.username || '',
        email: step1Data?.email || '',
        telefone: data.telefone,
        cpf_cnpj: data.cpf_cnpj,
      })

      if (!validationResult.success && validationResult.errors) {
        // Mostrar erros específicos para cada campo
        setValidationErrors(validationResult.errors)

        // Definir erros nos campos do formulário
        Object.entries(validationResult.errors).forEach(([field, message]) => {
          if (field === 'telefone' || field === 'cpf_cnpj') {
            step2Form.setError(field as keyof Step2FormData, {
              type: 'manual',
              message: message,
            })
          }
        })

        return
      }

      // Se passou na validação, salvar dados e avançar
      setStep2Data(data)
      setStep(3)
    } catch (error: any) {
      console.error('Erro na validação:', error)
      toast.error('Erro na validação', {
        description: 'Erro ao verificar dados. Tente novamente.',
        duration: 4000,
      })
    } finally {
      setIsValidating(false)
    }
  }

  const onStep3Submit = async (data: Step3FormData) => {
    // Guard clause para dados das etapas anteriores
    if (!step1Data || !step2Data) {
      toast.error('Erro no cadastro', {
        description: 'Dados das etapas anteriores não encontrados',
        duration: 4000,
      })
      return
    }

    setIsLoading(true)

    try {
      // Combinar dados de todas as etapas
      const fullData = {
        ...step1Data,
        password: step2Data.password,
        telefone: step2Data.telefone,
        cpf_cnpj: step2Data.cpf_cnpj,
      }

      // Preparar documentos para upload
      const documents = {
        documentoFrente: selectedFiles.documentoFrente || undefined,
        documentoVerso: selectedFiles.documentoVerso || undefined,
        selfieDocumento: selectedFiles.selfieDocumento || undefined,
      }

      const response = await registerUser(fullData, documents)

      // Verificar se a conta está pendente de aprovação
      const isPendingApproval =
        response.data?.pending_approval || response.data?.user?.status === 5

      // Mostrar toast de sucesso
      toast.success(
        isPendingApproval ? 'Cadastro realizado!' : 'Conta criada com sucesso!',
        {
          description: isPendingApproval
            ? 'Sua conta está pendente de aprovação pelo administrador.'
            : 'Bem-vindo ao Orizon Finance!',
          duration: 5000,
        },
      )

      // Redirecionar para dashboard (mesmo com conta pendente)
      router.push('/dashboard')
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar conta'

      // Mostrar toast de erro
      toast.error('Erro no cadastro', {
        description: errorMessage,
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const progress = step === 1 ? 33 : step === 2 ? 67 : 100

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-light p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
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
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-600">Etapa {step} de 3</span>
              <span className="text-xs font-medium text-gray-900">
                {Math.round(progress)}%
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
                  {...step1Form.register('name')}
                  label="NOME COMPLETO"
                  placeholder="Seu nome completo"
                  error={step1Form.formState.errors.name?.message}
                />

                <Input
                  {...step1Form.register('username')}
                  label="NOME DE USUÁRIO"
                  placeholder="usuario"
                  error={step1Form.formState.errors.username?.message}
                />

                <Input
                  {...step1Form.register('email')}
                  type="email"
                  label="EMAIL"
                  placeholder="email@exemplo.com"
                  error={step1Form.formState.errors.email?.message}
                />

                <Button
                  type="submit"
                  fullWidth
                  icon={<ArrowRight size={18} />}
                  disabled={isValidating}
                >
                  {isValidating ? 'Validando...' : 'Próximo'}
                </Button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Segurança</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Defina sua senha, telefone e documento
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
                  placeholder="Mínimo 8 caracteres"
                  showPasswordToggle={true}
                  error={step2Form.formState.errors.password?.message}
                />

                <Input
                  {...step2Form.register('confirmPassword')}
                  type="password"
                  label="CONFIRMAR SENHA"
                  placeholder="Repita sua senha"
                  showPasswordToggle={true}
                  error={step2Form.formState.errors.confirmPassword?.message}
                />

                <Controller
                  name="telefone"
                  control={step2Form.control}
                  render={({ field }) => (
                    <PhoneInput
                      {...field}
                      label="TELEFONE"
                      placeholder="(11) 99999-9999"
                      error={step2Form.formState.errors.telefone?.message}
                    />
                  )}
                />

                <Controller
                  name="cpf_cnpj"
                  control={step2Form.control}
                  render={({ field }) => (
                    <DocumentInput
                      {...field}
                      label="CPF/CNPJ"
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      error={step2Form.formState.errors.cpf_cnpj?.message}
                    />
                  )}
                />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep(1)
                    }}
                    icon={<ArrowLeft size={18} />}
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    fullWidth
                    icon={<ArrowRight size={18} />}
                    disabled={isValidating}
                  >
                    {isValidating ? 'Validando...' : 'Próximo'}
                  </Button>
                </div>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Documentos</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Envie os documentos para verificação
                </p>
              </div>

              <form
                onSubmit={step3Form.handleSubmit(onStep3Submit)}
                className="space-y-5"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                      Frente do Documento
                    </label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                      onClick={() =>
                        document.getElementById('documentoFrente')?.click()
                      }
                    >
                      {selectedFiles.documentoFrente ? (
                        <div className="space-y-2">
                          {selectedFiles.documentoFrente.type.startsWith(
                            'image/',
                          ) ? (
                            <img
                              src={URL.createObjectURL(
                                selectedFiles.documentoFrente,
                              )}
                              alt="Prévia do documento"
                              className="mx-auto h-24 w-auto max-w-full rounded-lg object-cover"
                            />
                          ) : (
                            <div className="mx-auto h-24 w-24 bg-red-100 rounded-lg flex items-center justify-center">
                              <span className="text-red-600 font-bold text-lg">
                                PDF
                              </span>
                            </div>
                          )}
                          <p className="text-sm text-gray-800 font-medium">
                            {selectedFiles.documentoFrente.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(
                              selectedFiles.documentoFrente.size /
                              1024 /
                              1024
                            ).toFixed(2)}{' '}
                            MB
                          </p>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">
                            Clique para enviar
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG ou PDF até 5MB
                          </p>
                        </>
                      )}
                      <input
                        {...step3Form.register('documentoFrente')}
                        id="documentoFrente"
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          handleFileSelect('documentoFrente', file)
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                      Verso do Documento
                    </label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                      onClick={() =>
                        document.getElementById('documentoVerso')?.click()
                      }
                    >
                      {selectedFiles.documentoVerso ? (
                        <div className="space-y-2">
                          {selectedFiles.documentoVerso.type.startsWith(
                            'image/',
                          ) ? (
                            <img
                              src={URL.createObjectURL(
                                selectedFiles.documentoVerso,
                              )}
                              alt="Prévia do documento"
                              className="mx-auto h-24 w-auto max-w-full rounded-lg object-cover"
                            />
                          ) : (
                            <div className="mx-auto h-24 w-24 bg-red-100 rounded-lg flex items-center justify-center">
                              <span className="text-red-600 font-bold text-lg">
                                PDF
                              </span>
                            </div>
                          )}
                          <p className="text-sm text-gray-800 font-medium">
                            {selectedFiles.documentoVerso.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(
                              selectedFiles.documentoVerso.size /
                              1024 /
                              1024
                            ).toFixed(2)}{' '}
                            MB
                          </p>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">
                            Clique para enviar
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG ou PDF até 5MB
                          </p>
                        </>
                      )}
                      <input
                        {...step3Form.register('documentoVerso')}
                        id="documentoVerso"
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          handleFileSelect('documentoVerso', file)
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                      Selfie com Documento
                    </label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                      onClick={() =>
                        document.getElementById('selfieDocumento')?.click()
                      }
                    >
                      {selectedFiles.selfieDocumento ? (
                        <div className="space-y-2">
                          {selectedFiles.selfieDocumento.type.startsWith(
                            'image/',
                          ) ? (
                            <img
                              src={URL.createObjectURL(
                                selectedFiles.selfieDocumento,
                              )}
                              alt="Prévia do documento"
                              className="mx-auto h-24 w-auto max-w-full rounded-lg object-cover"
                            />
                          ) : (
                            <div className="mx-auto h-24 w-24 bg-red-100 rounded-lg flex items-center justify-center">
                              <span className="text-red-600 font-bold text-lg">
                                PDF
                              </span>
                            </div>
                          )}
                          <p className="text-sm text-gray-800 font-medium">
                            {selectedFiles.selfieDocumento.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(
                              selectedFiles.selfieDocumento.size /
                              1024 /
                              1024
                            ).toFixed(2)}{' '}
                            MB
                          </p>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">
                            Clique para enviar
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG ou PDF até 5MB
                          </p>
                        </>
                      )}
                      <input
                        {...step3Form.register('selfieDocumento')}
                        id="selfieDocumento"
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          handleFileSelect('selfieDocumento', file)
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep(2)
                    }}
                    icon={<ArrowLeft size={18} />}
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    fullWidth
                    disabled={isLoading}
                    icon={<User size={18} />}
                  >
                    {isLoading ? 'Criando conta...' : 'Criar Conta'}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>

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
          Ao criar uma conta, você concorda com os nossos{' '}
          <Link href="/termos" className="text-primary hover:underline">
            termos de uso
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
