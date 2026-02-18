import { useState, useCallback, useEffect, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { pixAPI, type PixDepositData, type PixDepositResponse } from '@/lib/api'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

interface UsePixDepositOptions {
  onSuccess?: (data: PixDepositResponse) => void
  onError?: (error: Error) => void
  enablePolling?: boolean
  pollingInterval?: number
}

export function usePixDeposit(options: UsePixDepositOptions = {}) {
  const {
    onSuccess,
    onError,
    enablePolling = false,
    pollingInterval = 5000,
  } = options

  const { authReady, user } = useAuth()
  const queryClient = useQueryClient()
  const [currentTransaction, setCurrentTransaction] = useState<string | null>(
    null,
  )
  const [isPolling, setIsPolling] = useState(false)

  // Dados do usuário para preencher automaticamente
  const userData = useMemo(() => ({
    debtor_name: user?.name || '',
    debtor_document_number: user?.cnpj || '',
    email: user?.email || '',
    phone: user?.phone || '',
  }), [user])

  // Mutation para gerar QR Code
  const generateMutation = useMutation({
    mutationFn: (data: PixDepositData) => {
      // Adicionar dados do usuário automaticamente
      const fullData: PixDepositData = {
        ...data,
        debtor_name: data.debtor_name || userData.debtor_name,
        debtor_document_number: data.debtor_document_number || userData.debtor_document_number,
        email: data.email || userData.email,
        phone: data.phone || userData.phone,
      }
      return pixAPI.generateDeposit(fullData)
    },
    onSuccess: (data) => {
      const transactionId =
        data.data.idTransaction || data.data.transaction_id || null
      if (transactionId) {
        setCurrentTransaction(transactionId)
        if (enablePolling) {
          setIsPolling(true)
        }
        toast.success('QR Code gerado com sucesso!', {
          description:
            'Escaneie o QR Code ou copie o código PIX para realizar o pagamento.',
        })
      } else {
        toast.error('Erro ao obter ID da transação', {
          description:
            'O QR Code foi gerado mas não foi possível iniciar o acompanhamento.',
        })
      }
      onSuccess?.(data)
    },
    onError: (error: Error) => {
      toast.error('Erro ao gerar QR Code', {
        description: error.message || 'Tente novamente mais tarde.',
      })
      onError?.(error)
    },
  })

  // Query para verificar status do depósito (polling)
  const { data: depositStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['deposit-status', currentTransaction],
    queryFn: () => {
      if (!currentTransaction) {
        throw new Error('No transaction ID')
      }
      return pixAPI.checkDepositStatus(currentTransaction)
    },
    enabled: authReady && isPolling && !!currentTransaction,
    refetchInterval: isPolling ? pollingInterval : false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // Verificar se o depósito foi pago
  useEffect(() => {
    if (depositStatus?.success && depositStatus?.status) {
      const isPaid = [
        'PAID_OUT',
        'COMPLETED',
        'paid',
        'approved',
        'aprovado',
      ].includes(depositStatus.status)

      if (isPaid) {
        setIsPolling(false)
        toast.success('Depósito confirmado!', {
          description: 'O valor foi creditado em sua conta.',
          duration: 5000,
        })

        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: ['balance'] })
        queryClient.invalidateQueries({ queryKey: ['transactions'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
        queryClient.invalidateQueries({
          queryKey: ['dashboard-stats-optimized'],
        })
      }
    }
  }, [depositStatus, queryClient])

  // Função para gerar depósito
  const generateDeposit = useCallback(
    (data: PixDepositData) => {
      generateMutation.mutate(data)
    },
    [generateMutation],
  )

  // Função para cancelar depósito/polling
  const cancelDeposit = useCallback(() => {
    setIsPolling(false)
    setCurrentTransaction(null)
    generateMutation.reset()
  }, [generateMutation])

  // Função para iniciar polling manualmente
  const startPolling = useCallback(() => {
    if (currentTransaction) {
      setIsPolling(true)
    }
  }, [currentTransaction])

  // Função para parar polling manualmente
  const stopPolling = useCallback(() => {
    setIsPolling(false)
  }, [])

  // Função para verificar status manualmente
  const checkStatus = useCallback(() => {
    if (currentTransaction) {
      refetchStatus()
    }
  }, [currentTransaction, refetchStatus])

  return {
    // Estado
    depositData: generateMutation.data,
    isGenerating: generateMutation.isPending,
    isPolling,
    currentTransaction,
    depositStatus: depositStatus?.status,
    isPaid:
      depositStatus?.success &&
      ['PAID_OUT', 'COMPLETED', 'paid', 'approved', 'aprovado'].includes(
        depositStatus?.status || '',
      ),

    // Ações
    generateDeposit,
    cancelDeposit,
    startPolling,
    stopPolling,
    checkStatus,

    // Erros
    error: generateMutation.error,
  }
}
