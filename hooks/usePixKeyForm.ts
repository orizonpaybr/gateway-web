'use client'

import { useState, useCallback, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pixAPI, accountAPI, type PixKeyType, type PixKey } from '@/lib/api'
import { validatePixKey } from '@/components/ui/PixKeyInput'
import { centsToBRL, sanitizePixKeyValueForApi } from '@/lib/format'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

const DEFAULT_MAX_WITHDRAWAL_LIMIT = 100000

const WITHDRAWAL_ERROR_MESSAGE =
  'Não foi possível sacar, entre em contato com o suporte.'

function normalizeWithdrawalErrorMessage(msg: string): string {
  if (
    /Disponível|Solicitado|R\$\s*[\d.,]+/.test(msg) ||
    /saldo disponível|saldo insuficiente/i.test(msg)
  ) {
    return WITHDRAWAL_ERROR_MESSAGE
  }
  return msg
}

export type UsePixKeyFormOptions = {
  maxWithdrawalLimit?: number
}

export function usePixKeyForm(options: UsePixKeyFormOptions = {}) {
  const { maxWithdrawalLimit = DEFAULT_MAX_WITHDRAWAL_LIMIT } = options
  const queryClient = useQueryClient()
  const { authReady } = useAuth()

  // ===== ESTADO LOCAL =====
  const [selectedKeyType, setSelectedKeyType] = useState<PixKeyType>('cpf')
  const [keyValue, setKeyValue] = useState('')
  const [amount, setAmount] = useState('')

  /** Trava de submit sincronizada (o `disabled` do botão só reage após re-render). */
  const isSubmittingRef = useRef(false)

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
      const status = data.data?.status
      const isManual = status === 'PENDING_APPROVAL'
      // Adquirente pode cancelar/falhar o saque na hora (ex.: saldo insuficiente da
      // conta master). HTTP volta 200, mas o saque NÃO saiu e o valor foi devolvido —
      // o cliente precisa saber que deu ruim, não ver "sucesso".
      const isFailed =
        status === 'CANCELLED' || status === 'FAILED' || status === 'REFUNDED'

      if (isFailed) {
        toast.error(
          data.message || 'Saque não realizado. O valor foi devolvido ao seu saldo.',
        )
      } else if (isManual) {
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
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['gamification'] })
      queryClient.invalidateQueries({ queryKey: ['affiliate-link'] })
      resetForm()
    },
    onError: (error: unknown) => {
      const rawMessage =
        error instanceof Error ? error.message : 'Erro ao realizar saque'
      const errorMessage = normalizeWithdrawalErrorMessage(rawMessage)
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
    () =>
      numericAmount > 0 &&
      numericAmount <= balance &&
      numericAmount <= maxWithdrawalLimit,
    [numericAmount, balance, maxWithdrawalLimit],
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
    // Trava síncrona: `disabled` no botão só vale após o re-render, então dois
    // cliques no mesmo tick (duplo-clique rápido, Enter segurado) disparariam
    // dois saques. Cada request gera um correlationID novo, logo a idempotência
    // da adquirente não os deduplica.
    if (isSubmittingRef.current) {
      return false
    }

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

    if (numericAmount > maxWithdrawalLimit) {
      toast.error(
        `Valor acima do limite máximo por saque de R$ ${maxWithdrawalLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      )
      return false
    }

    isSubmittingRef.current = true
    withdrawMutation.mutate(
      {
        key_type: selectedKeyType,
        key_value: sanitizePixKeyValueForApi(selectedKeyType, keyValue),
        amount: numericAmount,
      },
      { onSettled: () => { isSubmittingRef.current = false } },
    )
    return true
  }, [
    isKeyValid,
    numericAmount,
    balance,
    maxWithdrawalLimit,
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
