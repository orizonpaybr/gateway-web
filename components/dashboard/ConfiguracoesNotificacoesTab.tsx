import { memo, useState, useCallback, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { PhoneInput } from '@/components/ui/PhoneInput'
import {
  Bell,
  Smartphone,
  MessageCircle,
  Mail,
  Check,
  AlertCircle,
} from 'lucide-react'

interface NotificationSettings {
  whatsapp: {
    enabled: boolean
    phone: string
  }
  push: {
    enabled: boolean
  }
  email: {
    enabled: boolean
    address: string
  }
}

interface NotificationPreferences {
  transactions: boolean
  deposits: boolean
  withdrawals: boolean
  security: boolean
  marketing: boolean
}

export const ConfiguracoesNotificacoesTab = memo(() => {
  const [settings, setSettings] = useState<NotificationSettings>({
    whatsapp: {
      enabled: true,
      phone: '(99) 9 9999-9999',
    },
    push: {
      enabled: false,
    },
    email: {
      enabled: true,
      address: 'usuario@exemplo.com',
    },
  })

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    transactions: true,
    deposits: true,
    withdrawals: true,
    security: true,
    marketing: false,
  })

  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [tempPhone, setTempPhone] = useState(settings.whatsapp.phone)

  const handleWhatsAppToggle = useCallback((enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      whatsapp: { ...prev.whatsapp, enabled },
    }))
    // TODO: Integrar com API
  }, [])

  const handlePushToggle = useCallback((enabled: boolean) => {
    if (enabled) {
      // Solicitar permissão do navegador
      if ('Notification' in window) {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            setSettings((prev) => ({
              ...prev,
              push: { enabled: true },
            }))
            // TODO: Integrar com API
            alert('Notificações push ativadas com sucesso!')
          } else {
            alert('Você precisa permitir notificações no seu navegador.')
          }
        })
      } else {
        alert('Seu navegador não suporta notificações push.')
      }
    } else {
      setSettings((prev) => ({
        ...prev,
        push: { enabled: false },
      }))
      // TODO: Integrar com API
    }
  }, [])

  const handleEmailToggle = useCallback((enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      email: { ...prev.email, enabled },
    }))
    // TODO: Integrar com API
  }, [])

  const handlePreferenceToggle = useCallback(
    (key: keyof NotificationPreferences) => {
      setPreferences((prev) => ({
        ...prev,
        [key]: !prev[key],
      }))
      // TODO: Integrar com API
    },
    [],
  )

  const handleSavePhone = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      whatsapp: { ...prev.whatsapp, phone: tempPhone },
    }))
    setIsEditingPhone(false)
    // TODO: Integrar com API
    alert('Telefone atualizado com sucesso!')
  }, [tempPhone])

  const notificationTypes = useMemo(
    () => [
      {
        key: 'transactions' as const,
        title: 'Transações',
        description: 'Receba notificações sobre todas as transações realizadas',
        icon: Bell,
      },
      {
        key: 'deposits' as const,
        title: 'Depósitos',
        description: 'Seja notificado quando receber depósitos',
        icon: Check,
      },
      {
        key: 'withdrawals' as const,
        title: 'Saques',
        description: 'Receba alertas sobre saques realizados',
        icon: AlertCircle,
      },
      {
        key: 'security' as const,
        title: 'Segurança',
        description:
          'Alertas de login, alterações de senha e atividades suspeitas',
        icon: Bell,
      },
      {
        key: 'marketing' as const,
        title: 'Marketing',
        description: 'Novidades, promoções e atualizações do sistema',
        icon: Mail,
      },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      {/* Canais de Notificação */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-green-100 text-green-600">
            <Bell size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Canais de Notificação
            </h2>
            <p className="text-sm text-gray-600">
              Escolha como deseja receber notificações
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* WhatsApp */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3 flex-1">
              <MessageCircle
                className="text-green-600 flex-shrink-0 mt-1"
                size={20}
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  Notificações via WhatsApp
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Receba atualizações no seu WhatsApp
                </p>
                {settings.whatsapp.enabled && (
                  <div className="mt-2">
                    {isEditingPhone ? (
                      <div className="flex gap-2 items-end">
                        <PhoneInput
                          value={tempPhone}
                          onChange={(value) => setTempPhone(value)}
                          className="flex-1"
                          placeholder="(99) 9 9999-9999"
                        />
                        <Button size="sm" onClick={handleSavePhone}>
                          Salvar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsEditingPhone(false)
                            setTempPhone(settings.whatsapp.phone)
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-700">
                          {settings.whatsapp.phone}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsEditingPhone(true)}
                        >
                          Alterar
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <Switch
              checked={settings.whatsapp.enabled}
              onCheckedChange={handleWhatsAppToggle}
            />
          </div>

          {/* Push */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <Bell className="text-blue-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-medium text-gray-900">Notificações Push</p>
                <p className="text-sm text-gray-600">
                  Receba alertas no navegador
                </p>
              </div>
            </div>
            <Switch
              checked={settings.push.enabled}
              onCheckedChange={handlePushToggle}
            />
          </div>

          {/* Email */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <Mail className="text-purple-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-medium text-gray-900">
                  Notificações por E-mail
                </p>
                <p className="text-sm text-gray-600">
                  Resumos e alertas importantes por e-mail
                </p>
                {settings.email.enabled && (
                  <p className="text-sm font-mono text-gray-700 mt-1">
                    {settings.email.address}
                  </p>
                )}
              </div>
            </div>
            <Switch
              checked={settings.email.enabled}
              onCheckedChange={handleEmailToggle}
            />
          </div>
        </div>
      </Card>

      {/* Preferências de Notificação */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
            <Smartphone size={24} />
          </div>
          <div>
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
            return (
              <div
                key={type.key}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <Icon className="text-gray-600 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">{type.title}</p>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                </div>
                <Switch
                  checked={preferences[type.key]}
                  onCheckedChange={() => handlePreferenceToggle(type.key)}
                />
              </div>
            )
          })}
        </div>
      </Card>

      {/* Informações */}
      <Card>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle
              className="text-blue-600 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Sobre as Notificações</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Você pode ativar múltiplos canais de notificação
                  simultaneamente.
                </li>
                <li>
                  Notificações de segurança são altamente recomendadas para
                  proteção da conta.
                </li>
                <li>
                  As notificações push requerem permissão do navegador para
                  funcionar.
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
