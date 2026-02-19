'use client'

import { useState, useEffect, Suspense, lazy, memo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Search,
  List,
  Wallet,
  QrCode,
  User,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  X,
  LayoutDashboard,
  Users,
  UserPlus,
  DollarSign,
} from 'lucide-react'
import { DocumentIcon } from '@/components/icons/DocumentIcon'
import { PixIcon } from '@/components/icons/PixIcon'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { AnimatedAvatar } from '@/components/ui/AnimatedAvatar'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useMobileMenu } from '@/contexts/MobileMenuContext'
import { useSidebarGamification } from '@/hooks/useSidebarGamification'
import { cn } from '@/lib/utils'

const SidebarProgress = lazy(
  () => import('@/components/gamification/SidebarProgress'),
)
interface MenuItem {
  icon: React.ElementType
  label: string
  href: string
  hasSubmenu?: boolean
  submenu?: { label: string; href: string }[]
  secondaryText?: string
  isExternal?: boolean
}

const mainMenuItems: MenuItem[] = [
  { icon: Home, label: 'Página inicial', href: '/dashboard' },
  { icon: Search, label: 'Buscar Transações', href: '/dashboard/buscar' },
  {
    icon: List,
    label: 'Extrato',
    href: '/dashboard/extrato/depositos',
    hasSubmenu: true,
    submenu: [
      { label: 'Depósitos', href: '/dashboard/extrato/depositos' },
      { label: 'Saques', href: '/dashboard/extrato/saques' },
    ],
  },
  {
    icon: PixIcon,
    label: 'Pix',
    href: '/dashboard/pix/chave',
    hasSubmenu: true,
    submenu: [
      { label: 'Depositar', href: '/dashboard/pix/depositar' },
      { label: 'Saque', href: '/dashboard/pix/chave' },
      { label: 'Infrações', href: '/dashboard/pix/infracoes' },
    ],
  },
  {
    icon: QrCode,
    label: 'QR Codes',
    href: '/dashboard/qr-codes',
    hasSubmenu: true,
    submenu: [{ label: 'Listagem', href: '/dashboard/qr-codes/listagem' }],
  },
  { icon: UserPlus, label: 'Programa Partners', href: '/dashboard/afiliados' },
  { icon: User, label: 'Dados da Conta', href: '/dashboard/conta' },
  {
    icon: Settings,
    label: 'Configurações',
    href: '/dashboard/configuracoes',
  },
]

const supportAndDocsItems: MenuItem[] = [
  {
    icon: WhatsAppIcon,
    label: 'Suporte',
    href: 'https://wa.me/5549988906647',
    secondaryText: 'Fale conosco no WhatsApp',
    isExternal: true,
  },
  {
    icon: DocumentIcon,
    label: 'API Docs',
    href: '/dashboard/api-docs',
    secondaryText: 'Documentação da API',
  },
]

export const Sidebar = memo(() => {
  const pathname = usePathname()
  const { user, authReady, logout } = useAuth()
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { isMobileMenuOpen, closeMobileMenu } = useMobileMenu()

  // Hook otimizado para gamificação da Sidebar
  const {
    currentLevel,
    totalDeposited,
    currentLevelMin,
    currentLevelMax,
    nextLevelData,
    isLoading: gamificationLoading,
    error: _gamificationError,
  } = useSidebarGamification()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  useEffect(() => {
    if (isMobile) {
      closeMobileMenu()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isMobile])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const toggleSubmenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    )
  }

  return (
    <>
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeMobileMenu}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              closeMobileMenu()
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Fechar menu"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-gray-50 shadow-sm flex flex-col z-40 transition-transform duration-300 ease-in-out',
          'w-72', // Desktop width
          // Em mobile: esconde se fechado, mostra se aberto
          // Em desktop: sempre visível
          isMobile
            ? isMobileMenuOpen
              ? 'translate-x-0'
              : '-translate-x-full'
            : '',
        )}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex flex-1 justify-center"
            onClick={closeMobileMenu}
          >
            <Image
              src="/Orizon-Pay---Logo---FINANCE-v1.98.0Prancheta-1.png"
              alt="Orizon Pay Finance"
              width={180}
              height={56}
              priority
              className="object-contain"
            />
          </Link>

          {isMobile && (
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors ml-2"
              aria-label="Fechar menu"
            >
              <X size={24} className="text-gray-600" />
            </button>
          )}
        </div>

        <div className="px-4 py-5">
          <Suspense
            fallback={
              <div className="bg-white rounded-lg p-5 space-y-3 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse" />
                    <div className="h-4 w-16 bg-gray-300 rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-20 bg-gray-300 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="w-full h-1.5 bg-gray-200 rounded-full" />
                  <div className="flex justify-between items-center">
                    <div className="h-3 w-16 bg-gray-300 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-gray-300 rounded animate-pulse" />
                  </div>
                  <div className="text-center">
                    <div className="h-3 w-24 bg-gray-300 rounded animate-pulse mx-auto" />
                  </div>
                </div>
              </div>
            }
          >
            <SidebarProgress
              currentLevel={currentLevel}
              totalDeposited={totalDeposited}
              currentLevelMin={currentLevelMin}
              currentLevelMax={currentLevelMax}
              nextLevelData={nextLevelData}
              isLoading={gamificationLoading}
            />
          </Suspense>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="space-y-2">
            {mainMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              const isSubmenuExpanded = expandedMenus.includes(item.label)
              const hasActiveSubmenu = item.submenu?.some(
                (subItem) => pathname === subItem.href,
              )

              return (
                <li key={item.href}>
                  {item.hasSubmenu ? (
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSubmenu(item.label)}
                        className={cn(
                          'flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                          isActive || hasActiveSubmenu
                            ? 'bg-primary text-white hover:!bg-primary hover:!text-white'
                            : 'text-gray-700 hover:bg-gray-100',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} />
                          {item.label}
                        </div>
                        {isSubmenuExpanded ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </Button>

                      {isSubmenuExpanded && item.submenu && (
                        <ul className="mt-1 ml-6 space-y-1">
                          {item.submenu.map((subItem) => {
                            const isSubActive = pathname === subItem.href
                            return (
                              <li key={subItem.href}>
                                <Link
                                  href={subItem.href}
                                  onClick={() => isMobile && closeMobileMenu()}
                                  className={cn(
                                    'block px-4 py-2.5 rounded-lg text-sm transition-colors',
                                    isSubActive
                                      ? 'bg-primary text-white'
                                      : 'text-gray-600 hover:bg-gray-100',
                                  )}
                                >
                                  {subItem.label}
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => isMobile && closeMobileMenu()}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100',
                      )}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  )}
                </li>
              )
            })}

            {authReady &&
              (Number(user?.permission) === 3 ||
                Number(user?.permission) === 2) && (
                <>
                  <li aria-hidden className="my-3">
                    <div className="border-t border-gray-200" />
                  </li>
                  <li className="px-4 py-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Administração
                    </span>
                  </li>
                  {Number(user?.permission) === 3 && (
                    <>
                      <li>
                        <Link
                          href="/dashboard/admin"
                          onClick={() => isMobile && closeMobileMenu()}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                            pathname === '/dashboard/admin'
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700',
                          )}
                        >
                          <LayoutDashboard size={18} />
                          <span>Dashboard</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/dashboard/admin/usuarios"
                          onClick={() => isMobile && closeMobileMenu()}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                            pathname === '/dashboard/admin/usuarios'
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700',
                          )}
                        >
                          <Users size={18} />
                          <span>Usuários</span>
                        </Link>
                      </li>
                    </>
                  )}
                  <li>
                    <Link
                      href="/dashboard/admin/aprovar-saques"
                      onClick={() => isMobile && closeMobileMenu()}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                        pathname === '/dashboard/admin/aprovar-saques'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700',
                      )}
                    >
                      <Wallet size={18} />
                      <span>Aprovar Saques</span>
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => toggleSubmenu('Financeiro')}
                      className={cn(
                        'flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                        pathname.startsWith('/dashboard/admin/financeiro')
                          ? 'bg-primary text-white hover:!bg-primary hover:!text-white'
                          : 'text-gray-700 hover:bg-gray-100',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <DollarSign size={18} />
                        <span>Financeiro</span>
                      </div>
                      {expandedMenus.includes('Financeiro') ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                    {expandedMenus.includes('Financeiro') && (
                      <ul className="mt-1 ml-6 space-y-1">
                        <li>
                          <Link
                            href="/dashboard/admin/financeiro/transacoes"
                            onClick={() => isMobile && closeMobileMenu()}
                            className={cn(
                              'block px-4 py-2.5 rounded-lg text-sm transition-colors',
                              pathname ===
                                '/dashboard/admin/financeiro/transacoes'
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-100',
                            )}
                          >
                            Transações
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/dashboard/admin/financeiro/carteiras"
                            onClick={() => isMobile && closeMobileMenu()}
                            className={cn(
                              'block px-4 py-2.5 rounded-lg text-sm transition-colors',
                              pathname ===
                                '/dashboard/admin/financeiro/carteiras'
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-100',
                            )}
                          >
                            Carteiras
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/dashboard/admin/financeiro/entradas"
                            onClick={() => isMobile && closeMobileMenu()}
                            className={cn(
                              'block px-4 py-2.5 rounded-lg text-sm transition-colors',
                              pathname ===
                                '/dashboard/admin/financeiro/entradas'
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-100',
                            )}
                          >
                            Entradas
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/dashboard/admin/financeiro/saidas"
                            onClick={() => isMobile && closeMobileMenu()}
                            className={cn(
                              'block px-4 py-2.5 rounded-lg text-sm transition-colors',
                              pathname === '/dashboard/admin/financeiro/saidas'
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-100',
                            )}
                          >
                            Saídas
                          </Link>
                        </li>
                      </ul>
                    )}
                  </li>
                  <li>
                    <button
                      onClick={() => toggleSubmenu('Configuracoes')}
                      className={cn(
                        'flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                        pathname.startsWith('/dashboard/admin/configuracoes')
                          ? 'bg-primary text-white hover:!bg-primary hover:!text-white'
                          : 'text-gray-700 hover:bg-gray-100',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Settings size={18} />
                        <span>Configurações</span>
                      </div>
                      {expandedMenus.includes('Configuracoes') ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                    {expandedMenus.includes('Configuracoes') && (
                      <ul className="mt-1 ml-6 space-y-1">
                        <li>
                          <Link
                            href="/dashboard/admin/configuracoes/gerais"
                            onClick={() => isMobile && closeMobileMenu()}
                            className={cn(
                              'block px-4 py-2.5 rounded-lg text-sm transition-colors',
                              pathname ===
                                '/dashboard/admin/configuracoes/gerais'
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-100',
                            )}
                          >
                            Gerais
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/dashboard/admin/configuracoes/adquirentes"
                            onClick={() => isMobile && closeMobileMenu()}
                            className={cn(
                              'block px-4 py-2.5 rounded-lg text-sm transition-colors',
                              pathname ===
                                '/dashboard/admin/configuracoes/adquirentes'
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-100',
                            )}
                          >
                            Adquirentes
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/dashboard/admin/configuracoes/gerentes"
                            onClick={() => isMobile && closeMobileMenu()}
                            className={cn(
                              'block px-4 py-2.5 rounded-lg text-sm transition-colors',
                              pathname ===
                                '/dashboard/admin/configuracoes/gerentes'
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-100',
                            )}
                          >
                            Gerentes
                          </Link>
                        </li>
                      </ul>
                    )}
                  </li>
                </>
              )}
          </ul>

          <div className="my-6 border-t border-gray-200" />

          <ul className="space-y-2">
            {supportAndDocsItems.map((item) => {
              const Icon = item.icon
              const LinkComponent = item.isExternal ? 'a' : Link

              return (
                <li key={item.label}>
                  <LinkComponent
                    href={item.href}
                    target={item.isExternal ? '_blank' : undefined}
                    rel={item.isExternal ? 'noopener noreferrer' : undefined}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      'text-gray-700 hover:bg-gray-100',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon />
                      <div className="flex flex-col">
                        <span className="font-semibold text-blue-900">
                          {item.label}
                        </span>
                        {item.secondaryText && (
                          <span className="text-xs text-blue-600">
                            {item.secondaryText}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.isExternal && (
                      <ExternalLink size={16} className="text-gray-400" />
                    )}
                  </LinkComponent>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="px-4 py-5 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AnimatedAvatar
                gender={isHydrated ? user?.gender : null}
                size="md"
              />
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-blue-900">
                  {isHydrated && user?.name
                    ? user.name.split(' ')[0]
                    : 'Usuário'}
                </p>
                <p className="text-xs text-gray-500">
                  {isHydrated && user?.name && user.name.split(' ').length > 1
                    ? `${user.name.split(' ').slice(1).join(' ')} ${
                        user?.agency || ''
                      }`
                    : user?.agency || ''}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<LogOut size={16} />}
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700"
            >
              <span className="text-sm font-medium">Sair</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
})
