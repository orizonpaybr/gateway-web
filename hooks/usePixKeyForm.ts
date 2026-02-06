'use client'

import { useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pixAPI, accountAPI, type PixKeyType, type PixKey } from '@/lib/api'
import { validatePixKey } from '@/components/ui/PixKeyInput'
import { centsToBRL } from '@/lib/format'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

export function usePixKeyForm() {
  const queryClient = useQueryClient()
  const { authReady } = useAuth()

  // ===== ESTADO LOCAL =====
  const [selectedKeyType, setSelectedKeyType] = useState<PixKeyType>('cpf')
  const [keyValue, setKeyValue] = useState('')
  const [amount, setAmount] = useState('')

  // ===== QUERIES (com cache automático via React Query) =====
  const { data: balanceData, isLoading: isLoadingBalance } = useQuery({
    queryKey: ['balance'],
    queryFn: accountAPI.getBalance,
    enabled: authReady,
    refetchInterval: 30000,
    staleTime: 10000,
  })

  const { data: savedKeysData, isLoading: isLoadingKeys } = useQuery({
    queryKey: ['pix-keys'],
    queryFn: pixAPI.listKeys,
    enabled: authReady,
    staleTime: 60000,
    gcTime: 300000,
  })

  // ===== MUTATION (Saque) =====
  const withdrawMutation = useMutation({
    mutationFn: pixAPI.withdrawWithKey,
    onSuccess: (data) => {
      const isManual = data.data?.status === 'PENDING_APPROVAL'

      if (isManual) {
        toast.info(data.message || 'Saque criado com sucesso!', {
          description:
            data.data?.motivo_manual ||
            'Aguardando aprovação do administrador.',
          duration: 6000,
        })
      } else {
        toast.success(data.message || 'Saque realizado com sucesso!')
      }

      // Invalidar queries para forçar refetch
      queryClient.invalidateQueries({ queryKey: ['balance'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] })
      resetForm()
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao realizar saque'
      toast.error(errorMessage)
    },
  })

  // ===== VALORES MEMORIZADOS (evita recálculos desnecessários) =====
  const balance = useMemo(() => balanceData?.data?.current || 0, [balanceData])

  const numericAmount = useMemo(
    () => centsToBRL(parseFloat(amount || '0')),
    [amount],
  )

  const defaultKey = useMemo(
    () => savedKeysData?.data?.find((key) => key.is_default),
    [savedKeysData],
  )

  const hasKeys = useMemo(
    () => (savedKeysData?.data?.length || 0) > 0,
    [savedKeysData],
  )

  // ===== VALIDAÇÕES MEMORIZADAS =====
  const isKeyValid = useMemo(
    () => validatePixKey(selectedKeyType, keyValue),
    [selectedKeyType, keyValue],
  )

  const isAmountValid = useMemo(
    () => numericAmount > 0 && numericAmount <= balance,
    [numericAmount, balance],
  )

  const canAdvance = useMemo(
    () => isKeyValid && isAmountValid,
    [isKeyValid, isAmountValid],
  )

  // ===== CALLBACKS ESTÁVEIS (não recriam a cada render) =====
  const resetForm = useCallback(() => {
    setKeyValue('')
    setAmount('')
    setSelectedKeyType('cpf')
  }, [])

  const handleKeyTypeChange = useCallback((type: PixKeyType) => {
    setSelectedKeyType(type)
    setKeyValue('')
  }, [])

  const handleConfirmWithdraw = useCallback(() => {
    // Validar chave PIX
    if (!isKeyValid) {
      toast.error('Chave PIX inválida')
      return false
    }

    // Validar valor
    if (numericAmount <= 0) {
      toast.error('Valor deve ser maior que zero')
      return false
    }

    if (numericAmount > balance) {
      toast.error('Saldo insuficiente')
      return false
    }

    withdrawMutation.mutate({
      key_type: selectedKeyType,
      key_value: keyValue.replace(/\D/g, ''),
      amount: numericAmount,
    })
    return true
  }, [
    isKeyValid,
    numericAmount,
    balance,
    selectedKeyType,
    keyValue,
    withdrawMutation,
  ])

  const handleUseSavedKey = useCallback((key: PixKey) => {
    setSelectedKeyType(key.key_type)
    setKeyValue(key.key_value_formatted)
  }, [])

  // ===== RETORNO DO HOOK =====
  return {
    // Estado
    selectedKeyType,
    keyValue,
    amount,

    // Valores computados
    balance,
    numericAmount,
    defaultKey,
    hasKeys,

    // Validações
    isKeyValid,
    isAmountValid,
    canAdvance,

    // Estados de loading
    isLoadingBalance,
    isLoadingKeys,
    isWithdrawing: withdrawMutation.isPending,

    // Data
    balanceData,
    savedKeysData,

    // Mutations
    withdrawMutation,

    // Setters diretos (para inputs controlados)
    setKeyValue,
    setAmount,

    // Handlers
    handleKeyTypeChange,
    handleConfirmWithdraw,
    handleUseSavedKey,
    resetForm,
  }
}
