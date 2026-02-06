import React, { useEffect, useMemo, useState, useCallback, memo } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Select } from '@/components/ui/Select'
import type { AdminUser, UpdateUserData } from '@/lib/api'
import { USER_PERMISSION_OPTIONS } from '@/lib/constants'
import { formatCpfCnpjBR, formatPhoneBR } from '@/lib/format'
interface UserEditModalProps {
  open: boolean
  onClose: () => void
  user?: AdminUser | null
  onSubmit: (userId: number, data: UpdateUserData) => Promise<void> | void
}

export const UserEditModal = memo(
  ({ open, onClose, user, onSubmit }: UserEditModalProps) => {
    const [form, setForm] = useState<UpdateUserData>({})
    const isReady = !!user

    // Função auxiliar para formatar data para input type="date" (YYYY-MM-DD)
    const formatDateForInput = useCallback(
      (dateStr?: string | null): string => {
        if (!dateStr) {
          return ''
        }

        // Se já está no formato YYYY-MM-DD, retorna direto
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          return dateStr
        }

        // Tenta converter de outros formatos
        try {
          const date = new Date(dateStr)
          if (isNaN(date.getTime())) {
            return ''
          }

          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        } catch {
          return ''
        }
      },
      [],
    )

    useEffect(() => {
      if (!user) {
        return
      }
      setForm({
        name: user.name || '',
        email: user.email || '',
        telefone: user.telefone || '',
        cpf_cnpj: user.cpf_cnpj || user.cpf || '',
        data_nascimento: formatDateForInput(user.data_nascimento),
        permission: user.permission || 1,
      })
    }, [user, formatDateForInput])

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

    const handleSave = useCallback(async () => {
      if (!user?.id) {
        return
      }

      // Preparar dados para envio: converter strings vazias em null para campos opcionais
      // Usar null explicitamente para que o backend atualize os campos (undefined seria omitido no JSON)
      const dataToSend: UpdateUserData = {
        ...form,
        // Converter strings vazias para null para campos nullable
        telefone:
          form.telefone && form.telefone.trim() !== '' ? form.telefone : null,
        data_nascimento:
          form.data_nascimento && form.data_nascimento.trim() !== ''
            ? form.data_nascimento
            : null,
        cpf_cnpj:
          form.cpf_cnpj && form.cpf_cnpj.trim() !== '' ? form.cpf_cnpj : null,
      }

      await onSubmit(user.id, dataToSend)
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
                label="Data nascimento:"
                type="date"
                value={form.data_nascimento || ''}
                onChange={(e) =>
                  handleChange('data_nascimento', e.target.value)
                }
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
          </div>
        )}
      </Dialog>
    )
  },
)
