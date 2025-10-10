'use client'

import { Bell, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { user } = useAuth()
  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Bem-vindo de volta!
        </h2>
        <p className="text-xs text-gray-500">
          Gerencie suas finanças com facilidade
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <p className="text-sm font-medium text-gray-900">
                {user?.name || 'Usuário'}
              </p>
              {user?.status === 5 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                  Pendente
                </span>
              )}
              {user?.status === 1 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  Ativa
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {user?.email || 'usuario@email.com'}
            </p>
          </div>
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  )
}
