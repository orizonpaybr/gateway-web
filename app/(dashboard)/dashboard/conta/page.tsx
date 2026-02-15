'use client'

import { memo } from 'react'

import {
  User as UserIcon,
  Info as InfoIcon,
  Phone as PhoneIcon,
  Percent as PercentIcon,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react'

import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAccountData } from '@/hooks/useReactQuery'

interface TaxesData {
  deposit?: {
    fixed: number
    global_fixed?: number
    custom_fixed?: number | null
    is_custom?: boolean
  }
  withdraw?: {
    fixed: number
    global_fixed?: number
    custom_fixed?: number | null
    is_custom?: boolean
  }
}

interface AccountData {
  data?: {
    username?: string
    email?: string
    cnpj?: string
    status_text?: string
    taxes?: TaxesData
    company?: {
      razao_social?: string
      nome_fantasia?: string
      area_atuacao?: string
      tipo_pessoa?: string
      status_atual?: string
    }
    contacts?: {
      telefone_principal?: string
      email_principal?: string
    }
    [key: string]: unknown
  }
}

function formatTaxa(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

const ContaPage = memo(() => {
  const { data: accountResponse, isLoading } = useAccountData()
  const account =
    accountResponse && (accountResponse as AccountData)?.data
      ? (accountResponse as AccountData).data
      : null

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dados da Conta</h1>
        <p className="text-sm text-gray-600">Informações cadastrais</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : account ? (
        <div className="space-y-6">
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 inline-flex items-center gap-2">
              <UserIcon size={16} className="text-gray-500" /> Detalhes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="min-w-0">
                <p className="text-gray-600">Usuário:</p>
                <p className="font-medium text-gray-900 truncate">
                  {account.username as string}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-gray-600">Email:</p>
                <p className="font-medium text-gray-900 truncate">
                  {(account.email as string) || '—'}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-gray-600">CPF/CNPJ:</p>
                <p className="font-medium text-gray-900 truncate">
                  {(account.cnpj as string) || '—'}
                </p>
              </div>
            </div>

            <div className="h-6" />
            <h3 className="text-sm font-semibold text-gray-700 mb-3 inline-flex items-center gap-2">
              <InfoIcon size={16} className="text-gray-500" /> Informações
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="min-w-0">
                <p className="text-gray-600">Tipo:</p>
                <p className="font-medium text-gray-900">
                  {account.company?.tipo_pessoa || '—'}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-gray-600">Status:</p>
                <p className="font-medium text-gray-900">
                  {account.company?.status_atual || account.status_text || '—'}
                </p>
              </div>
            </div>

            <div className="h-6" />
            <h3 className="text-sm font-semibold text-gray-700 mb-3 inline-flex items-center gap-2">
              <PhoneIcon size={16} className="text-gray-500" /> Contatos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="min-w-0">
                <p className="text-gray-600">Telefone (Principal):</p>
                <p className="font-medium text-gray-900 break-words">
                  {account.contacts?.telefone_principal || '—'}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-gray-600">Email (Principal):</p>
                <p className="font-medium text-gray-900 break-words">
                  {account.contacts?.email_principal || '—'}
                </p>
              </div>
            </div>

            {(account.taxes as TaxesData | undefined) && (
              <>
                <div className="h-6" />
                <h3 className="text-sm font-semibold text-gray-700 mb-3 inline-flex items-center gap-2">
                  <PercentIcon size={16} className="text-gray-500" /> Taxas
                  fixas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="min-w-0 rounded-lg border border-gray-200 bg-gray-50/50 p-3">
                    <p className="text-gray-600 mb-1 inline-flex items-center gap-1.5">
                      <ArrowDownCircle size={14} className="text-emerald-600" />
                      Depósito (Cash In)
                    </p>
                    <p className="text-gray-500 text-xs">
                      Taxa do sistema:{' '}
                      {formatTaxa(
                        (account.taxes as TaxesData).deposit?.global_fixed ?? 0,
                      )}
                    </p>
                    {(account.taxes as TaxesData).deposit?.is_custom &&
                      (account.taxes as TaxesData).deposit?.custom_fixed !=
                        null && (
                        <p className="text-gray-500 text-xs mt-0.5">
                          Sua taxa (customizada):{' '}
                          <span className="font-medium text-gray-900">
                            {formatTaxa(
                              (account.taxes as TaxesData).deposit?.custom_fixed ??
                                0,
                            )}
                          </span>
                        </p>
                      )}
                    <p className="font-medium text-gray-900 mt-1.5">
                      Taxa aplicada:{' '}
                      {formatTaxa(
                        (account.taxes as TaxesData).deposit?.fixed ?? 0,
                      )}
                    </p>
                  </div>
                  <div className="min-w-0 rounded-lg border border-gray-200 bg-gray-50/50 p-3">
                    <p className="text-gray-600 mb-1 inline-flex items-center gap-1.5">
                      <ArrowUpCircle size={14} className="text-amber-600" />
                      Saque (Cash Out)
                    </p>
                    <p className="text-gray-500 text-xs">
                      Taxa do sistema:{' '}
                      {formatTaxa(
                        (account.taxes as TaxesData).withdraw?.global_fixed ??
                          0,
                      )}
                    </p>
                    {(account.taxes as TaxesData).withdraw?.is_custom &&
                      (account.taxes as TaxesData).withdraw?.custom_fixed !=
                        null && (
                        <p className="text-gray-500 text-xs mt-0.5">
                          Sua taxa (customizada):{' '}
                          <span className="font-medium text-gray-900">
                            {formatTaxa(
                              (account.taxes as TaxesData).withdraw
                                ?.custom_fixed ?? 0,
                            )}
                          </span>
                        </p>
                      )}
                    <p className="font-medium text-gray-900 mt-1.5">
                      Taxa aplicada:{' '}
                      {formatTaxa(
                        (account.taxes as TaxesData).withdraw?.fixed ?? 0,
                      )}
                    </p>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      ) : (
        <div className="text-sm text-gray-600">
          Não foi possível carregar os dados da conta.
        </div>
      )}
    </div>
  )
})

export default ContaPage
