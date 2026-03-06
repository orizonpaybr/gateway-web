import React, { useEffect, useMemo, useState, useCallback, memo } from 'react'
import { Button } from '@/components/ui/Button'
import { CurrencyInput } from '@/components/ui/CurrencyInput'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Select } from '@/components/ui/Select'
import { useAdjustBalance } from '@/hooks/useAdminUsers'
import type { AdminUser, UpdateUserData } from '@/lib/api'
import { USER_PERMISSION_OPTIONS } from '@/lib/constants'
import {
  formatCpfCnpjBR,
  formatPhoneBR,
  parseCurrencyInput,
} from '@/lib/format'
interface UserEditModalProps {
  open: boolean
  onClose: () => void
  user?: AdminUser | null
  onSubmit: (userId: number, data: UpdateUserData) => Promise<void> | void
}

export const UserEditModal = memo(
  ({ open, onClose, user, onSubmit }: UserEditModalProps) => {
    const [form, setForm] = useState<UpdateUserData>({})
    const [saldoInput, setSaldoInput] = useState('')
    const [adjustReason, setAdjustReason] = useState('')
    const isReady = !!user
    const adjustBalanceMutation = useAdjustBalance()

    useEffect(() => {
      if (!user) {
        return
      }
      setForm({
        name: user.name || '',
        email: user.email || '',
        telefone: user.telefone || '',
        cpf_cnpj: user.cpf_cnpj || user.cpf || '',
        permission: user.permission || 1,
      })
      const saldo = Number(user.saldo) || 0
      setSaldoInput(String(Math.round(saldo * 100)))
    }, [user])

    useEffect(() => {
      if (!open) {
        setAdjustReason('')
      }
    }, [open])

    const handleChange = useCallback(
      (key: keyof UpdateUserData, value: unknown) => {
        setForm((prev) => ({ ...prev, [key]: value }))
      },
      [],
    )

    const handleCpfCnpjChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCpfCnpjBR(e.target.value)
        handleChange('cpf_cnpj', formatted)
      },
      [handleChange],
    )

    const handlePhoneChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneBR(e.target.value)
        handleChange('telefone', formatted)
      },
      [handleChange],
    )

    const permissionOptions = useMemo(
      () =>
        USER_PERMISSION_OPTIONS.map((o) => ({
          label: o.label,
          value: String(o.value),
        })),
      [],
    )

    const saldoAtual = useMemo(
      () => (user ? Number(user.saldo) || 0 : 0),
      [user],
    )

    const handleSave = useCallback(async () => {
      if (!user?.id) {
        return
      }

      const newSaldo = parseCurrencyInput(saldoInput) / 100
      if (newSaldo < 0) {
        return
      }

      if (newSaldo !== saldoAtual) {
        try {
          await adjustBalanceMutation.mutateAsync({
            userId: user.id,
            data: {
              amount: Math.abs(newSaldo - saldoAtual),
              type: newSaldo > saldoAtual ? 'add' : 'subtract',
              reason: adjustReason.trim() || undefined,
            },
          })
        } catch {
          return
        }
      }

      const dataToSend: UpdateUserData = {
        ...form,
        telefone:
          form.telefone && form.telefone.trim() !== '' ? form.telefone : null,
        cpf_cnpj:
          form.cpf_cnpj && form.cpf_cnpj.trim() !== '' ? form.cpf_cnpj : null,
      }
      await onSubmit(user.id, dataToSend)
    }, [
      user,
      form,
      onSubmit,
      saldoInput,
      saldoAtual,
      adjustReason,
      adjustBalanceMutation,
    ])

    return (
      <Dialog
        open={open}
        onClose={onClose}
        title="Editar Usuário"
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={adjustBalanceMutation.isPending}
            >
              {adjustBalanceMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        }
      >
        {!isReady ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome:"
                value={form.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
              />
              <Input
                label="CPF/CNPJ:"
                value={form.cpf_cnpj || ''}
                onChange={handleCpfCnpjChange}
              />
              <Input
                label="Telefone:"
                value={form.telefone || ''}
                onChange={handlePhoneChange}
              />
              <Input
                label="Email:"
                type="email"
                value={form.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
              />
              <Select
                label="Permissão:"
                value={String(form.permission || 1)}
                onChange={(val) => {
                  const numVal = Number(val)
                  if (!isNaN(numVal)) {
                    handleChange('permission', numVal)
                  }
                }}
                options={permissionOptions}
              />
            </div>

            <div className="border-t border-gray-200 pt-5 mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <div className="flex flex-col gap-2 w-full min-h-[4.5rem]">
                <label
                  htmlFor="saldo"
                  className="text-xs font-semibold text-gray-900 uppercase tracking-wider min-h-[1.25rem] flex items-center"
                >
                  Saldo
                </label>
                <CurrencyInput
                  hideLabel
                  value={saldoInput}
                  onChange={setSaldoInput}
                  placeholder="0,00"
                />
              </div>
              <div className="flex flex-col gap-2 w-full min-h-[4.5rem]">
                <label
                  htmlFor="adjustReason"
                  className="text-xs font-semibold text-gray-900 uppercase tracking-wider min-h-[1.25rem] flex items-center"
                >
                  Motivo (opcional)
                </label>
                <Input
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Ex.: Ajuste manual, estorno..."
                />
              </div>
            </div>
          </div>
        )}
      </Dialog>
    )
  },
)
