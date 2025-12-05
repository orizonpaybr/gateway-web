import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { authAPI } from '@/lib/api'

interface ValidationData {
  username: string
  email: string
  telefone?: string
  cpf_cnpj?: string
}

export function useRegister() {
  const [isValidating, setIsValidating] = useState(false)
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})

  const validateRegistrationData = useCallback(async (data: ValidationData) => {
    setIsValidating(true)
    setValidationErrors({})

    try {
      const validationResult = await authAPI.validateRegistrationData(data)

      if (!validationResult.success && validationResult.errors) {
        setValidationErrors(validationResult.errors)
        return { success: false, errors: validationResult.errors }
      }

      return { success: true }
    } catch (error: unknown) {
      toast.error('Erro na validação', {
        description: 'Erro ao verificar dados. Tente novamente.',
        duration: 4000,
      })
      return { success: false, errors: {} }
    } finally {
      setIsValidating(false)
    }
  }, [])

  const clearValidationErrors = useCallback(() => {
    setValidationErrors({})
  }, [])

  return {
    isValidating,
    validationErrors,
    validateRegistrationData,
    clearValidationErrors,
  }
}
