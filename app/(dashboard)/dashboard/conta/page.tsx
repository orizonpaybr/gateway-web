'use client'

import { useMemo, memo } from 'react'

import {
  User as UserIcon,
  Info as InfoIcon,
  Phone as PhoneIcon,
  ArrowDownLeft,
  ArrowUpRight,
  BadgePercent,
  Settings as SettingsIcon,
  Home,
  Cloud,
} from 'lucide-react'

import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAccountData } from '@/hooks/useReactQuery'
import { formatCurrencyBRL } from '@/lib/format'

interface AccountData {
  data?: {
    username?: string
    email?: string
    cnpj?: string
    status_text?: string
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
    taxes?: {
      deposit?: {
        fixed?: number
      }
      withdraw?: {
        dashboard?: {
          fixed?: number
        }
        api?: {
          fixed?: number
        }
      }
      affiliate?: {
        fixed?: number
      }
    }
    limits?: {
      withdraw_min?: number
      retention_value?: number
    }
    features?: {
      saque_automatico?: boolean
      saque_via_dashboard?: boolean
      saque_via_api?: boolean
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

  const taxes = useMemo(() => account?.taxes ?? {}, [account])
  const limits = useMemo(() => account?.limits ?? {}, [account])
  const features = useMemo(() => account?.features ?? {}, [account])

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dados da Conta</h1>
        <p className="text-sm text-gray-600">
          Informações cadastrais, taxas e limites
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-40 w-full" />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 text-sm">
              <div className="min-w-0">
                <p className="text-gray-600">Razão Social:</p>
                <p className="font-medium text-gray-900 break-words">
                  {account.company?.razao_social || '—'}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-gray-600">Nome Fantasia:</p>
                <p className="font-medium text-gray-900 break-words">
                  {account.company?.nome_fantasia || '—'}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-gray-600">Área de Atuação:</p>
                <p className="font-medium text-gray-900 break-words">
                  {account.company?.area_atuacao || '—'}
                </p>
              </div>
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
            <div className="h-6" />
            <h3 className="text-sm font-semibold text-gray-700 mb-3 inline-flex items-center gap-2">
              <ArrowDownLeft size={16} className="text-green-600" /> Taxas de
              Depósito (Cash In)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Info
                label="Taxa Fixa"
                value={formatCurrencyBRL(taxes?.deposit?.fixed ?? 0)}
                color="green"
                size="lg"
              />
            </div>
            <div className="h-6" />
            <h3 className="text-sm font-semibold text-gray-700 mb-3 inline-flex items-center gap-2">
              <ArrowUpRight size={16} className="text-red-600" /> Taxas de Saque
              (Cash Out)
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-600 uppercase inline-flex items-center gap-1">
                  <Home size={12} /> Dashboard
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <Info
                    label="Taxa Fixa"
                    value={formatCurrencyBRL(
                      taxes?.withdraw?.dashboard?.fixed ?? 0,
                    )}
                    color="red"
                    size="lg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-600 uppercase inline-flex items-center gap-1">
                  <Cloud size={12} /> API
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <Info
                    label="Taxa Fixa"
                    value={formatCurrencyBRL(taxes?.withdraw?.api?.fixed ?? 0)}
                    color="red"
                    size="lg"
                  />
                </div>
              </div>
            </div>
            <div className="h-6" />
            <h3 className="text-sm font-semibold text-gray-700 mb-3 inline-flex items-center gap-2">
              <BadgePercent size={16} className="text-blue-600" /> Limites
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <Info
                label="Saque Mínimo"
                value={formatCurrencyBRL(limits?.withdraw_min ?? 0)}
                color="indigo"
              />
              <Info
                label="Retenção"
                value={formatCurrencyBRL(limits?.retention_value ?? 0)}
                color="indigo"
              />
            </div>
            <div className="h-6" />
            <h3 className="text-sm font-semibold text-gray-700 mb-3 inline-flex items-center gap-2">
              <SettingsIcon size={16} className="text-gray-600" /> Configurações
              de Funcionalidades
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <Flag
                label="Saque Automático"
                enabled={!!features?.saque_automatico}
              />
              <Flag
                label="Saque via Dashboard"
                enabled={!!features?.saque_via_dashboard}
              />
              <Flag label="Saque via API" enabled={!!features?.saque_via_api} />
            </div>
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

function Info({
  label,
  value,
  color = 'gray',
  size = 'md',
}: {
  label: string
  value: string
  color?: 'green' | 'red' | 'indigo' | 'gray'
  size?: 'md' | 'lg'
}) {
  const colorClasses = {
    green: 'bg-green-50',
    red: 'bg-red-50',
    indigo: 'bg-indigo-50',
    gray: 'bg-gray-50',
  }

  return (
    <div
      className={`rounded-lg ${size === 'lg' ? 'p-4' : 'p-3'} ${
        colorClasses[color]
      } min-w-0`}
    >
      <p
        className={`${
          size === 'lg' ? 'text-xs' : 'text-xs'
        } text-gray-600 break-words`}
      >
        {label}
      </p>
      <p
        className={`${
          size === 'lg' ? 'text-base' : 'text-sm'
        } font-semibold text-gray-900 break-words truncate`}
        title={value}
      >
        {value}
      </p>
    </div>
  )
}

function Flag({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className={`rounded-lg p-3 ${enabled ? 'bg-green-50' : 'bg-red-50'}`}>
      <p className="text-xs text-gray-600">{label}</p>
      <span
        className={`inline-flex mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
          enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}
      >
        {enabled ? 'Liberado' : 'Inativo'}
      </span>
    </div>
  )
}
