import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminManualTransactionsAPI, ManualDepositResponse } from '@/lib/api'
import { formatCurrencyBRL } from '@/lib/format'

interface FormErrors {
  user?: string
  amount?: string
}

interface UseManualDepositFormProps {
  onSuccess?: () => void
}

/**
 * Hook customizado para gerenciar o formulário de depósito manual
 * Implementa validação, mutação e gerenciamento de estado
 *
 * @param props Propriedades do hook
 * @returns Estado e funções do formulário
 */
export function useManualDepositForm({
  onSuccess,
}: UseManualDepositFormProps = {}) {
  const [selectedUserId, setSelectedUserId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const queryClient = useQueryClient()

  const resetForm = useCallback(() => {
    setSelectedUserId('')
    setAmount('')
    setDescription('')
    setFormErrors({})
  }, [])

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {}

    if (!selectedUserId) {
      errors.user = 'Selecione um usuário'
    }
    if (!amount || Number(amount) <= 0) {
      errors.amount = 'Informe um valor válido'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [amount, selectedUserId])

  const createDepositMutation = useMutation<ManualDepositResponse, Error>({
    mutationFn: async () => {
      const parsedAmount = Number(amount) / 100
      return adminManualTransactionsAPI.createDeposit({
        user_id: selectedUserId,
        amount: parsedAmount,
        description: description.trim() || undefined,
      })
    },
    onSuccess: (response) => {
      const deposit = response.data.deposit
      toast.success('Depósito criado com sucesso!', {
        description: `${deposit.user.name} recebeu ${formatCurrencyBRL(
          deposit.valor_liquido,
        )}`,
      })

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['financial-deposits'] })

      resetForm()
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao criar depósito manual.')
    },
  })

  const handleSubmit = useCallback(() => {
    if (!validateForm()) {
      return
    }
    createDepositMutation.mutate()
  }, [createDepositMutation, validateForm])

  return {
    // Estado do formulário
    selectedUserId,
    setSelectedUserId,
    amount,
    setAmount,
    description,
    setDescription,
    formErrors,

    // Funções
    resetForm,
    validateForm,
    handleSubmit,

    // Estado da mutação
    isSubmitting: createDepositMutation.isPending,
    isSuccess: createDepositMutation.isSuccess,
  }
}
