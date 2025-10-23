'use client'

import { useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pixAPI, accountAPI, PixKeyType, PixKey } from '@/lib/api'
import { validatePixKey } from '@/components/ui/PixKeyInput'
import { centsToBRL } from '@/lib/format'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Hook customizado para gerenciar o formulário de PIX com chave
 * Centraliza toda a lógica de estado, validações e mutações
 *
 * @returns {Object} Estado e handlers do formulário
 */
export function usePixKeyForm() {
  const queryClient = useQueryClient()
  const { authReady } = useAuth()

  // ===== ESTADO LOCAL =====
  const [step, setStep] = useState<'form' | 'confirm'>('form')
  const [selectedKeyType, setSelectedKeyType] = useState<PixKeyType>('cpf')
  const [keyValue, setKeyValue] = useState('')
  const [amount, setAmount] = useState('') // Valor em centavos como string

  // ===== QUERIES (com cache automático via React Query) =====
  const { data: balanceData, isLoading: isLoadingBalance } = useQuery({
    queryKey: ['balance'],
    queryFn: accountAPI.getBalance,
    enabled: authReady, // ✅ Só executar quando autenticado
    refetchInterval: 30000, // Refetch a cada 30s
    staleTime: 10000, // Cache válido por 10s
  })

  const { data: savedKeysData, isLoading: isLoadingKeys } = useQuery({
    queryKey: ['pix-keys'],
    queryFn: pixAPI.listKeys,
    enabled: authReady, // ✅ Só executar quando autenticado
    staleTime: 60000, // Cache válido por 60s
    gcTime: 300000, // Garbage collection após 5min
  })

  // ===== MUTATION (Saque) =====
  const withdrawMutation = useMutation({
    mutationFn: pixAPI.withdrawWithKey,
    onSuccess: (data) => {
      toast.success(data.message || 'Saque realizado com sucesso!')
      // Invalidar queries para forçar refetch
      queryClient.invalidateQueries({ queryKey: ['balance'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] })
      // Reset form
      resetForm()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao realizar saque')
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
    setStep('form')
    setKeyValue('')
    setAmount('')
    setSelectedKeyType('cpf')
  }, [])

  const handleKeyTypeChange = useCallback((type: PixKeyType) => {
    setSelectedKeyType(type)
    setKeyValue('') // Limpar valor ao mudar tipo
  }, [])

  const handleAdvanceToConfirm = useCallback(() => {
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

    setStep('confirm')
    return true
  }, [isKeyValid, numericAmount, balance])

  const handleConfirmWithdraw = useCallback(() => {
    withdrawMutation.mutate({
      key_type: selectedKeyType,
      key_value: keyValue.replace(/\D/g, ''), // Remove formatação
      amount: numericAmount,
    })
  }, [selectedKeyType, keyValue, numericAmount, withdrawMutation])

  const handleBack = useCallback(() => {
    if (step === 'confirm') {
      setStep('form')
    }
  }, [step])

  const handleUseSavedKey = useCallback((key: PixKey) => {
    setSelectedKeyType(key.key_type)
    setKeyValue(key.key_value_formatted)
  }, [])

  // ===== RETORNO DO HOOK =====
  return {
    // Estado
    step,
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
    handleAdvanceToConfirm,
    handleConfirmWithdraw,
    handleBack,
    handleUseSavedKey,
    resetForm,
  }
}
