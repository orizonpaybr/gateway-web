import React, { useEffect, useState, useCallback, memo } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Users } from 'lucide-react'
import {
  useSaveAffiliateSettings,
  type AffiliateSettings,
} from '@/hooks/useAdminUsers'
import { AdminUser } from '@/lib/api'
import { formatNumber } from '@/lib/format'

interface UserAffiliateModalProps {
  open: boolean
  onClose: () => void
  user?: AdminUser | null
}

export const UserAffiliateModal = memo(function UserAffiliateModal({
  open,
  onClose,
  user,
}: UserAffiliateModalProps) {
  const [form, setForm] = useState<AffiliateSettings>({
    is_affiliate: false,
    affiliate_percentage: 0,
  })
  const saveAffiliate = useSaveAffiliateSettings()

  useEffect(() => {
    if (!user) return
    setForm({
      is_affiliate: !!user.is_affiliate,
      affiliate_percentage: user.affiliate_percentage ?? 0,
    })
  }, [user])

  const handleSave = useCallback(async () => {
    if (!user?.id) return

    try {
      await saveAffiliate.mutateAsync({
        userId: user.id,
        data: form,
      })
      onClose()
    } catch (error) {
      // Error já é tratado pelo hook
    }
  }, [user, form, saveAffiliate, onClose])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Configurações de Afiliados${user?.name ? ` - ${user.name}` : ''}`}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={handleSave} disabled={saveAffiliate.isPending}>
            {saveAffiliate.isPending ? 'Salvando...' : 'Salvar configurações'}
          </Button>
        </div>
      }
    >
      {!user ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="text-orange-600" size={24} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Configurações do Sistema de Afiliados
              </h3>
              <p className="text-xs text-gray-500">
                Configure o sistema de comissões para este usuário
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_affiliate}
                onCheckedChange={(checked) =>
                  setForm((p) => ({ ...p, is_affiliate: checked }))
                }
              />
              <label className="text-sm font-medium text-gray-900 cursor-pointer">
                É Affiliate
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-11">
              Ativa o sistema de comissões para este usuário
            </p>
          </div>

          {form.is_affiliate && (
            <div className="space-y-2">
              <Input
                label="Porcentagem de Comissão (%)"
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={formatNumber(form.affiliate_percentage, 2)}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  if (value >= 0 && value <= 10) {
                    setForm((p) => ({ ...p, affiliate_percentage: value }))
                  }
                }}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500">
                A porcentagem deve estar entre 0 e 10%
              </p>
            </div>
          )}

          {form.is_affiliate && user.affiliate_code && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  Código de Afiliado:
                </p>
                <p className="text-sm font-mono text-gray-900 bg-white px-3 py-2 rounded border border-gray-300">
                  {user.affiliate_code}
                </p>
              </div>
              {user.affiliate_link && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">
                    Link de Indicação:
                  </p>
                  <p className="text-xs text-gray-600 break-all bg-white px-3 py-2 rounded border border-gray-300">
                    {user.affiliate_link}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Dialog>
  )
})
