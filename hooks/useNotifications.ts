import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  getNotificationsStats,
  type NotificationItem,
} from '@/lib/api'
import { useLocalStorage } from './useLocalStorage'

interface UseNotificationsOptions {
  page?: number
  limit?: number
  unreadOnly?: boolean
  pollIntervalMs?: number
  enabled?: boolean
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    page = 1,
    limit = 20,
    unreadOnly = false,
    pollIntervalMs = 30000,
    enabled = true,
  } = options

  const [apiToken] = useLocalStorage<string | null>('api_token', null)
  const [apiSecret] = useLocalStorage<string | null>('api_secret', null)
  const queryClient = useQueryClient()

  const creds = useMemo(
    () => ({
      token: apiToken,
      secret: apiSecret,
      valid: Boolean(apiToken && apiSecret),
    }),
    [apiToken, apiSecret],
  )

  // Lê 2FA apenas após montagem para evitar erro de hidratação
  const [twoFaVerified, setTwoFaVerified] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTwoFaVerified(sessionStorage.getItem('2fa_verified') === 'true')
    }
  }, [])

  const isEnabled = creds.valid && enabled && twoFaVerified

  // Query key reutilizável para evitar duplicação
  const notificationsQueryKey = [
    'notifications',
    page,
    limit,
    unreadOnly,
    creds.token,
  ]

  // Lista de notificações
  const notificationsQuery = useQuery({
    queryKey: notificationsQueryKey,
    queryFn: async () => {
      if (!creds.valid) throw new Error('Credenciais não encontradas')
      const resp = await listNotifications({
        page,
        limit,
        unread_only: unreadOnly,
        token: creds.token!,
        secret: creds.secret!,
      })
      return resp.data
    },
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: isEnabled ? pollIntervalMs : false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  // Stats
  const statsQuery = useQuery({
    queryKey: ['notifications-stats', creds.token],
    queryFn: async () => {
      if (!creds.valid) throw new Error('Credenciais não encontradas')
      const resp = await getNotificationsStats(creds.token!, creds.secret!)
      return resp.data
    },
    enabled: isEnabled,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    refetchInterval: isEnabled ? pollIntervalMs : false,
  })

  // Marcar uma notificação como lida (optimistic)
  const markOneMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!creds.valid) throw new Error('Credenciais não encontradas')
      return markNotificationRead(id, creds.token!, creds.secret!)
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      const previous = queryClient.getQueryData<any>(notificationsQueryKey)
      if (previous) {
        const updated = {
          ...previous,
          notifications: previous.notifications.map((n: NotificationItem) =>
            n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
          ),
          unread_count: Math.max(0, (previous.unread_count || 0) - 1),
        }
        queryClient.setQueryData(notificationsQueryKey, updated)
      }
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(notificationsQueryKey, ctx.previous)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-stats'] })
    },
  })

  // Marcar todas como lidas
  const markAllMutation = useMutation({
    mutationFn: async () => {
      if (!creds.valid) throw new Error('Credenciais não encontradas')
      return markAllNotificationsRead(creds.token!, creds.secret!)
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      const previous = queryClient.getQueryData<any>(notificationsQueryKey)
      if (previous) {
        const updated = {
          ...previous,
          notifications: previous.notifications.map((n: NotificationItem) => ({
            ...n,
            read_at: new Date().toISOString(),
          })),
          unread_count: 0,
        }
        queryClient.setQueryData(notificationsQueryKey, updated)
      }
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(notificationsQueryKey, ctx.previous)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-stats'] })
    },
  })

  // Detecção de novas notificações (comparação com lastSeenAt) - removido evento de toast
  const [lastSeenAt, setLastSeenAt] = useLocalStorage<string | null>(
    'notifications_last_seen_at',
    null,
  )

  useEffect(() => {
    const data = notificationsQuery.data
    if (!data || !data.notifications?.length) {
      // Inicializa lastSeenAt na primeira carga se não existe
      if (!lastSeenAt && data?.notifications?.[0]?.created_at) {
        setLastSeenAt(data.notifications[0].created_at)
      }
      return
    }

    const currentNotifications = data.notifications

    // Atualiza lastSeenAt com a mais recente na primeira carga
    if (!lastSeenAt) {
      const newest = currentNotifications[0]?.created_at
      if (newest) {
        setLastSeenAt(newest)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationsQuery.data])

  const markOne = useCallback(
    (id: number) => markOneMutation.mutateAsync(id),
    [markOneMutation],
  )
  const markAll = useCallback(
    () => markAllMutation.mutateAsync(),
    [markAllMutation],
  )

  return {
    // dados
    notifications: notificationsQuery.data?.notifications ?? [],
    unreadCount: notificationsQuery.data?.unread_count ?? 0,
    pagination: {
      currentPage: notificationsQuery.data?.current_page ?? 1,
      lastPage: notificationsQuery.data?.last_page ?? 1,
      perPage: notificationsQuery.data?.per_page ?? limit,
      total: notificationsQuery.data?.total ?? 0,
    },
    stats: statsQuery.data,
    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,
    refetch: notificationsQuery.refetch,

    // ações
    markOne,
    markAll,
  }
}
