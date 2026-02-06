import React, { useEffect, useState, useCallback, memo } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { type AdminUser, type UpdateUserData } from '@/lib/api'
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/format'

const TAXA_PADRAO_REAIS = 1

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

      setForm({
        taxa_fixa_deposito: taxaDeposito,
        taxa_fixa_pix: taxaSaque,
        taxas_personalizadas_ativas: user.taxas_personalizadas_ativas ?? false,
      })

      const centsDeposito = Math.round(taxaDeposito * 100)
      const centsSaque = Math.round(taxaSaque * 100)
      setLocalValues({
        taxa_fixa_deposito: formatCurrencyInput(centsDeposito.toString()),
        taxa_fixa_pix: formatCurrencyInput(centsSaque.toString()),
      })
    }, [user])

    const handleChange = useCallback(
      (key: keyof UpdateUserData, value: unknown) => {
        setForm((p) => ({ ...p, [key]: value }))
      },
      [],
    )

    const handleCurrencyChange = useCallback(
      (key: keyof UpdateUserData, value: string) => {
        const cleaned = value.replace(/\D/g, '').slice(0, 8)
        const formatted = formatCurrencyInput(cleaned)
        setLocalValues((prev) => ({ ...prev, [key]: formatted }))
        const numValue = parseCurrencyInput(cleaned) / 100
        handleChange(key, numValue)
      },
      [handleChange],
    )

    const handleCurrencyBlur = useCallback(
      (key: keyof UpdateUserData) => {
        const current = form[key] as number | undefined
        if (current === undefined || current < 0) {
          setLocalValues((prev) => ({ ...prev, [key]: '1,00' }))
          handleChange(key, TAXA_PADRAO_REAIS)
        } else {
          const cents = Math.round(current * 100)
          setLocalValues((prev) => ({
            ...prev,
            [key]: formatCurrencyInput(cents.toString()),
          }))
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
      const dataToSend: UpdateUserData = {
        taxa_fixa_deposito: ehPadrao ? null : taxaDeposito,
        taxa_fixa_pix: ehPadrao ? null : taxaPix,
        taxas_personalizadas_ativas: !ehPadrao,
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
                  formatCurrencyInput(
                    String(
                      Math.round(
                        ((form.taxa_fixa_deposito as number) ??
                          TAXA_PADRAO_REAIS) * 100,
                      ),
                    ),
                  )
                }
                onChange={(e) =>
                  handleCurrencyChange('taxa_fixa_deposito', e.target.value)
                }
                onBlur={() => handleCurrencyBlur('taxa_fixa_deposito')}
              />
              <Input
                label="Taxa de saque (R$)"
                type="text"
                inputMode="decimal"
                value={
                  localValues.taxa_fixa_pix ??
                  formatCurrencyInput(
                    String(
                      Math.round(
                        ((form.taxa_fixa_pix as number) ?? TAXA_PADRAO_REAIS) *
                          100,
                      ),
                    ),
                  )
                }
                onChange={(e) =>
                  handleCurrencyChange('taxa_fixa_pix', e.target.value)
                }
                onBlur={() => handleCurrencyBlur('taxa_fixa_pix')}
              />
            </div>
          </div>
        )}
      </Dialog>
    )
  },
)
