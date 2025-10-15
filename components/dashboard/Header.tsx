'use client'

import { EyeOff, Eye, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { usePathname } from 'next/navigation'
import { useBalanceVisibility } from '@/contexts/BalanceVisibilityContext'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard Orizon',
  '/dashboard/jornada': 'Jornada Orizon',
  '/dashboard/buscar': 'Buscar Transações',
  '/dashboard/extrato': 'Extrato',
  '/dashboard/pix': 'Pix',
  '/dashboard/qr-codes': 'QR Codes',
  '/dashboard/infracoes': 'Infrações',
  '/dashboard/pendentes': 'Transações Pendentes',
  '/dashboard/conta': 'Dados da Conta',
  '/dashboard/configuracoes': 'Configurações',
  '/dashboard/suporte': 'Suporte',
  '/dashboard/api-docs': 'API Docs',
}

export function Header() {
  const { isBalanceHidden, toggleBalanceVisibility } = useBalanceVisibility()
  const pathname = usePathname()
  const pageTitle = pageTitles[pathname] || 'Dashboard Orizon'

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <header className="fixed top-0 right-0 left-72 h-16 bg-gray-50 flex items-center justify-between px-8 z-10">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
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
            {isBalanceHidden ? 'Mostrar' : 'Ocultar'} Saldo
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
}
