import React, { useEffect, useMemo, useState, useCallback, memo } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { AdminUser, UpdateUserData } from '@/lib/api'
import { useManagers, usePixAcquirers } from '@/hooks/useAdminUsers'
import { formatCpfCnpjBR, formatPhoneBR } from '@/lib/format'
import { USER_PERMISSION_OPTIONS } from '@/lib/constants'

interface UserEditModalProps {
  open: boolean
  onClose: () => void
  user?: AdminUser | null
  onSubmit: (userId: number, data: UpdateUserData) => Promise<void> | void
}

const DEFAULT_PIX_OPTION = {
  label: 'Usar adquirente PIX padrão do sistema',
  value: 'default',
}

export const UserEditModal = memo(function UserEditModal({
  open,
  onClose,
  user,
  onSubmit,
}: UserEditModalProps) {
  const [form, setForm] = useState<UpdateUserData>({})
  const isReady = !!user

  const { data: managers } = useManagers(open)
  const { data: pixAcquirers } = usePixAcquirers(open)

  useEffect(() => {
    if (!user) return
    setForm({
      name: user.name || '',
      email: user.email || '',
      telefone: user.telefone || '',
      cpf_cnpj: user.cpf_cnpj || user.cpf || '',
      data_nascimento: user.data_nascimento || '',
      permission: user.permission || 1,
      preferred_adquirente: user.preferred_adquirente,
      adquirente_override: user.adquirente_override,
      gerente_id: user.gerente_id || undefined,
    })
  }, [user])

  const handleChange = useCallback((key: keyof UpdateUserData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  // Handler para CPF/CNPJ usando utilitário centralizado
  const handleCpfCnpjChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCpfCnpjBR(e.target.value)
      handleChange('cpf_cnpj', formatted)
    },
    [handleChange],
  )

  // Handler para telefone usando utilitário centralizado
  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneBR(e.target.value)
      handleChange('telefone', formatted)
    },
    [handleChange],
  )

  // Opções de permissão usando constants
  const permissionOptions = useMemo(
    () =>
      USER_PERMISSION_OPTIONS.map((o) => ({
        label: o.label,
        value: String(o.value),
      })),
    [],
  )

  // Opções de gerentes memorizadas
  const managerOptions = useMemo(
    () => [
      { label: 'Nenhum', value: '' },
      ...(managers || []).map((m) => ({
        label: m.name || m.username,
        value: String(m.id),
      })),
    ],
    [managers],
  )

  // Opções de adquirentes PIX memorizadas
  const pixAcquirerOptions = useMemo(
    () => [
      DEFAULT_PIX_OPTION,
      ...(pixAcquirers || []).map((a) => ({
        label: a.name,
        value: a.referencia,
      })),
    ],
    [pixAcquirers],
  )

  const handleSave = useCallback(async () => {
    if (!user?.id) return
    await onSubmit(user.id, form)
  }, [user, form, onSubmit])

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
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      }
    >
      {!isReady ? (
        <p className="text-sm text-gray-600">Carregando...</p>
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
              label="Data nascimento:"
              type="date"
              value={form.data_nascimento || ''}
              onChange={(e) => handleChange('data_nascimento', e.target.value)}
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
            <Select
              label="Gerente:"
              value={String(form.gerente_id || '')}
              onChange={(val) => {
                handleChange('gerente_id', val ? Number(val) : undefined)
              }}
              options={managerOptions}
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">
              Adquirente PIX Específica:
            </p>
            <Select
              value={String(form.preferred_adquirente || 'default')}
              onChange={(val) => {
                handleChange(
                  'preferred_adquirente',
                  val === 'default' ? undefined : val,
                )
              }}
              options={pixAcquirerOptions}
            />
            <p className="text-xs text-gray-500">
              Adquirente usada para pagamentos via PIX
            </p>
          </div>
        </div>
      )}
    </Dialog>
  )
})
