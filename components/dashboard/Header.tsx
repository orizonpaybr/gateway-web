'use client'

import { memo, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { EyeOff, Eye, RefreshCw, Menu } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useBalanceVisibility } from '@/contexts/BalanceVisibilityContext'
import { useMobileMenu } from '@/contexts/MobileMenuContext'
import { useAuth } from '@/contexts/AuthContext'
import { useDashboardStats, useAccountData } from '@/hooks/useReactQuery'
import { formatCurrencyBRL } from '@/lib/format'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard Orizon',
  '/dashboard/jornada': 'Dashboard Orizon',
  '/dashboard/buscar': 'Dashboard Orizon',
  '/dashboard/qr-codes': 'Dashboard Orizon',
  '/dashboard/infracoes': 'Dashboard Orizon',
  '/dashboard/pendentes': 'Dashboard Orizon',
  '/dashboard/conta': 'Dashboard Orizon',
  '/dashboard/configuracoes': 'Dashboard Orizon',
  '/dashboard/suporte': 'Dashboard Orizon',
  '/dashboard/api-docs': 'Dashboard Orizon',
}

export const Header = memo(() => {
  const { isBalanceHidden, toggleBalanceVisibility } = useBalanceVisibility()
  const { toggleMobileMenu } = useMobileMenu()
  const pathname = usePathname()
  const pageTitle = pageTitles[pathname] || 'Dashboard Orizon'
  const [isMobile, setIsMobile] = useState(false)

  // Detectar se está em mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  const isHomePage = pathname === '/dashboard'
  const { user: authUser } = useAuth()
  const { data: stats } = useDashboardStats()
  const { data: accountData } = useAccountData()

  const account =
    accountData && typeof accountData === 'object' && 'data' in accountData
      ? (
          accountData as {
            data?: {
              status_text?: string
              status_numeric?: number
              status?: string
              company?: { status_atual?: string }
            }
          }
        ).data
      : null
  const statusText =
    account?.status_text ??
    account?.company?.status_atual ??
    authUser?.status_text ??
    ''
  const statusNum = account?.status_numeric ?? authUser?.status
  const isPending = Boolean(
    (account || authUser) &&
    (statusText === 'Pendente' ||
      statusNum === 2 ||
      (typeof statusNum === 'string' && statusNum === '2') ||
      (typeof account?.status === 'string' && account.status === 'pending') ||
      (typeof authUser?.status === 'string' && authUser.status === 'pending')),
  )
  // Formatar saldo disponível
  const availableBalance = stats?.data?.saldo_disponivel || 0
  const formattedBalance = formatCurrencyBRL(availableBalance, {
    hide: isBalanceHidden,
  })

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <header className="fixed top-0 right-0 left-0 md:left-72 h-16 bg-gray-50 flex items-center justify-between px-4 md:px-8 z-10">
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
            className="p-2"
            aria-label="Abrir menu"
            icon={<Menu size={24} className="text-gray-700" />}
          />
        )}
        <h1 className="text-lg md:text-xl font-bold text-gray-900">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {isPending && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            Pendente
          </span>
        )}
        <Button
          variant="ghost"
          size="sm"
          icon={isBalanceHidden ? <Eye size={18} /> : <EyeOff size={18} />}
          onClick={toggleBalanceVisibility}
          title={isBalanceHidden ? 'Mostrar Saldo' : 'Ocultar Saldo'}
        >
          <span className="hidden sm:inline">
            {!isHomePage
              ? formattedBalance
              : `${isBalanceHidden ? 'Mostrar' : 'Ocultar'} Saldo`}
          </span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          icon={<RefreshCw size={18} />}
          onClick={handleRefresh}
          title="Atualizar"
        />
      </div>
    </header>
  )
})
