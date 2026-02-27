import React, { useEffect, useState, useCallback, memo } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Switch } from '@/components/ui/Switch'
import { type AdminUser, type UpdateUserData } from '@/lib/api'
import { formatDecimalReais, parseDecimalReais } from '@/lib/format'

const TAXA_PADRAO_REAIS = 1
const COMISSAO_PADRAO_REAIS = 0.5

interface UserFeesModalProps {
  open: boolean
  onClose: () => void
  user?: AdminUser | null
  onSubmit: (userId: number, data: UpdateUserData) => Promise<void> | void
  isSaving?: boolean
}

export const UserFeesModal = memo(
  ({ open, onClose, user, onSubmit, isSaving = false }: UserFeesModalProps) => {
    const [form, setForm] = useState<UpdateUserData>({})
    const [localValues, setLocalValues] = useState<Record<string, string>>({})

    useEffect(() => {
      if (!user) {
        return
      }
      const taxaDeposito = user.taxa_fixa_deposito ?? TAXA_PADRAO_REAIS
      const taxaSaque = user.taxa_fixa_pix ?? TAXA_PADRAO_REAIS
      const comissaoAfiliado =
        user.taxa_comissao_afiliado ?? COMISSAO_PADRAO_REAIS

      setForm({
        taxa_fixa_deposito: taxaDeposito,
        taxa_fixa_pix: taxaSaque,
        taxas_personalizadas_ativas: user.taxas_personalizadas_ativas ?? false,
        taxa_comissao_afiliado: comissaoAfiliado,
        comissao_afiliado_personalizada:
          user.comissao_afiliado_personalizada ?? false,
      })

      setLocalValues({
        taxa_fixa_deposito: formatDecimalReais(taxaDeposito, 3),
        taxa_fixa_pix: formatDecimalReais(taxaSaque, 3),
        taxa_comissao_afiliado: formatDecimalReais(comissaoAfiliado, 3),
      })
    }, [user])

    const handleChange = useCallback(
      (key: keyof UpdateUserData, value: unknown) => {
        setForm((p) => ({ ...p, [key]: value }))
      },
      [],
    )

    const handleDecimalTaxChange = useCallback(
      (key: keyof UpdateUserData, value: string) => {
        setLocalValues((prev) => ({ ...prev, [key]: value }))
        const numValue = parseDecimalReais(value)
        const rounded = Math.round(numValue * 1000) / 1000
        handleChange(key, rounded)
      },
      [handleChange],
    )

    const handleDecimalTaxBlur = useCallback(
      (key: keyof UpdateUserData) => {
        const current = form[key] as number | undefined
        const defaultValue =
          key === 'taxa_comissao_afiliado'
            ? COMISSAO_PADRAO_REAIS
            : TAXA_PADRAO_REAIS
        if (current === undefined || current < 0) {
          setLocalValues((prev) => ({
            ...prev,
            [key]: formatDecimalReais(defaultValue, 3),
          }))
          handleChange(key, defaultValue)
        } else {
          const rounded = Math.round(current * 1000) / 1000
          setLocalValues((prev) => ({
            ...prev,
            [key]: formatDecimalReais(rounded, 3),
          }))
          handleChange(key, rounded)
        }
      },
      [form, handleChange],
    )

    const handleSave = useCallback(async () => {
      if (!user?.id) {
        return
      }
      const taxaDeposito =
        (form.taxa_fixa_deposito as number) ?? TAXA_PADRAO_REAIS
      const taxaPix = (form.taxa_fixa_pix as number) ?? TAXA_PADRAO_REAIS
      const ehPadrao =
        taxaDeposito === TAXA_PADRAO_REAIS && taxaPix === TAXA_PADRAO_REAIS

      const comissaoAfiliado =
        (form.taxa_comissao_afiliado as number) ?? COMISSAO_PADRAO_REAIS
      const comissaoPersonalizada =
        (form.comissao_afiliado_personalizada as boolean) ?? false

      const dataToSend: UpdateUserData = {
        taxa_fixa_deposito: ehPadrao ? null : taxaDeposito,
        taxa_fixa_pix: ehPadrao ? null : taxaPix,
        taxas_personalizadas_ativas: !ehPadrao,
        taxa_comissao_afiliado: comissaoPersonalizada ? comissaoAfiliado : null,
        comissao_afiliado_personalizada: comissaoPersonalizada,
      }
      await onSubmit(user.id, dataToSend)
    }, [user, form, onSubmit])

    return (
      <Dialog
        open={open}
        onClose={onClose}
        title={`Configuração de Taxas${user?.name ? ` - ${user.name}` : ''}`}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar taxas'}
            </Button>
          </div>
        }
      >
        {!user ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Nome:</p>
                <p className="font-medium">
                  {user.name || user.username || '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">CPF/CNPJ:</p>
                <p className="font-medium">
                  {user.cpf_cnpj || user.cpf || '-'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Taxa de depósito (R$)"
                type="text"
                inputMode="decimal"
                value={
                  localValues.taxa_fixa_deposito ??
                  formatDecimalReais(
                    (form.taxa_fixa_deposito as number) ?? TAXA_PADRAO_REAIS,
                    3,
                  )
                }
                onChange={(e) =>
                  handleDecimalTaxChange('taxa_fixa_deposito', e.target.value)
                }
                onBlur={() => handleDecimalTaxBlur('taxa_fixa_deposito')}
              />
              <Input
                label="Taxa de saque (R$)"
                type="text"
                inputMode="decimal"
                value={
                  localValues.taxa_fixa_pix ??
                  formatDecimalReais(
                    (form.taxa_fixa_pix as number) ?? TAXA_PADRAO_REAIS,
                    3,
                  )
                }
                onChange={(e) =>
                  handleDecimalTaxChange('taxa_fixa_pix', e.target.value)
                }
                onBlur={() => handleDecimalTaxBlur('taxa_fixa_pix')}
              />
            </div>

            {user.is_affiliate && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Comissão de Afiliado
                </p>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-sm text-gray-600">
                    Usar comissão personalizada para este afiliado
                  </span>
                  <Switch
                    checked={
                      (form.comissao_afiliado_personalizada as boolean) ?? false
                    }
                    onCheckedChange={(checked) =>
                      handleChange('comissao_afiliado_personalizada', checked)
                    }
                  />
                </div>
                {(form.comissao_afiliado_personalizada as boolean) && (
                  <div className="grid grid-cols-1 gap-4 mt-1">
                    <Input
                      label="Comissão por transação (R$)"
                      type="text"
                      inputMode="decimal"
                      value={
                        localValues.taxa_comissao_afiliado ??
                        formatDecimalReais(
                          (form.taxa_comissao_afiliado as number) ??
                            COMISSAO_PADRAO_REAIS,
                          3,
                        )
                      }
                      onChange={(e) =>
                        handleDecimalTaxChange(
                          'taxa_comissao_afiliado',
                          e.target.value,
                        )
                      }
                      onBlur={() =>
                        handleDecimalTaxBlur('taxa_comissao_afiliado')
                      }
                    />
                  </div>
                )}
                {!(form.comissao_afiliado_personalizada as boolean) && (
                  <p className="text-xs text-gray-400">
                    Usando a comissão global padrão do sistema.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Dialog>
    )
  },
)
