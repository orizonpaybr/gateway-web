import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query'
import {
  adminUsersAPI,
  adminDashboardAPI,
  type AdminUser,
  type CreateUserData,
  type UpdateUserData,
  type AdjustBalanceData,
} from '@/lib/api'
import { toast } from 'sonner'

export interface UserStats {
  total_registrations: number
  month_registrations: number
  pending_registrations: number
  banned_users: number
}

/**
 * Hook para obter lista de usuários com filtros e paginação
 *
 * @param params - Parâmetros de filtro e paginação
 * @param enabled - Se a query deve ser executada
 */
export function useAdminUsersList(
  params?: {
    status?: number
    search?: string
    per_page?: number
    page?: number
    order_by?: string
    order_direction?: 'asc' | 'desc'
  },
  enabled: boolean = true,
): UseQueryResult<
  {
    users: AdminUser[]
    pagination: {
      current_page: number
      per_page: number
      total: number
      last_page: number
    }
  },
  Error
> {
  return useQuery({
    queryKey: ['admin-users-list', params],
    queryFn: async () => {
      const response = await adminDashboardAPI.getUsers(params)
      if (!response.success) {
        throw new Error('Erro ao obter lista de usuários')
      }
      return {
        users: response.data,
        pagination: response.pagination,
      }
    },
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
  })
}

/**
 * Hook para obter detalhes de um usuário específico
 *
 * @param userId - ID do usuário
 * @param enabled - Se a query deve ser executada
 */
export function useAdminUser(
  userId: number | null,
  enabled: boolean = true,
): UseQueryResult<AdminUser, Error> {
  return useQuery({
    queryKey: ['admin-user', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('ID do usuário não fornecido')
      }

      const response = await adminUsersAPI.getUser(userId)
      if (!response.success) {
        throw new Error('Erro ao obter usuário')
      }
      return response.data.user
    },
    enabled: enabled && userId !== null,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

/**
 * Hook para criar novo usuário
 */
export function useCreateUser(): UseMutationResult<
  AdminUser,
  Error,
  CreateUserData,
  unknown
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateUserData) => {
      const response = await adminUsersAPI.createUser(data)
      if (!response.success) {
        throw new Error(response.data.message || 'Erro ao criar usuário')
      }
      return response.data.user
    },
    onSuccess: (user) => {
      // Invalidar lista de usuários para recarregar
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] })

      // Adicionar ao cache individual
      queryClient.setQueryData(['admin-user', user.id], user)

      toast.success('Usuário criado com sucesso!', {
        description: `${user.name} foi cadastrado no sistema`,
      })
    },
    onError: (error) => {
      toast.error('Erro ao criar usuário', {
        description: error.message || 'Tente novamente mais tarde',
      })
    },
  })
}

/**
 * Hook para atualizar usuário existente
 */
export function useUpdateUser(): UseMutationResult<
  AdminUser,
  Error,
  { userId: number; data: UpdateUserData },
  { previousUser?: AdminUser }
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: number
      data: UpdateUserData
    }) => {
      const response = await adminUsersAPI.updateUser(userId, data)
      if (!response.success) {
        throw new Error(response.data.message || 'Erro ao atualizar usuário')
      }
      return response.data.user
    },
    // Optimistic update
    onMutate: async ({ userId }) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: ['admin-user', userId] })

      // Salvar valor anterior para rollback
      const previousUser = queryClient.getQueryData<AdminUser>([
        'admin-user',
        userId,
      ])

      return { previousUser }
    },
    onSuccess: (user) => {
      // Atualizar cache individual com os dados completos retornados
      queryClient.setQueryData(['admin-user', user.id], user)

      // Invalidar e refetch para garantir dados atualizados
      queryClient.invalidateQueries({ queryKey: ['admin-user', user.id] })
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] })

      toast.success('Usuário atualizado com sucesso!', {
        description: `Dados de ${user.name} foram atualizados`,
      })
    },
    onError: (error, variables, context) => {
      // Rollback em caso de erro
      if (context?.previousUser) {
        queryClient.setQueryData(
          ['admin-user', variables.userId],
          context.previousUser,
        )
      }

      toast.error('Erro ao atualizar usuário', {
        description: error.message || 'Tente novamente mais tarde',
      })
    },
  })
}

/**
 * Hook para deletar usuário
 */
export function useDeleteUser(): UseMutationResult<
  void,
  Error,
  number,
  unknown
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await adminUsersAPI.deleteUser(userId)
      if (!response.success) {
        throw new Error(response.data.message || 'Erro ao deletar usuário')
      }
    },
    onSuccess: (_, userId) => {
      // Remover do cache individual
      queryClient.removeQueries({ queryKey: ['admin-user', userId] })

      // Invalidar lista para recarregar
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] })

      toast.success('Usuário deletado com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao deletar usuário', {
        description: error.message || 'Tente novamente mais tarde',
      })
    },
  })
}

/**
 * Hook para aprovar usuário pendente
 */
export function useApproveUser(): UseMutationResult<
  AdminUser,
  Error,
  number,
  unknown
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await adminUsersAPI.approveUser(userId)
      if (!response.success) {
        throw new Error(response.data.message || 'Erro ao aprovar usuário')
      }
      return response.data.user
    },
    onSuccess: (user) => {
      // Atualizar cache individual
      queryClient.setQueryData(['admin-user', user.id], user)

      // Invalidar lista para recarregar
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] })

      toast.success('Usuário aprovado com sucesso!', {
        description: `${user.name} já pode acessar o sistema`,
      })
    },
    onError: (error) => {
      toast.error('Erro ao aprovar usuário', {
        description: error.message || 'Tente novamente mais tarde',
      })
    },
  })
}

/**
 * Hook para bloquear/desbloquear usuário
 */
export function useToggleBlockUser(): UseMutationResult<
  AdminUser,
  Error,
  { userId: number; block: boolean; approve?: boolean },
  unknown
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      block,
      approve = false,
    }: {
      userId: number
      block: boolean
      approve?: boolean
    }) => {
      const response = await adminUsersAPI.toggleBlockUser(
        userId,
        block,
        approve,
      )
      if (!response.success) {
        throw new Error(
          response.data.message || 'Erro ao alterar bloqueio do usuário',
        )
      }
      return response.data.user
    },
    onSuccess: (user, variables) => {
      // Atualizar cache individual
      queryClient.setQueryData(['admin-user', user.id], user)

      // Invalidar lista para recarregar
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] })

      let action = variables.block ? 'bloqueado' : 'desbloqueado'
      if (!variables.block && variables.approve) {
        action = 'desbloqueado e aprovado'
      }
      toast.success(`Usuário ${action} com sucesso!`, {
        description: `${user.name} foi ${action}`,
      })
    },
    onError: (error) => {
      toast.error('Erro ao alterar bloqueio', {
        description: error.message || 'Tente novamente mais tarde',
      })
    },
  })
}

/**
 * Hook para bloquear/desbloquear saque do usuário
 */
export function useToggleWithdrawBlockUser(): UseMutationResult<
  AdminUser,
  Error,
  { userId: number; block: boolean },
  unknown
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      block,
    }: {
      userId: number
      block: boolean
    }) => {
      const response = await adminUsersAPI.toggleWithdrawBlockUser(
        userId,
        block,
      )
      if (!response.success) {
        throw new Error(
          response.data.message || 'Erro ao alterar bloqueio de saque',
        )
      }
      return response.data.user
    },
    onSuccess: (user, variables) => {
      // Atualizar cache do usuário específico
      queryClient.setQueryData(['admin-user', user.id], user)

      // Invalidar lista para recarregar
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] })

      const action = variables.block ? 'bloqueado' : 'desbloqueado'
      toast.success(`Saque ${action} com sucesso!`, {
        description: `Saque de ${user.name} foi ${action}`,
      })
    },
    onError: (error) => {
      toast.error('Erro ao alterar bloqueio de saque', {
        description: error.message || 'Tente novamente mais tarde',
      })
    },
  })
}

/**
 * Hook para ajustar saldo do usuário
 */
export function useAdjustBalance(): UseMutationResult<
  AdminUser,
  Error,
  { userId: number; data: AdjustBalanceData },
  unknown
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: number
      data: AdjustBalanceData
    }) => {
      const response = await adminUsersAPI.adjustBalance(userId, data)
      if (!response.success) {
        throw new Error(response.data.message || 'Erro ao ajustar saldo')
      }
      return response.data.user
    },
    onSuccess: (user, variables) => {
      // Atualizar cache individual
      queryClient.setQueryData(['admin-user', user.id], user)

      // Invalidar lista para recarregar
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] })

      const action = variables.data.type === 'add' ? 'adicionado' : 'subtraído'
      toast.success('Saldo ajustado com sucesso!', {
        description: `R$ ${variables.data.amount.toFixed(2)} ${action} ${
          variables.data.type === 'add' ? 'ao' : 'do'
        } saldo de ${user.name}`,
      })
    },
    onError: (error) => {
      toast.error('Erro ao ajustar saldo', {
        description: error.message || 'Tente novamente mais tarde',
      })
    },
  })
}

export function useManagers(enabled: boolean = true) {
  return useQuery({
    queryKey: ['admin-managers'],
    queryFn: async () => {
      const res = await adminUsersAPI.getManagers()
      if (!res.success) {
        throw new Error('Erro ao listar gerentes')
      }
      return res.data.managers
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook para obter estatísticas de usuários para os cards
 */
export function useUserStats(
  enabled: boolean = true,
): UseQueryResult<UserStats, Error> {
  return useQuery({
    queryKey: ['admin-users-stats'],
    queryFn: async () => {
      const res = await adminDashboardAPI.getUserStats()
      if (!res.success) {
        throw new Error('Erro ao obter estatísticas de usuários')
      }
      return res.data
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function usePixAcquirers(enabled: boolean = true) {
  return useQuery({
    queryKey: ['admin-pix-acquirers'],
    queryFn: async () => {
      const res = await adminUsersAPI.getPixAcquirers()
      if (!res.success) {
        throw new Error('Erro ao listar adquirentes')
      }
      return res.data.acquirers
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}
