'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useAuth } from '@/contexts/AuthContext'
import { hasPending2FA, readTempToken } from '@/lib/config/auth'
import { queryClient } from '@/lib/queryClient'

interface ReactQueryProviderProps {
  children: React.ReactNode
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  const { authReady, tempToken, show2FAModal, pending2FA } = useAuth()
  const pathname = usePathname()
  const isPublicRoute =
    pathname?.startsWith('/login') ||
    pathname === '/' ||
    pathname?.startsWith('/cadastro') ||
    pathname?.startsWith('/termos')

  const hasPending2FASession =
    pending2FA || !!tempToken || hasPending2FA() || !!readTempToken()

  const canRenderTree =
    authReady || isPublicRoute || hasPending2FASession || show2FAModal

  return (
    <QueryClientProvider client={queryClient}>
      {canRenderTree ? children : null}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
