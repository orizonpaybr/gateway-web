import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import type { AdminUser, CreateUserData, UpdateUserData } from '@/lib/api'
interface UserFormModalProps {
  open: boolean
  onClose: () => void
  onSubmitCreate?: (data: CreateUserData) => void
  onSubmitUpdate?: (userId: number, data: UpdateUserData) => void
  user?: AdminUser | null
}

export function UserFormModal({
  open,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  user,
}: UserFormModalProps) {
  const isEdit = !!user
  const [form, setForm] = useState<Partial<CreateUserData & UpdateUserData>>({})

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        telefone: user.telefone,
        cpf_cnpj: user.cpf_cnpj,
        permission: user.permission,
        status: user.status,
      })
    } else {
      setForm({})
    }
  }, [user])

  const handleChange = (key: string, value: unknown) =>
    setForm((p) => ({ ...p, [key]: value }))

  const handleSubmit = () => {
    if (isEdit && user) {
      onSubmitUpdate?.(user.id, form as UpdateUserData)
    } else {
      onSubmitCreate?.(form as CreateUserData)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar usuário' : 'Novo usuário'}
    >
      <div className="space-y-3">
        {!isEdit && (
          <Input
            label="Usuário"
            placeholder="username"
            value={(form as { username?: string }).username || ''}
            onChange={(e) => handleChange('username', e.target.value)}
          />
        )}
        <Input
          label="Nome"
          value={form.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
        />
        <Input
          label="Email"
          type="email"
          value={form.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
        />
        {!isEdit && (
          <Input
            label="Senha"
            type="password"
            value={(form as { password?: string }).password || ''}
            onChange={(e) => handleChange('password', e.target.value)}
          />
        )}
        <Input
          label="Telefone"
          value={form.telefone || ''}
          onChange={(e) => handleChange('telefone', e.target.value)}
        />
        <Input
          label="CPF/CNPJ"
          value={form.cpf_cnpj || ''}
          onChange={(e) => handleChange('cpf_cnpj', e.target.value)}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>{isEdit ? 'Salvar' : 'Criar'}</Button>
        </div>
      </div>
    </Dialog>
  )
}
