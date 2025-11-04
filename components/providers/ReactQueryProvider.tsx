'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useAuth } from '@/contexts/AuthContext'

// Configuração do QueryClient
const queryClient = new QueryClient({
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

interface ReactQueryProviderProps {
  children: React.ReactNode
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  const { authReady } = useAuth()
  return (
    <QueryClientProvider client={queryClient}>
      {/*
        Gate de hidratação/autenticação:
        - Evita que hooks com useQuery/mutations disparem antes do token estar disponível
        - Mantém o QueryClient montado para não quebrar hooks, mas só renderiza a árvore quando authReady
      */}
      {authReady ? children : null}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
