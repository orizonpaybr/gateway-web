'use client'

import { useState } from 'react'
import { EyeOff, Eye, RefreshCw } from 'lucide-react'
import { usePathname } from 'next/navigation'

// Mapeamento de rotas para títulos
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
  const [balanceHidden, setBalanceHidden] = useState(false)
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
        <button
          onClick={() => setBalanceHidden(!balanceHidden)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title={balanceHidden ? 'Mostrar Saldo' : 'Ocultar Saldo'}
        >
          {balanceHidden ? <Eye size={18} /> : <EyeOff size={18} />}
          <span className="hidden sm:inline">
            {balanceHidden ? 'Mostrar' : 'Ocultar'} Saldo
          </span>
        </button>

        <button
          onClick={handleRefresh}
          className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Atualizar"
        >
          <RefreshCw size={18} />
        </button>
      </div>
    </header>
  )
}
