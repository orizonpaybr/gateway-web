// lib/react-query.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (cacheTime foi renomeado para gcTime)
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
})

// Importações centralizadas dos hooks do React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  transactionsAPI,
  dashboardAPI,
  pixAPI,
  authAPI,
  accountAPI,
  qrCodeAPI,
} from '@/lib/api'
import { toast } from 'sonner'

// ===== QR CODES HOOKS =====
interface QRCodeFilters {
  page?: number
  limit?: number
  status?: string
  busca?: string
  data_inicio?: string
  data_fim?: string
}

export function useQRCodes(filters: QRCodeFilters = {}) {
  return useQuery({
    queryKey: ['qrcodes', filters],
    queryFn: () => qrCodeAPI.list(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos para dados dinâmicos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

// ===== TRANSACTIONS HOOKS =====
export function useTransactions(filters: any = {}) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionsAPI.list(filters),
    staleTime: 1 * 60 * 1000, // 1 minuto para transações
    gcTime: 3 * 60 * 1000, // 3 minutos
    refetchOnWindowFocus: false,
  })
}

export function useRecentTransactions(limit: number = 7) {
  return useQuery({
    queryKey: ['transactions', 'recent', limit],
    queryFn: () => transactionsAPI.list({ limit, page: 1 }),
    staleTime: 1 * 60 * 1000,
    gcTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

// ===== DASHBOARD HOOKS =====
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardAPI.getStats(),
    staleTime: 2 * 60 * 1000, // 2 minutos para estatísticas
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  })
}

export function useTransactionChart(period: string = '7d') {
  return useQuery({
    queryKey: ['dashboard', 'chart', period],
    queryFn: () => dashboardAPI.getInteractiveMovement(period),
    staleTime: 1 * 60 * 1000, // 1 minuto para gráficos
    gcTime: 3 * 60 * 1000, // 3 minutos
    refetchOnWindowFocus: false,
  })
}

export function useTransactionSummary(period: string = '7d') {
  return useQuery({
    queryKey: ['dashboard', 'summary', period],
    queryFn: () => dashboardAPI.getTransactionSummary(period),
    staleTime: 1 * 60 * 1000, // 1 minuto para resumos
    gcTime: 3 * 60 * 1000, // 3 minutos
    refetchOnWindowFocus: false,
  })
}

export function useInteractiveMovement(period: string = '7d') {
  return useQuery({
    queryKey: ['dashboard', 'interactive', period],
    queryFn: () => dashboardAPI.getInteractiveMovement(period),
    staleTime: 1 * 60 * 1000, // 1 minuto para movimento interativo
    gcTime: 3 * 60 * 1000, // 3 minutos
    refetchOnWindowFocus: false,
  })
}

// ===== PIX INFRAÇÕES HOOKS =====
export function usePixInfracoes(filters: any = {}) {
  return useQuery({
    queryKey: ['pix-infracoes', filters],
    queryFn: () => pixAPI.listInfracoes(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos para infrações
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  })
}

// ===== AUTH HOOKS =====
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => authAPI.verifyToken(),
    staleTime: 5 * 60 * 1000, // 5 minutos para perfil
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      authAPI.login(credentials.email, credentials.password),
    onSuccess: (data) => {
      // Invalida queries relacionadas ao auth
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Login realizado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao fazer login')
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: () => {
      // Limpa todo o cache
      queryClient.clear()
      toast.success('Logout realizado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao fazer logout')
    },
  })
}

// ===== ACCOUNT HOOKS =====
export function useAccountData() {
  return useQuery({
    queryKey: ['account'],
    queryFn: () => accountAPI.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutos para dados da conta
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => accountAPI.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account'] })
      toast.success('Dados da conta atualizados com sucesso!')
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Erro ao atualizar dados da conta',
      )
    },
  })
}

// ===== UTILITY HOOKS =====
export function useInvalidateQueries() {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () => queryClient.invalidateQueries(),
    invalidateDashboard: () =>
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    invalidateTransactions: () =>
      queryClient.invalidateQueries({ queryKey: ['transactions'] }),
    invalidateQRCodes: () =>
      queryClient.invalidateQueries({ queryKey: ['qrcodes'] }),
    invalidatePixInfracoes: () =>
      queryClient.invalidateQueries({ queryKey: ['pix-infracoes'] }),
    invalidateProfile: () =>
      queryClient.invalidateQueries({ queryKey: ['profile'] }),
    invalidateAccount: () =>
      queryClient.invalidateQueries({ queryKey: ['account'] }),
  }
}
