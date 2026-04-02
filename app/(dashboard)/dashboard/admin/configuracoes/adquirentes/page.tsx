'use client'

import React, { useMemo, useCallback, memo } from 'react'

import { Building2 } from 'lucide-react'

import { AcquirerDetailCard } from '@/components/admin/acquirers/AcquirerDetailCard'
import { useAuth } from '@/contexts/AuthContext'
import { useAcquirersList, useToggleAcquirerStatus } from '@/hooks/useAcquirers'
import type { Acquirer } from '@/lib/api'
import { USER_PERMISSION } from '@/lib/constants'

const AcquirersPage = memo(() => {
  const { user, isLoading: authLoading } = useAuth()

  const isAdmin = useMemo(
    () =>
      !!user &&
      Number(user.permission) === USER_PERMISSION.ADMIN &&
      !authLoading,
    [user, authLoading],
  )

  const { data, isLoading } = useAcquirersList({ per_page: 100 }, isAdmin)

  const toggleStatusMutation = useToggleAcquirerStatus()

  const acquirers = useMemo(() => data?.acquirers || [], [data?.acquirers])

  const handleToggleStatus = useCallback(
    async (acquirer: Acquirer) => {
      await toggleStatusMutation.mutateAsync(acquirer.id)
    },
    [toggleStatusMutation],
  )

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gerenciamento de Adquirentes
          </h1>
          <p className="text-gray-600 mt-1">
            Visualize os adquirentes de pagamento do sistema
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
            <p className="text-sm text-gray-500">Carregando adquirentes...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!acquirers || acquirers.length === 0) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gerenciamento de Adquirentes
          </h1>
          <p className="text-gray-600 mt-1">
            Visualize os adquirentes de pagamento do sistema
          </p>
        </div>
        <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
          <div className="text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-500">
              Nenhum adquirente encontrado
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Gerenciamento de Adquirentes
        </h1>
        <p className="text-gray-600 mt-1">
          Visualize e gerencie os adquirentes de pagamento do sistema
        </p>
      </div>

      <div className="space-y-4">
        {acquirers.map((acquirer) => (
          <AcquirerDetailCard
            key={acquirer.id}
            acquirer={acquirer}
            onToggleStatus={handleToggleStatus}
          />
        ))}
      </div>

      {acquirers.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            <strong>Total:</strong> {acquirers.length} adquirente(s)
            configurado(s) no sistema
          </p>
        </div>
      )}
    </div>
  )
})

AcquirersPage.displayName = 'AcquirersPage'

export default AcquirersPage
