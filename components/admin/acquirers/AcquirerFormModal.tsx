'use client'

import React, { useState, useEffect, useCallback, memo } from 'react'
import { Building2, KeyRound, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { useAcquirerCredentials } from '@/hooks/useAcquirers'
import {
  ACQUIRER_PROVIDER_LABELS,
  MULTI_ACCOUNT_ACQUIRER_PROVIDERS,
  type Acquirer,
  type CreateAcquirerData,
  type UpdateAcquirerData,
} from '@/lib/api'

interface AcquirerFormModalProps {
  open: boolean
  onClose: () => void
  acquirer?: Acquirer | null
  onSubmit: (data: CreateAcquirerData | UpdateAcquirerData) => Promise<void>
  isSaving?: boolean
}

const DEFAULT_PROVIDER = 'fluxpayments'

/** URL padrão da API por provider, usada como placeholder do campo URL. */
const PROVIDER_BASE_URL: Record<string, string> = {
  fluxpayments: 'https://api.fluxpaymentss.com',
  paya55: 'https://api.paya55.com',
}

const PROVIDER_OPTIONS = MULTI_ACCOUNT_ACQUIRER_PROVIDERS.map((p) => ({
  value: p,
  label: ACQUIRER_PROVIDER_LABELS[p] ?? p,
}))

export const AcquirerFormModal = memo(
  ({ open, onClose, acquirer, onSubmit, isSaving }: AcquirerFormModalProps) => {
    const isEdit = !!acquirer

    const [formData, setFormData] = useState({
      adquirente: '',
      url: '',
      status: true,
      apiKey: '',
      publicKey: '',
      webhookSecret: '',
      webhookUrl: '',
    })

    const [provider, setProvider] = useState<string>(DEFAULT_PROVIDER)

    const [errors, setErrors] = useState<Record<string, string>>({})

    const { data: credentialsData, isFetching: isLoadingCredentials } =
      useAcquirerCredentials(acquirer?.id ?? null, open && isEdit)

    useEffect(() => {
      if (acquirer) {
        setFormData({
          adquirente: acquirer.adquirente || '',
          url: acquirer.url || '',
          status: acquirer.status === 1 || acquirer.status === true,
          apiKey: '',
          publicKey: '',
          webhookSecret: '',
          webhookUrl: '',
        })
      } else {
        setFormData({
          adquirente: '',
          url: '',
          status: true,
          apiKey: '',
          publicKey: '',
          webhookSecret: '',
          webhookUrl: '',
        })
      }
      setProvider(acquirer?.provider || DEFAULT_PROVIDER)
      setErrors({})
    }, [acquirer, open])

    // Pré-preenche os campos de credencial assim que o fetch (só disparado
    // ao abrir em modo edição) retorna — antes disso ficam em branco.
    useEffect(() => {
      if (!credentialsData) {
        return
      }
      const creds = credentialsData.credentials
      setFormData((prev) => ({
        ...prev,
        apiKey: creds?.api_key || '',
        publicKey: creds?.public_key || '',
        webhookSecret: creds?.webhook_secret || '',
        webhookUrl: creds?.webhook_url || '',
      }))
    }, [credentialsData])

    const validateForm = useCallback((): boolean => {
      const newErrors: Record<string, string> = {}

      if (!formData.adquirente.trim()) {
        newErrors.adquirente = 'Nome da nominal é obrigatório'
      }

      if (!isEdit) {
        if (!formData.apiKey.trim()) {
          newErrors.apiKey = 'API Key é obrigatória'
        }
        if (!formData.publicKey.trim()) {
          newErrors.publicKey = 'Public Key é obrigatória'
        }
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }, [formData, isEdit])

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
          return
        }

        const credentials: Record<string, string> = {}
        if (formData.apiKey.trim()) {
          credentials.api_key = formData.apiKey.trim()
        }
        if (formData.publicKey.trim()) {
          credentials.public_key = formData.publicKey.trim()
        }
        if (formData.webhookSecret.trim()) {
          credentials.webhook_secret = formData.webhookSecret.trim()
        }
        if (formData.webhookUrl.trim()) {
          credentials.webhook_url = formData.webhookUrl.trim()
        }

        if (isEdit) {
          const updateData: UpdateAcquirerData = {
            adquirente: formData.adquirente.trim(),
            url: formData.url.trim() || undefined,
            status: formData.status,
          }
          if (Object.keys(credentials).length > 0) {
            updateData.credentials = credentials
          }
          await onSubmit(updateData)
        } else {
          await onSubmit({
            adquirente: formData.adquirente.trim(),
            provider,
            url: formData.url.trim() || undefined,
            status: formData.status,
            credentials: {
              api_key: credentials.api_key,
              public_key: credentials.public_key,
              webhook_secret: credentials.webhook_secret,
              webhook_url: credentials.webhook_url,
            },
          } as CreateAcquirerData)
        }

        onClose()
      },
      [formData, provider, isEdit, validateForm, onSubmit, onClose],
    )

    return (
      <Dialog
        open={open}
        onClose={onClose}
        title={
          isEdit
            ? 'Editar Nominal'
            : `Nova Nominal — ${ACQUIRER_PROVIDER_LABELS[provider] ?? provider}`
        }
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button
              variant="inkSolid"
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || isLoadingCredentials}
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            Cada nominal é uma conta própria da adquirente (credenciais
            próprias), exibida com o nome que aparece no QR Code PIX gerado
            (campo Merchant Name).
          </p>

          {!isEdit && (
            <Select
              id="acquirer-provider"
              label="Adquirente *"
              value={provider}
              onChange={setProvider}
              disabled={isSaving}
              options={PROVIDER_OPTIONS}
            />
          )}

          <Input
            label="Nome da nominal *"
            value={formData.adquirente}
            onChange={(e) =>
              setFormData({ ...formData, adquirente: e.target.value })
            }
            error={errors.adquirente}
            icon={<Building2 size={18} />}
            placeholder={`Ex: ${ACQUIRER_PROVIDER_LABELS[provider] ?? provider} (Vendas Digitais)`}
            disabled={isSaving}
          />

          <Input
            label="URL da API (opcional)"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            icon={<LinkIcon size={18} />}
            placeholder={PROVIDER_BASE_URL[provider] ?? ''}
            disabled={isSaving}
            autoComplete="off"
          />

          <div className="border-t border-gray-100 pt-4 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Credenciais{' '}
              {isEdit &&
                (isLoadingCredentials
                  ? '(carregando...)'
                  : '(clique no 👁 pra revelar, edite só o que precisar trocar)')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={isEdit ? 'API Key' : 'API Key *'}
                value={formData.apiKey}
                onChange={(e) =>
                  setFormData({ ...formData, apiKey: e.target.value })
                }
                error={errors.apiKey}
                icon={<KeyRound size={18} />}
                placeholder={
                  isEdit && isLoadingCredentials ? 'carregando...' : 'live_...'
                }
                disabled={isSaving || isLoadingCredentials}
                showPasswordToggle
                autoComplete="new-password"
              />

              <Input
                label={isEdit ? 'Public Key' : 'Public Key *'}
                value={formData.publicKey}
                onChange={(e) =>
                  setFormData({ ...formData, publicKey: e.target.value })
                }
                error={errors.publicKey}
                icon={<KeyRound size={18} />}
                placeholder={
                  isEdit && isLoadingCredentials ? 'carregando...' : 'pub_...'
                }
                disabled={isSaving || isLoadingCredentials}
                showPasswordToggle
                autoComplete="new-password"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Webhook Secret (opcional)"
                value={formData.webhookSecret}
                onChange={(e) =>
                  setFormData({ ...formData, webhookSecret: e.target.value })
                }
                placeholder={
                  isEdit && isLoadingCredentials ? 'carregando...' : ''
                }
                disabled={isSaving || isLoadingCredentials}
                showPasswordToggle
                autoComplete="new-password"
              />

              <Input
                label="Webhook URL (opcional)"
                value={formData.webhookUrl}
                onChange={(e) =>
                  setFormData({ ...formData, webhookUrl: e.target.value })
                }
                placeholder={`https://sua-app.com/${provider}/webhook`}
                disabled={isSaving || isLoadingCredentials}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-sm font-medium text-gray-700">
              Nominal habilitada
            </span>
            <Switch
              checked={formData.status}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, status: checked })
              }
              disabled={isSaving}
            />
          </div>
        </form>
      </Dialog>
    )
  },
)

AcquirerFormModal.displayName = 'AcquirerFormModal'
