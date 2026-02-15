'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useAuth } from '@/contexts/AuthContext'
import { queryClient } from '@/lib/queryClient'

interface ReactQueryProviderProps {
  children: React.ReactNode
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  const { authReady, tempToken, show2FAModal } = useAuth()
  const pathname = usePathname()
  const isPublicRoute =
    pathname?.startsWith('/login') ||
    pathname === '/' ||
    pathname?.startsWith('/cadastro')
  const canRenderTree =
    authReady || isPublicRoute || !!tempToken || show2FAModal
  return (
    <QueryClientProvider client={queryClient}>
      {/*
        Gate de hidratação/autenticação:
        - Evita que hooks com useQuery/mutations disparem antes do token estar disponível
        - Mantém o QueryClient montado para não quebrar hooks, mas só renderiza a árvore quando authReady
      */}
      {canRenderTree ? children : null}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
