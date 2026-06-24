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

interface TaxItemFixed {
  mode?: 'fixed'
  fixed: number
  global_fixed?: number
  custom_fixed?: number | null
  is_custom?: boolean
}

interface TaxItemPercent {
  mode: 'percent'
  percent: number
  is_custom?: boolean
}

type TaxItem = TaxItemFixed | TaxItemPercent

interface TaxesData {
  mode?: 'fixed' | 'percent'
  deposit?: TaxItem
  withdraw?: TaxItem
}

function formatTaxa(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

function formatPercentual(value: number): string {
  const formatted = Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/\.?0+$/, '').replace('.', ',')
  return `${formatted}%`
}

function isPercentTax(item?: TaxItem): item is TaxItemPercent {
  return item?.mode === 'percent'
}

function isFixedTax(item?: TaxItem): item is TaxItemFixed {
  return item != null && item.mode !== 'percent'
}

function DepositTaxDetails({ tax }: { tax?: TaxItem }) {
  if (isPercentTax(tax)) {
    return (
      <>
        <p className="text-gray-500 text-xs">
          Sua taxa (customizada):{' '}
          <span className="font-medium text-gray-900">
            {formatPercentual(tax.percent)}
          </span>
        </p>
        <p className="font-medium text-gray-900 mt-1.5">
          Taxa aplicada: {formatPercentual(tax.percent)} sobre o valor
        </p>
      </>
    )
  }

  return (
    <>
      <p className="text-gray-500 text-xs">
        Taxa do sistema: {formatTaxa(tax?.global_fixed ?? 0)}
      </p>
      {isFixedTax(tax) && tax.is_custom && tax.custom_fixed != null && (
        <p className="text-gray-500 text-xs mt-0.5">
          Sua taxa (customizada):{' '}
          <span className="font-medium text-gray-900">
            {formatTaxa(tax.custom_fixed)}
          </span>
        </p>
      )}
      <p className="font-medium text-gray-900 mt-1.5">
        Taxa aplicada: {formatTaxa(tax?.fixed ?? 0)}
      </p>
    </>
  )
}

function WithdrawTaxDetails({ tax }: { tax?: TaxItem }) {
  if (isPercentTax(tax)) {
    return (
      <>
        <p className="text-gray-500 text-xs">
          Sua taxa (customizada):{' '}
          <span className="font-medium text-gray-900">
            {formatPercentual(tax.percent)}
          </span>
        </p>
        <p className="font-medium text-gray-900 mt-1.5">
          Taxa aplicada: {formatPercentual(tax.percent)} sobre o valor
        </p>
      </>
    )
  }

  return (
    <>
      <p className="text-gray-500 text-xs">
        Taxa do sistema: {formatTaxa(tax?.global_fixed ?? 0)}
      </p>
      {isFixedTax(tax) && tax.is_custom && tax.custom_fixed != null && (
        <p className="text-gray-500 text-xs mt-0.5">
          Sua taxa (customizada):{' '}
          <span className="font-medium text-gray-900">
            {formatTaxa(tax.custom_fixed)}
          </span>
        </p>
      )}
      <p className="font-medium text-gray-900 mt-1.5">
        Taxa aplicada: {formatTaxa(tax?.fixed ?? 0)}
      </p>
    </>
  )
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

            {account.taxes && (
              <>
                <div className="h-6" />
                <h3 className="text-sm font-semibold text-gray-700 mb-3 inline-flex items-center gap-2">
                  <PercentIcon size={16} className="text-gray-500" />
                  {(account.taxes as TaxesData).mode === 'percent'
                    ? 'Taxas por porcentagem'
                    : 'Taxas fixas'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="min-w-0 rounded-lg border border-gray-200 bg-gray-50/50 p-3">
                    <p className="text-gray-600 mb-1 inline-flex items-center gap-1.5">
                      <ArrowDownCircle size={14} className="text-emerald-600" />
                      Depósito (Cash In)
                    </p>
                    <DepositTaxDetails
                      tax={(account.taxes as TaxesData).deposit}
                    />
                  </div>
                  <div className="min-w-0 rounded-lg border border-gray-200 bg-gray-50/50 p-3">
                    <p className="text-gray-600 mb-1 inline-flex items-center gap-1.5">
                      <ArrowUpCircle size={14} className="text-amber-600" />
                      Saque (Cash Out)
                    </p>
                    <WithdrawTaxDetails
                      tax={(account.taxes as TaxesData).withdraw}
                    />
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
