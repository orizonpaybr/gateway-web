/**
 * Hooks React Query para gerenciamento financeiro
 *
 * Implementa:
 * - Cache inteligente e invalidação
 * - Error handling
 * - Performance otimizada
 * - Padrões consistentes com o projeto
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import {
  financialAPI,
  type FinancialTransaction,
  type FinancialTransactionStats,
  type Wallet,
  type WalletStats,
  type Deposit,
  type DepositStats,
  type FinancialWithdrawal,
  type WithdrawalStatsFinancial,
  type FinancialFilters,
} from '@/lib/api'

// Hook para transações financeiras (todas)
export function useFinancialTransactions(
  filters: FinancialFilters,
  enabled: boolean = true,
): UseQueryResult<{
  success: boolean
  data: {
    data: FinancialTransaction[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}> {
  return useQuery({
    queryKey: ['financial-transactions', filters],
    queryFn: () => financialAPI.getAllTransactions(filters),
    enabled,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

// Hook para estatísticas de transações
export function useFinancialTransactionsStats(
  periodo: string = 'hoje',
  enabled: boolean = true,
): UseQueryResult<{
  success: boolean
  data: FinancialTransactionStats
}> {
  return useQuery({
    queryKey: ['financial-transactions-stats', periodo],
    queryFn: () => financialAPI.getTransactionsStats(periodo),
    enabled,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

// Hook para carteiras
export function useWallets(
  filters: FinancialFilters,
  enabled: boolean = true,
): UseQueryResult<{
  success: boolean
  data: {
    data: Wallet[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}> {
  return useQuery({
    queryKey: ['financial-wallets', filters],
    queryFn: () => financialAPI.getWallets(filters),
    enabled,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

// Hook para estatísticas de carteiras
export function useWalletsStats(enabled: boolean = true): UseQueryResult<{
  success: boolean
  data: WalletStats
}> {
  return useQuery({
    queryKey: ['financial-wallets-stats'],
    queryFn: () => financialAPI.getWalletsStats(),
    enabled,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

// Hook para depósitos (entradas)
export function useDeposits(
  filters: FinancialFilters,
  enabled: boolean = true,
): UseQueryResult<{
  success: boolean
  data: {
    data: Deposit[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}> {
  return useQuery({
    queryKey: ['financial-deposits', filters],
    queryFn: () => financialAPI.getDeposits(filters),
    enabled,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

// Hook para estatísticas de depósitos
export function useDepositsStats(
  periodo: string = 'hoje',
  enabled: boolean = true,
): UseQueryResult<{
  success: boolean
  data: DepositStats
}> {
  return useQuery({
    queryKey: ['financial-deposits-stats', periodo],
    queryFn: () => financialAPI.getDepositsStats(periodo),
    enabled,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

// Hook para saques (saídas)
export function useWithdrawalsFinancial(
  filters: FinancialFilters,
  enabled: boolean = true,
): UseQueryResult<{
  success: boolean
  data: {
    data: FinancialWithdrawal[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}> {
  return useQuery({
    queryKey: ['financial-withdrawals', filters],
    queryFn: () => financialAPI.getWithdrawals(filters),
    enabled,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

// Hook para estatísticas de saques
export function useWithdrawalsStatsFinancial(
  periodo: string = 'hoje',
  enabled: boolean = true,
): UseQueryResult<{
  success: boolean
  data: WithdrawalStatsFinancial
}> {
  return useQuery({
    queryKey: ['financial-withdrawals-stats', periodo],
    queryFn: () => financialAPI.getWithdrawalsStats(periodo),
    enabled,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })
}
