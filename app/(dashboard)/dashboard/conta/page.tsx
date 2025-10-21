'use client'

import { useMemo, memo } from 'react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAccountData } from '@/hooks/useReactQuery'
import { formatCurrencyBRL } from '@/lib/format'
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

const ContaPage = memo(function ContaPage() {
  const { data: accountResponse, isLoading } = useAccountData() as any
  const account =
    accountResponse && (accountResponse as any).data
      ? (accountResponse as any).data
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Usuário:</p>
                <p className="font-medium text-gray-900">{account.username}</p>
              </div>
              <div>
                <p className="text-gray-600">Email:</p>
                <p className="font-medium text-gray-900">
                  {account.email || '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">CPF/CNPJ:</p>
                <p className="font-medium text-gray-900">
                  {account.cnpj || '—'}
                </p>
              </div>
            </div>
            <div className="h-6" />
            <h3 className="text-sm font-semibold text-gray-700 mb-3 inline-flex items-center gap-2">
              <InfoIcon size={16} className="text-gray-500" /> Informações
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Razão Social:</p>
                <p className="font-medium text-gray-900">
                  {account.company?.razao_social || '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Nome Fantasia:</p>
                <p className="font-medium text-gray-900">
                  {account.company?.nome_fantasia || '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Área de Atuação:</p>
                <p className="font-medium text-gray-900">
                  {account.company?.area_atuacao || '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Tipo:</p>
                <p className="font-medium text-gray-900">
                  {account.company?.tipo_pessoa || '—'}
                </p>
              </div>
              <div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Telefone (Principal):</p>
                <p className="font-medium text-gray-900">
                  {account.contacts?.telefone_principal || '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Email (Principal):</p>
                <p className="font-medium text-gray-900">
                  {account.contacts?.email_principal || '—'}
                </p>
              </div>
            </div>
            <div className="h-6" />
            <h3 className="text-sm font-semibold text-gray-700 mb-3 inline-flex items-center gap-2">
              <ArrowDownLeft size={16} className="text-green-600" /> Taxas de
              Depósito (Cash In)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-sm">
              <Info
                label="Taxa Fixa"
                value={formatCurrencyBRL(taxes?.deposit?.fixed ?? 0)}
                color="green"
                size="lg"
              />
              <Info
                label="Taxa Percentual"
                value={`${taxes?.deposit?.percent ?? 0}%`}
                color="green"
                size="lg"
              />
              <Info
                label="Taxa Fixa (após limite)"
                value={formatCurrencyBRL(
                  taxes?.deposit?.after_limit_fixed ?? 0,
                )}
                color="green"
                size="lg"
              />
              <Info
                label="Taxa % (após limite)"
                value={`${taxes?.deposit?.after_limit_percent ?? 0}%`}
                color="green"
                size="lg"
              />
            </div>
            <div className="h-6" />
            <h3 className="text-sm font-semibold text-gray-700 mb-3 inline-flex items-center gap-2">
              <ArrowUpRight size={16} className="text-red-600" /> Taxas de Saque
              (Cash Out)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-600 uppercase inline-flex items-center gap-1">
                  <Home size={12} /> Dashboard
                </p>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-sm">
                  <Info
                    label="Taxa Fixa"
                    value={formatCurrencyBRL(
                      taxes?.withdraw?.dashboard?.fixed ?? 0,
                    )}
                    color="red"
                    size="lg"
                  />
                  <Info
                    label="Taxa Percentual"
                    value={`${taxes?.withdraw?.dashboard?.percent ?? 0}%`}
                    color="red"
                    size="lg"
                  />
                  <Info
                    label="Taxa Fixa (após limite)"
                    value={formatCurrencyBRL(
                      taxes?.withdraw?.dashboard?.after_limit_fixed ?? 0,
                    )}
                    color="red"
                    size="lg"
                  />
                  <Info
                    label="Taxa % (após limite)"
                    value={`${
                      taxes?.withdraw?.dashboard?.after_limit_percent ?? 0
                    }%`}
                    color="red"
                    size="lg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-600 uppercase inline-flex items-center gap-1">
                  <Cloud size={12} /> API
                </p>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-sm">
                  <Info
                    label="Taxa Fixa"
                    value={formatCurrencyBRL(taxes?.withdraw?.api?.fixed ?? 0)}
                    color="red"
                    size="lg"
                  />
                  <Info
                    label="Taxa Percentual"
                    value={`${taxes?.withdraw?.api?.percent ?? 0}%`}
                    color="red"
                    size="lg"
                  />
                  <Info
                    label="Taxa Fixa (após limite)"
                    value={formatCurrencyBRL(
                      taxes?.withdraw?.api?.after_limit_fixed ?? 0,
                    )}
                    color="red"
                    size="lg"
                  />
                  <Info
                    label="Taxa % (após limite)"
                    value={`${taxes?.withdraw?.api?.after_limit_percent ?? 0}%`}
                    color="red"
                    size="lg"
                  />
                </div>
              </div>
            </div>
            <div className="h-6" />
            <h3 className="text-sm font-semibold text-gray-700 mb-3 inline-flex items-center gap-2">
              <BadgePercent size={16} className="text-purple-600" /> Taxas de
              Afiliado
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-sm">
              <Info
                label="Taxa Fixa"
                value={formatCurrencyBRL(taxes?.affiliate?.fixed ?? 0)}
                color="indigo"
                size="lg"
              />
              <Info
                label="Taxa Percentual"
                value={`${taxes?.affiliate?.percent ?? 0}%`}
                color="indigo"
                size="lg"
              />
            </div>
            <div className="h-6" />
            <h3 className="text-sm font-semibold text-gray-700 mb-3 inline-flex items-center gap-2">
              <BadgePercent size={16} className="text-blue-600" /> Limites e
              Retenção
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
              <Info
                label="Depósito Mínimo"
                value={formatCurrencyBRL(limits?.deposit_min ?? 0)}
                color="indigo"
              />
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
              <Info
                label="Taxa de Retenção"
                value={`${limits?.retention_percent ?? 0}%`}
                color="indigo"
              />
            </div>
            <div className="h-6" />
            <h3 className="text-sm font-semibold text-gray-700 mb-3 inline-flex items-center gap-2">
              <SettingsIcon size={16} className="text-gray-600" /> Configurações
              de Funcionalidades
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
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
  return (
    <div
      className={`rounded-lg ${size === 'lg' ? 'p-4' : 'p-3'} bg-${color}-50`}
    >
      <p className={`${size === 'lg' ? 'text-xs' : 'text-xs'} text-gray-600`}>
        {label}
      </p>
      <p
        className={`${
          size === 'lg' ? 'text-base' : 'text-sm'
        } font-semibold text-gray-900`}
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
