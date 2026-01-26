import React, { useEffect, useMemo, useState, useCallback, memo } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { adminUsersAPI, type AdminUser, type UpdateUserData } from '@/lib/api'
import {
  formatNumber,
  formatCurrencyInput,
  parseCurrencyInput,
} from '@/lib/format'

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
    // Estados locais para permitir edição livre nos inputs numéricos
    const [localValues, setLocalValues] = useState<Record<string, string>>({})

    const exampleCalc = useMemo(() => {
      const taxaFixa = Number(form.taxa_fixa_pix || 0)
      const valorExemplo = 100
      const taxaAplicada = taxaFixa
      return {
        taxaFixa: taxaFixa.toFixed(2),
        valorExemplo: valorExemplo.toFixed(2),
        taxaAplicada: taxaAplicada.toFixed(2),
      }
    }, [form.taxa_fixa_pix])

    useEffect(() => {
      if (!user) {
        return
      }
      // O backend já retorna as taxas padrão quando o usuário não tem taxas personalizadas
      const newForm = {
        // Taxa fixa de depósito
        taxa_fixa_deposito: user.taxa_fixa_deposito ?? 0,
        // Taxa fixa de saque
        taxa_fixa_pix: user.taxa_fixa_pix ?? 0,
        // Limites
        limite_mensal_pf: user.limite_mensal_pf ?? 0,
        // Manter flag de taxas personalizadas
        taxas_personalizadas_ativas: user.taxas_personalizadas_ativas ?? false,
        // Observações
        observacoes_taxas: user.observacoes_taxas ?? '',
      }
      setForm(newForm)

      // Inicializar valores locais formatados
      const taxaFixaDepositoCents = Math.round(
        (newForm.taxa_fixa_deposito as number) * 100,
      )
      const taxaFixaPixCents = Math.round(
        (newForm.taxa_fixa_pix as number) * 100,
      )

      setLocalValues({
        taxa_fixa_deposito: formatCurrencyInput(
          taxaFixaDepositoCents.toString(),
        ),
        taxa_fixa_pix: formatCurrencyInput(taxaFixaPixCents.toString()),
        limite_mensal_pf: formatNumber(newForm.limite_mensal_pf as number, 0),
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
        const cleaned = value.replace(/\D/g, '')

        const limitedCleaned = cleaned.slice(0, 8)

        const formatted = formatCurrencyInput(limitedCleaned)

        setLocalValues((prev) => ({ ...prev, [key]: formatted }))

        const numValue = parseCurrencyInput(limitedCleaned) / 100

        handleChange(key, numValue)
      },
      [handleChange],
    )

    const handleCurrencyBlur = useCallback(
      (key: keyof UpdateUserData) => {
        const currentFormValue = form[key] as number | undefined

        if (currentFormValue === undefined || currentFormValue === 0) {
          setLocalValues((prev) => ({ ...prev, [key]: '0,00' }))
          handleChange(key, 0)
        } else {
          const cents = Math.round(currentFormValue * 100)
          const formatted = formatCurrencyInput(cents.toString())
          setLocalValues((prev) => ({ ...prev, [key]: formatted }))
        }
      },
      [form, handleChange],
    )

    const handleSave = useCallback(async () => {
      if (!user?.id) {
        return
      }
      try {
        // Preparar dados para envio: garantir que observacoes_taxas seja enviado corretamente
        const dataToSend: UpdateUserData = {
          ...form,
          // Converter string vazia para null em observacoes_taxas (campo nullable)
          observacoes_taxas:
            form.observacoes_taxas && form.observacoes_taxas.trim() !== ''
              ? form.observacoes_taxas.trim()
              : null,
        }
        await onSubmit(user.id, dataToSend)
      } catch (error) {
        console.error('Erro ao salvar taxas:', error)
      }
    }, [user, form, onSubmit])


    return (
      <Dialog
        open={open}
        onClose={onClose}
        title={`Configuração de Taxas${user?.name ? ` - ${user.name}` : ''}`}
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              {isSaving ? 'Salvando...' : 'Salvar taxas'}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Usuário:</p>
                <p className="font-medium">{user?.name || user?.username}</p>
              </div>
              <div>
                <p className="text-gray-500">CPF/CNPJ:</p>
                <p className="font-medium">{user?.cpf_cnpj || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Configurações de Taxas</p>
                <p className="font-medium">&nbsp;</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Taxa de Depósito (em centavos)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 items-start">
                <Input
                  label="TAXA FIXA DEPÓSITO (R$)"
                  type="text"
                  inputMode="decimal"
                  value={
                    localValues.taxa_fixa_deposito ??
                    (() => {
                      const cents = Math.round(
                        ((form.taxa_fixa_deposito as number) || 0) * 100,
                      )
                      return formatCurrencyInput(cents.toString())
                    })()
                  }
                  onChange={(e) =>
                    handleCurrencyChange('taxa_fixa_deposito', e.target.value)
                  }
                  onBlur={() => handleCurrencyBlur('taxa_fixa_deposito')}
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Taxa de Saque (em centavos)
              </p>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 mb-3 text-sm text-blue-900">
                <p className="font-semibold mb-1">
                  Como funciona o cálculo de taxa de saque PIX:
                </p>
                <p>Taxa fixa PIX: R$ {exampleCalc.taxaFixa}</p>
                <p>
                  Exemplo: R$ {exampleCalc.valorExemplo} → Taxa = R${' '}
                  {exampleCalc.taxaAplicada}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 items-start">
                <Input
                  label="TAXA FIXA PIX (R$)"
                  type="text"
                  inputMode="decimal"
                  value={
                    localValues.taxa_fixa_pix ??
                    (() => {
                      const cents = Math.round(
                        ((form.taxa_fixa_pix as number) || 0) * 100,
                      )
                      return formatCurrencyInput(cents.toString())
                    })()
                  }
                  onChange={(e) =>
                    handleCurrencyChange('taxa_fixa_pix', e.target.value)
                  }
                  onBlur={() => handleCurrencyBlur('taxa_fixa_pix')}
                />
                <Input
                  label="LIMITE MENSAL PESSOA FÍSICA (R$)"
                  value={formatNumber(form.limite_mensal_pf as number, 0)}
                  onChange={(e) =>
                    handleChange('limite_mensal_pf', Number(e.target.value))
                  }
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Observações
              </p>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none"
                rows={3}
                placeholder="Observações sobre as taxas configuradas..."
                value={form.observacoes_taxas || ''}
                onChange={(e) =>
                  handleChange('observacoes_taxas', e.target.value)
                }
              />
            </div>
          </div>
        )}
      </Dialog>
    )
  },
)
