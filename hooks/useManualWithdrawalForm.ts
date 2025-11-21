import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminManualTransactionsAPI, ManualWithdrawalResponse } from '@/lib/api'
import { formatCurrencyBRL } from '@/lib/format'
import { toast } from 'sonner'
import { CURRENCY_CENTS_DIVISOR } from '@/lib/constants/manualTransactions'

interface FormErrors {
  user?: string
  amount?: string
}

interface UseManualWithdrawalFormProps {
  onSuccess?: () => void
}

/**
 * Hook customizado para gerenciar o formulário de saque manual
 * Implementa validação, mutação e gerenciamento de estado
 *
 * @param props Propriedades do hook
 * @returns Estado e funções do formulário
 */
export function useManualWithdrawalForm({
  onSuccess,
}: UseManualWithdrawalFormProps) {
  const queryClient = useQueryClient()

  const [selectedUserId, setSelectedUserId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [formErrors, setFormErrors] = useState<FormErrors>({})

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

  const createWithdrawalMutation = useMutation<ManualWithdrawalResponse, Error>(
    {
      mutationFn: async () => {
        const parsedAmount = Number(amount) / CURRENCY_CENTS_DIVISOR
        return adminManualTransactionsAPI.createWithdrawal({
          user_id: selectedUserId,
          amount: parsedAmount,
          description: description.trim() || undefined,
        })
      },
      onSuccess: (response) => {
        const withdrawal = response.data.withdrawal
        toast.success('Saque criado com sucesso!', {
          description: `${withdrawal.user.name} teve ${formatCurrencyBRL(
            withdrawal.valor_total_descontado,
          )} debitado (saque: ${formatCurrencyBRL(
            withdrawal.amount,
          )}, taxa: ${formatCurrencyBRL(withdrawal.taxa)})`,
        })

        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: ['financial-withdrawals'] })

        resetForm()
        onSuccess?.()
      },
      onError: (error: Error) => {
        const errorMessage = error.message || 'Erro ao criar saque manual.'
        toast.error(errorMessage)
      },
    },
  )

  const handleSubmit = useCallback(() => {
    if (!validateForm()) {
      return
    }
    createWithdrawalMutation.mutate()
  }, [createWithdrawalMutation, validateForm])

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
    isSubmitting: createWithdrawalMutation.isPending,
    isSuccess: createWithdrawalMutation.isSuccess,
  }
}
