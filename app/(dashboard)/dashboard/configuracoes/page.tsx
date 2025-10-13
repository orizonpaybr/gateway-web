'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Lock, Key, Bell, Smartphone, Copy, Eye, EyeOff } from 'lucide-react'

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type PasswordFormData = z.infer<typeof passwordSchema>

export default function ConfiguracoesPage() {
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState({
    whatsapp: true,
    push: false,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmitPassword = async (data: PasswordFormData) => {
    console.log('Alterando senha...', data)
    alert('Senha alterada com sucesso!')
    reset()
  }

  const apiCredentials = {
    clientKey: 'hpk_live_1234567890abcdef',
    clientSecret: '••••••••••••••••••••••••••••••••',
    ipsAutorizados: ['192.168.1.1', '203.0.113.0'],
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copiado para a área de transferência!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 text-sm mt-1">
          Gerencie suas preferências e configurações de segurança
        </p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Lock size={24} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Trocar Senha</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
          <Input
            {...register('currentPassword')}
            type="password"
            label="SENHA ATUAL"
            placeholder="Digite sua senha atual"
            error={errors.currentPassword?.message}
          />

          <Input
            {...register('newPassword')}
            type="password"
            label="NOVA SENHA"
            placeholder="Digite a nova senha"
            error={errors.newPassword?.message}
          />

          <Input
            {...register('confirmPassword')}
            type="password"
            label="CONFIRMAR NOVA SENHA"
            placeholder="Confirme a nova senha"
            error={errors.confirmPassword?.message}
          />

          <Button type="submit" icon={<Lock size={18} />}>
            Alterar Senha
          </Button>
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Key size={24} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Integração com API
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={showApiKeys ? <EyeOff size={16} /> : <Eye size={16} />}
            onClick={() => setShowApiKeys(!showApiKeys)}
          >
            {showApiKeys ? 'Ocultar' : 'Mostrar'}
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
              Client Key
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-50 px-4 py-3 rounded-lg font-mono text-sm text-gray-900">
                {showApiKeys
                  ? apiCredentials.clientKey
                  : '••••••••••••••••••••••••'}
              </div>
              <Button
                variant="outline"
                icon={<Copy size={18} />}
                onClick={() => copyToClipboard(apiCredentials.clientKey)}
              >
                Copiar
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
              Client Secret
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-50 px-4 py-3 rounded-lg font-mono text-sm text-gray-900">
                {apiCredentials.clientSecret}
              </div>
              <Button
                variant="outline"
                icon={<Copy size={18} />}
                onClick={() => copyToClipboard(apiCredentials.clientSecret)}
              >
                Copiar
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
              IPs Autorizados
            </label>
            <div className="space-y-2">
              {apiCredentials.ipsAutorizados.map((ip, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg"
                >
                  <span className="font-mono text-sm text-gray-900">{ip}</span>
                  <Button variant="ghost" size="sm">
                    Remover
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm">
                + Adicionar IP
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Importante:</strong> Mantenha suas credenciais em
              segurança. Não compartilhe com terceiros.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-green-100 text-green-600">
            <Bell size={24} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Notificações</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="text-gray-600" size={20} />
              <div>
                <p className="font-medium text-gray-900">
                  Notificações via WhatsApp
                </p>
                <p className="text-sm text-gray-600">
                  Receba atualizações no seu WhatsApp
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() =>
                setNotificationsEnabled({
                  ...notificationsEnabled,
                  whatsapp: !notificationsEnabled.whatsapp,
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors p-0 ${
                notificationsEnabled.whatsapp ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationsEnabled.whatsapp
                    ? 'translate-x-6'
                    : 'translate-x-1'
                }`}
              />
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="text-gray-600" size={20} />
              <div>
                <p className="font-medium text-gray-900">Notificações Push</p>
                <p className="text-sm text-gray-600">
                  Receba alertas no navegador
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() =>
                setNotificationsEnabled({
                  ...notificationsEnabled,
                  push: !notificationsEnabled.push,
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors p-0 ${
                notificationsEnabled.push ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationsEnabled.push ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
