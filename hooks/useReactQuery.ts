import {
  QueryClient,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
})
import {
  transactionsAPI,
  dashboardAPI,
  pixAPI,
  authAPI,
  accountAPI,
  qrCodeAPI,
  extratoAPI,
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
  const { authReady } = useAuth()

  return useQuery({
    queryKey: ['qrcodes', filters],
    queryFn: () => qrCodeAPI.list(filters),
    enabled: authReady,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

// ===== TRANSACTIONS HOOKS =====
export function useTransactions(filters: Record<string, unknown> = {}) {
  const { authReady } = useAuth()

  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionsAPI.list(filters),
    enabled: authReady,
    staleTime: 20 * 1000,
    gcTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

// ===== EXTRATO HOOKS =====
interface ExtratoFilters {
  page?: number
  limit?: number
  periodo?: 'hoje' | '7d' | '30d' | 'custom'
  data_inicio?: string
  data_fim?: string
  busca?: string
  tipo?: 'entrada' | 'saida'
}

export function useExtrato(filters: ExtratoFilters = {}) {
  const { authReady } = useAuth()

  return useQuery({
    queryKey: ['extrato', filters],
    queryFn: () => extratoAPI.list(filters),
    enabled: authReady,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

export function useExtratoSummary(
  filters: Omit<ExtratoFilters, 'page' | 'limit'> = {},
) {
  const { authReady } = useAuth()

  return useQuery({
    queryKey: ['extrato', 'summary', filters],
    queryFn: () => extratoAPI.getSummary(filters),
    enabled: authReady,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

export function useRecentTransactions(limit: number = 7) {
  const { authReady } = useAuth()

  return useQuery({
    queryKey: ['transactions', 'recent', limit],
    queryFn: () => transactionsAPI.list({ limit, page: 1 }),
    enabled: authReady,
    staleTime: 20 * 1000,
    gcTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

// ===== DASHBOARD HOOKS =====
export function useDashboardStats() {
  const { authReady } = useAuth()

  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardAPI.getStats(),
    enabled: authReady,
    staleTime: 0,
    gcTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 1000,
    refetchIntervalInBackground: false,
  })
}

export function useTransactionChart(period: string = '7d') {
  const { authReady } = useAuth()

  return useQuery({
    queryKey: ['dashboard', 'chart', period],
    queryFn: () => dashboardAPI.getInteractiveMovement(period),
    enabled: authReady,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

export function useTransactionSummary(period: string = '7d') {
  const { authReady } = useAuth()

  return useQuery({
    queryKey: ['dashboard', 'summary', period],
    queryFn: () => dashboardAPI.getTransactionSummary(period),
    enabled: authReady,
    staleTime: 20 * 1000,
    gcTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

export function useInteractiveMovement(period: string = '7d') {
  const { authReady } = useAuth()

  return useQuery({
    queryKey: ['dashboard', 'interactive', period],
    queryFn: () => dashboardAPI.getInteractiveMovement(period),
    enabled: authReady,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

// ===== PIX INFRAÇÕES HOOKS =====
export function usePixInfracoes(filters: Record<string, unknown> = {}) {
  const { authReady } = useAuth()

  return useQuery({
    queryKey: ['pix-infracoes', filters],
    queryFn: () => pixAPI.listInfracoes(filters),
    enabled: authReady,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

// ===== AUTH HOOKS =====
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => authAPI.verifyToken(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      authAPI.login(credentials.email, credentials.password),
    onSuccess: (_data) => {
      // Invalida queries relacionadas ao auth
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Login realizado com sucesso!')
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Erro ao fazer login'
      toast.error(errorMessage)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: () => {
      queryClient.clear()
      toast.success('Logout realizado com sucesso!')
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Erro ao fazer logout'
      toast.error(errorMessage)
    },
  })
}

// ===== ACCOUNT HOOKS =====
export function useAccountData() {
  const { authReady } = useAuth()

  return useQuery({
    queryKey: ['account'],
    queryFn: () => accountAPI.getProfile(),
    enabled: authReady,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      accountAPI.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account'] })
      toast.success('Dados da conta atualizados com sucesso!')
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Erro ao atualizar dados da conta'
      toast.error(errorMessage)
    },
  })
}

export function useGamificationData() {
  const { authReady } = useAuth()

  return useQuery({
    queryKey: ['gamification', 'journey'],
    queryFn: async () => {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null

      if (!token) {
        throw new Error('Token não encontrado')
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gamification/journey`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (!response.ok) {
        throw new Error('Erro ao buscar dados de gamificação')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erro ao carregar dados')
      }

      return data
    },
    enabled: authReady,
    staleTime: 20 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
    invalidateGamification: () =>
      queryClient.invalidateQueries({ queryKey: ['gamification'] }),
    invalidateExtrato: () =>
      queryClient.invalidateQueries({ queryKey: ['extrato'] }),
  }
}
