'use client'

import React, { useState, useEffect, useCallback, memo } from 'react'
import { Building2, KeyRound, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import type { Acquirer, CreateAcquirerData, UpdateAcquirerData } from '@/lib/api'

interface AcquirerFormModalProps {
  open: boolean
  onClose: () => void
  acquirer?: Acquirer | null
  onSubmit: (data: CreateAcquirerData | UpdateAcquirerData) => Promise<void>
  isSaving?: boolean
}

const DEFAULT_PROVIDER = 'fluxpayments'

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

    const [errors, setErrors] = useState<Record<string, string>>({})

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
      setErrors({})
    }, [acquirer, open])

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
            provider: DEFAULT_PROVIDER,
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
      [formData, isEdit, validateForm, onSubmit, onClose],
    )

    return (
      <Dialog
        open={open}
        onClose={onClose}
        title={isEdit ? 'Editar Nominal' : 'Nova Nominal — FluxPayments'}
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
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            Cada nominal é uma conta FluxPayments própria (credenciais
            próprias), exibida com o nome que aparece no QR Code PIX gerado
            (campo Merchant Name).
          </p>

          <Input
            label="Nome da nominal *"
            value={formData.adquirente}
            onChange={(e) =>
              setFormData({ ...formData, adquirente: e.target.value })
            }
            error={errors.adquirente}
            icon={<Building2 size={18} />}
            placeholder="Ex: FluxPayments (Vendas Digitais)"
            disabled={isSaving}
          />

          <Input
            label="URL da API (opcional)"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            icon={<LinkIcon size={18} />}
            placeholder="https://api.fluxpaymentss.com"
            disabled={isSaving}
            autoComplete="off"
          />

          <div className="border-t border-gray-100 pt-4 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Credenciais {isEdit && '(deixe em branco para manter as atuais)'}
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
                placeholder={isEdit ? '••••••••' : 'live_...'}
                disabled={isSaving}
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
                placeholder={isEdit ? '••••••••' : 'pub_...'}
                disabled={isSaving}
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
                placeholder={isEdit ? '••••••••' : ''}
                disabled={isSaving}
                showPasswordToggle
                autoComplete="new-password"
              />

              <Input
                label="Webhook URL (opcional)"
                value={formData.webhookUrl}
                onChange={(e) =>
                  setFormData({ ...formData, webhookUrl: e.target.value })
                }
                placeholder="https://sua-app.com/fluxpayments/webhook"
                disabled={isSaving}
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
