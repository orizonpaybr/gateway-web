'use client'

import { memo, useMemo } from 'react'
import {
  Bell,
  Check,
  AlertCircle,
  DollarSign,
  Shield,
  Info,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Switch } from '@/components/ui/Switch'
import { useNotificationSettings } from '@/hooks/useNotificationSettings'

export const ConfiguracoesNotificacoesTab = memo(() => {
  const {
    preferences,
    isLoading,
    isError,
    togglePreference,
    isUpdating,
    hasCredentials,
  } = useNotificationSettings()

  const notificationTypes = useMemo(
    () => [
      {
        key: 'notify_transactions' as const,
        title: 'Transações',
        description: 'Receba notificações sobre todas as transações realizadas',
        icon: Bell,
      },
      {
        key: 'notify_deposits' as const,
        title: 'Depósitos',
        description: 'Seja notificado quando receber depósitos',
        icon: DollarSign,
      },
      {
        key: 'notify_withdrawals' as const,
        title: 'Saques',
        description: 'Receba alertas sobre saques realizados',
        icon: AlertCircle,
      },
      {
        key: 'notify_security' as const,
        title: 'Segurança',
        description:
          'Alertas de login, alterações de senha e atividades suspeitas',
        icon: Shield,
      },
      {
        key: 'notify_system' as const,
        title: 'Sistema',
        description: 'Notificações do sistema, atualizações e manutenções',
        icon: Info,
      },
    ],
    [],
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Carregando preferências...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <Card>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle
              className="text-red-600 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div className="text-sm text-red-800">
              <p className="font-semibold mb-1">
                Erro ao carregar preferências
              </p>
              <p>
                Não foi possível carregar suas preferências de notificação.
                Tente novamente mais tarde.
              </p>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="p-3 rounded-lg bg-purple-100 text-purple-600 shrink-0">
            <Check size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              Preferências de Notificação
            </h2>
            <p className="text-sm text-gray-600">
              Escolha quais eventos você quer acompanhar
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {notificationTypes.map((type) => {
            const Icon = type.icon
            const isEnabled = preferences?.[type.key] ?? true
            const isDisabled = isUpdating || !hasCredentials

            return (
              <div
                key={type.key}
                className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 gap-4 flex-wrap transition-opacity ${
                  isDisabled ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Icon className="text-gray-600 flex-shrink-0" size={20} />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 break-words">
                      {type.title}
                    </p>
                    <p className="text-sm text-gray-600 break-words">
                      {type.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => togglePreference(type.key)}
                  disabled={isDisabled}
                  className="shrink-0"
                />
              </div>
            )
          })}
        </div>
      </Card>

      <Card>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-blue-800 min-w-0 flex-1">
              <p className="font-semibold mb-1 break-words">
                Sobre as Notificações
              </p>
              <ul className="list-disc list-inside space-y-1 break-words">
                <li>
                  As notificações são exibidas dentro do gateway quando eventos
                  importantes acontecem.
                </li>
                <li>
                  Você pode personalizar quais tipos de eventos deseja
                  acompanhar.
                </li>
                <li>
                  Notificações de segurança são altamente recomendadas para
                  proteção da conta.
                </li>
                <li>
                  Todas as notificações ficam disponíveis na seção de
                  notificações do dashboard.
                </li>
                <li>Você pode alterar suas preferências a qualquer momento.</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
})

ConfiguracoesNotificacoesTab.displayName = 'ConfiguracoesNotificacoesTab'
