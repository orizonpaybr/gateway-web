'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  TrendingUp,
  Search,
  FileText,
  Send,
  QrCode,
  AlertTriangle,
  Clock,
  User,
  Settings,
  HelpCircle,
  BookOpen,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: TrendingUp, label: 'Jornada HorsePay', href: '/dashboard/jornada' },
  { icon: Search, label: 'Buscar Transações', href: '/dashboard/buscar' },
  { icon: FileText, label: 'Extrato', href: '/dashboard/extrato' },
  { icon: Send, label: 'Pix', href: '/dashboard/pix' },
  { icon: QrCode, label: 'QR Codes', href: '/dashboard/qr-codes' },
  { icon: AlertTriangle, label: 'Infrações', href: '/dashboard/infracoes' },
  { icon: Clock, label: 'Transações Pendentes', href: '/dashboard/pendentes' },
  { icon: User, label: 'Dados da Conta', href: '/dashboard/conta' },
  { icon: Settings, label: 'Configurações', href: '/dashboard/configuracoes' },
  { icon: HelpCircle, label: 'Suporte', href: '/dashboard/suporte' },
  { icon: BookOpen, label: 'API Docs', href: '/dashboard/api-docs' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🐴</span>
          <div>
            <h1 className="font-bold text-lg text-gray-900">HORSE PAY</h1>
            <p className="text-xs text-primary">Finance</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
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
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors">
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  )
}
