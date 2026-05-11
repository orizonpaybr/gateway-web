'use client'

import React, { useMemo, useCallback, memo } from 'react'
import { Building2, Star } from 'lucide-react'
import { AcquirerDetailCard } from '@/components/admin/acquirers/AcquirerDetailCard'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/contexts/AuthContext'
import { useAcquirersList, useSetDefaultAcquirer } from '@/hooks/useAcquirers'
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

  const setDefaultMutation = useSetDefaultAcquirer()

  const acquirers = useMemo(() => data?.acquirers || [], [data?.acquirers])

  const isAcquirerActive = useCallback(
    (a: Acquirer) => a.status === 1 || a.status === true,
    [],
  )

  const isAcquirerGlobal = useCallback(
    (a: Acquirer) => a.is_default === 1 || a.is_default === true,
    [],
  )

  const activeAcquirers = useMemo(
    () => acquirers.filter(isAcquirerActive),
    [acquirers, isAcquirerActive],
  )

  const currentGlobal = useMemo(
    () => activeAcquirers.find(isAcquirerGlobal),
    [activeAcquirers, isAcquirerGlobal],
  )

  const globalOptions = useMemo(
    () =>
      activeAcquirers.map((a) => ({
        value: String(a.id),
        label: a.adquirente,
      })),
    [activeAcquirers],
  )

  const handleGlobalChange = useCallback(
    async (value: string) => {
      const id = Number(value)
      if (!id || setDefaultMutation.isPending) {
        return
      }
      if (currentGlobal && currentGlobal.id === id) {
        return
      }
      await setDefaultMutation.mutateAsync(id)
    },
    [setDefaultMutation, currentGlobal],
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
          Visualize e defina qual adquirente é a Global (padrão PIX) do sistema
        </p>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-50 mt-1">
            <Star className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-900">
              Adquirente Global PIX
            </h2>
            <p className="text-sm text-gray-600 mt-1 mb-3">
              Define qual adquirente o sistema usa como padrão para PIX (cash-in
              e cash-out). Usuários sem override individual seguem essa escolha.
            </p>
            <div className="max-w-md">
              <Select
                value={currentGlobal ? String(currentGlobal.id) : ''}
                onChange={handleGlobalChange}
                options={globalOptions}
                disabled={
                  setDefaultMutation.isPending || activeAcquirers.length === 0
                }
                placeholder={
                  activeAcquirers.length === 0
                    ? 'Nenhuma adquirente disponível'
                    : 'Selecione a Global'
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {acquirers.map((acquirer) => (
          <AcquirerDetailCard key={acquirer.id} acquirer={acquirer} />
        ))}
      </div>

      {acquirers.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            <strong>Total:</strong> {acquirers.length} adquirente(s)
            configurado(s) — {activeAcquirers.length} habilitada(s)
          </p>
        </div>
      )}
    </div>
  )
})

AcquirersPage.displayName = 'AcquirersPage'

export default AcquirersPage
