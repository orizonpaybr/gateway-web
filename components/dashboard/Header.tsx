'use client'

import { memo, useEffect, useRef, useState } from 'react'
import { EyeOff, Eye, RefreshCw, Menu, Bell, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useNotifications } from '@/hooks/useNotifications'
import { usePathname, useRouter } from 'next/navigation'
import { useBalanceVisibility } from '@/contexts/BalanceVisibilityContext'
import { useDashboardStats } from '@/hooks/useReactQuery'
import { formatCurrencyBRL } from '@/lib/format'
import { useMobileMenu } from '@/contexts/MobileMenuContext'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard Orizon',
  '/dashboard/jornada': 'Dashboard Orizon',
  '/dashboard/buscar': 'Dashboard Orizon',
  '/dashboard/extrato': 'Dashboard Orizon',
  '/dashboard/pix': 'Dashboard Orizon',
  '/dashboard/qr-codes': 'Dashboard Orizon',
  '/dashboard/infracoes': 'Dashboard Orizon',
  '/dashboard/pendentes': 'Dashboard Orizon',
  '/dashboard/conta': 'Dashboard Orizon',
  '/dashboard/configuracoes': 'Dashboard Orizon',
  '/dashboard/suporte': 'Dashboard Orizon',
  '/dashboard/api-docs': 'Dashboard Orizon',
}

export const Header = memo(function Header() {
  const { isBalanceHidden, toggleBalanceVisibility } = useBalanceVisibility()
  const { toggleMobileMenu } = useMobileMenu()
  const pathname = usePathname()
  const router = useRouter()
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

  // Buscar dados do dashboard apenas quando não estiver na página inicial
  const isHomePage = pathname === '/dashboard'
  const { data: stats } = useDashboardStats()
  const twoFaEnabled =
    typeof window !== 'undefined' &&
    sessionStorage.getItem('2fa_verified') === 'true'

  const { unreadCount, notifications, markOne, markAll, refetch } =
    useNotifications({
      limit: 50, // Buscar mais para ter dados suficientes para scroll
      pollIntervalMs: 30000,
      enabled: twoFaEnabled,
    })
  const [openDropdown, setOpenDropdown] = useState(false)
  const [hasSeenNotifications, setHasSeenNotifications] = useState(false)
  const [visibleCount, setVisibleCount] = useState(5) // Começar com 5
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  // Fechar ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!openDropdown) return
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openDropdown])

  // Esconder badge quando dropdown é aberto (usuário visualizou)
  useEffect(() => {
    if (openDropdown) {
      setHasSeenNotifications(true)
      setVisibleCount(5)
      // Atualizar lastSeenAt quando usuário abre dropdown
      if (notifications.length > 0 && notifications[0]?.created_at) {
        localStorage.setItem(
          'notifications_last_seen_at',
          notifications[0].created_at,
        )
      }
    }
  }, [openDropdown, notifications])

  // Detectar scroll para carregar mais
  useEffect(() => {
    if (!openDropdown || !scrollContainerRef.current) return

    const container = scrollContainerRef.current

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      // Quando estiver próximo do final, carregar mais 5
      const threshold = 50 // pixels antes do final
      if (
        scrollHeight - scrollTop - clientHeight <= threshold &&
        visibleCount < notifications.length
      ) {
        setVisibleCount((prev) => Math.min(prev + 5, notifications.length))
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [openDropdown, visibleCount, notifications.length])

  // Verificar se há novas notificações desde a última visualização
  useEffect(() => {
    if (hasSeenNotifications && notifications.length > 0) {
      const lastSeenAt = localStorage.getItem('notifications_last_seen_at')
      if (lastSeenAt) {
        const newestNotification = notifications[0]
        if (
          newestNotification &&
          new Date(newestNotification.created_at) > new Date(lastSeenAt)
        ) {
          // Há novas notificações desde a última visualização
          setHasSeenNotifications(false)
        }
      }
    } else if (!hasSeenNotifications && unreadCount === 0) {
      // Se não há notificações não lidas, pode esconder o badge
      setHasSeenNotifications(true)
    }
  }, [notifications, hasSeenNotifications, unreadCount])

  // Formatar saldo disponível
  const availableBalance = stats?.data?.saldo_disponivel || 0
  const formattedBalance = formatCurrencyBRL(availableBalance, {
    hide: isBalanceHidden,
  })

  const handleRefresh = () => {
    // Refetch notificações
    refetch()
    // Recarregar página para atualizar todos os dados
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
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setOpenDropdown((s) => {
                const willOpen = !s
                if (willOpen) {
                  refetch()
                }
                return willOpen
              })
            }}
            className="relative p-2"
            aria-label="Notificações"
            title="Notificações"
            icon={<Bell size={20} className="text-gray-700" />}
          />
          {unreadCount > 0 && !hasSeenNotifications && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {unreadCount > 20 ? '20+' : unreadCount}
            </span>
          )}

          {openDropdown && (
            <div className="fixed top-16 right-2 md:left-auto md:right-4 lg:absolute lg:left-auto lg:top-full lg:right-0 mt-0 lg:mt-2 w-[calc(100vw-2rem)] sm:w-80 md:w-72 lg:w-80 max-w-[calc(100vw-2rem)] sm:max-w-none md:max-w-[calc(100vw-18rem-1rem)] lg:max-w-none bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[calc(100vh-6rem)] flex flex-col">
              <div className="p-2.5 border-b border-gray-100 flex items-center justify-between gap-2 flex-shrink-0">
                <span className="text-sm font-medium text-gray-900">
                  Notificações
                </span>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {unreadCount} não lida(s)
                </span>
              </div>
              <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto min-h-0"
              >
                {notifications.length === 0 ? (
                  <div className="p-6 text-sm text-gray-600 text-center">
                    Não tem notificações.
                  </div>
                ) : (
                  <>
                    {notifications.slice(0, visibleCount).map((n) => (
                      <button
                        key={n.id}
                        onClick={async () => {
                          if (!n.read_at) await markOne(n.id)
                          setOpenDropdown(false)
                          router.push(
                            `/dashboard/notificacoes?highlight=${n.id}`,
                          )
                        }}
                        className={`w-full text-left p-2.5 flex items-start gap-2 hover:bg-gray-50 transition-colors ${
                          !n.read_at ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {!n.read_at ? (
                            <span className="inline-block w-2 h-2 bg-red-500 rounded-full" />
                          ) : (
                            <CheckCircle2
                              className="text-green-600"
                              size={14}
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="text-sm font-medium text-gray-900 break-words">
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-600 break-words line-clamp-2 mt-0.5">
                            {n.body}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(n.created_at).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
              <div className="p-2 border-t border-gray-100 flex items-center justify-end flex-shrink-0">
                <Link
                  href="/dashboard/notificacoes"
                  className="text-xs text-blue-600 hover:underline px-2 py-1"
                  onClick={() => setOpenDropdown(false)}
                >
                  Ver todas
                </Link>
              </div>
            </div>
          )}
        </div>
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
              : (isBalanceHidden ? 'Mostrar' : 'Ocultar') + ' Saldo'}
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
