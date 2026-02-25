'use client'

import { memo, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { EyeOff, Eye, RefreshCw, Menu } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useBalanceVisibility } from '@/contexts/BalanceVisibilityContext'
import { useMobileMenu } from '@/contexts/MobileMenuContext'
import { useDashboardStats } from '@/hooks/useReactQuery'
import { formatCurrencyBRL } from '@/lib/format'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard Orizon',
  '/dashboard/jornada': 'Dashboard Orizon',
  '/dashboard/buscar': 'Dashboard Orizon',
  '/dashboard/qr-codes': 'Dashboard Orizon',
  '/dashboard/infracoes': 'Dashboard Orizon',
  '/dashboard/conta': 'Dashboard Orizon',
  '/dashboard/configuracoes': 'Dashboard Orizon',
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
  const { data: stats, refetch: refetchStats } = useDashboardStats()

  const availableBalance = stats?.data?.saldo_disponivel ?? 0
  const formattedBalance = formatCurrencyBRL(availableBalance, {
    hide: isBalanceHidden,
  })

  const handleRefresh = () => {
    refetchStats()
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
