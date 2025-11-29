'use client'

import React, { useState, useEffect, memo, useCallback } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { DocumentInput } from '@/components/ui/DocumentInput'
import { Button } from '@/components/ui/Button'
import { Manager, CreateManagerData, UpdateManagerData } from '@/lib/api'
import { User, Mail, Percent } from 'lucide-react'
import {
  PASSWORD_RULES,
  PERCENTAGE_RULES,
  VALIDATION_MESSAGES,
  type ValidationRule,
  requiredRule,
  emailRule,
  passwordRule,
  percentageRule,
} from '@/lib/constants/managers'

interface ManagerEditModalProps {
  open: boolean
  onClose: () => void
  manager?: Manager | null
  onSubmit: (data: CreateManagerData | UpdateManagerData) => Promise<void>
  isSaving?: boolean
}

export const ManagerEditModal = memo(function ManagerEditModal({
  open,
  onClose,
  manager,
  onSubmit,
  isSaving,
}: ManagerEditModalProps) {
  const isEdit = !!manager

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    cpf_cnpj: '',
    telefone: '',
    gerente_percentage: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (manager) {
      setFormData({
        name: manager.name || '',
        email: manager.email || '',
        password: '',
        cpf_cnpj: manager.cpf_cnpj || '',
        telefone: manager.telefone || '',
        gerente_percentage: manager.gerente_percentage?.toString() || '',
      })
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        cpf_cnpj: '',
        telefone: '',
        gerente_percentage: '',
      })
    }
    setErrors({})
  }, [manager, open])

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    // Definir regras de validação baseadas no contexto (criação vs edição)
    const validationRules: ValidationRule[] = [
      requiredRule('name', VALIDATION_MESSAGES.REQUIRED_NAME),

      requiredRule('email', VALIDATION_MESSAGES.REQUIRED_EMAIL),
      emailRule(VALIDATION_MESSAGES.INVALID_EMAIL),
    ]

    // Adicionar validação de senha apenas na criação
    if (!isEdit) {
      validationRules.push(
        requiredRule('password', VALIDATION_MESSAGES.REQUIRED_PASSWORD),
        passwordRule(
          PASSWORD_RULES.MIN_LENGTH,
          VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH,
        ),
      )
    }

    // Percentual de comissão (opcional, mas se preenchido deve ser válido)
    validationRules.push(
      percentageRule(
        PERCENTAGE_RULES.MIN,
        PERCENTAGE_RULES.MAX,
        VALIDATION_MESSAGES.PERCENTAGE_RANGE,
      ),
    )

    for (const rule of validationRules) {
      const fieldValue = formData[rule.field as keyof typeof formData] as string

      if (rule.condition && !rule.condition(formData as any)) {
        continue
      }

      const error = rule.validate(fieldValue || '', formData as any)
      if (error) {
        newErrors[rule.field as string] = error
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

      // Construir dados do formulário de forma type-safe
      const submitData: CreateManagerData | UpdateManagerData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone.trim() || undefined,
      }

      // Processar gerente_percentage: normalizar vírgula para ponto
      if (formData.gerente_percentage && formData.gerente_percentage.trim()) {
        const normalizedValue = formData.gerente_percentage
          .trim()
          .replace(',', '.')
        const parsedValue = parseFloat(normalizedValue)
        if (!isNaN(parsedValue)) {
          submitData.gerente_percentage = parsedValue
        }
      }

      // Campos exclusivos de criação
      if (!isEdit) {
        const createData = submitData as CreateManagerData
        if (formData.cpf_cnpj.trim()) {
          createData.cpf_cnpj = formData.cpf_cnpj.trim()
        }
        if (formData.password.trim()) {
          createData.password = formData.password.trim()
        }
      }

      try {
        await onSubmit(submitData)
        onClose()
      } catch (error) {
        console.error('Erro ao submeter formulário:', error)
      }
    },
    [formData, isEdit, validateForm, onSubmit, onClose],
  )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar Gerente' : 'Novo Gerente'}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Nome *"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            icon={<User size={18} />}
            placeholder="Nome completo do gerente"
            disabled={isSaving}
          />
        </div>

        <div>
          <Input
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            error={errors.email}
            icon={<Mail size={18} />}
            placeholder={isEdit ? manager?.email || '' : 'email@exemplo.com'}
            disabled={isSaving}
            autoComplete="off"
          />
        </div>

        {!isEdit && (
          <div>
            <Input
              label="Senha *"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              error={errors.password}
              placeholder="Digite sua senha"
              disabled={isSaving}
              showPasswordToggle={true}
              autoComplete="new-password"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!isEdit && (
            <div>
              <DocumentInput
                label="CPF/CNPJ"
                value={formData.cpf_cnpj}
                onChange={(value) =>
                  setFormData({ ...formData, cpf_cnpj: value })
                }
                error={errors.cpf_cnpj}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                disabled={isSaving}
              />
            </div>
          )}

          <div>
            <PhoneInput
              label="Telefone"
              value={formData.telefone}
              onChange={(value) =>
                setFormData({ ...formData, telefone: value })
              }
              error={errors.telefone}
              placeholder="(00) 99999-9999"
              disabled={isSaving}
            />
          </div>
        </div>

        <div>
          <Input
            label="Percentual de Comissão (%)"
            type="number"
            step={PERCENTAGE_RULES.STEP.toString()}
            min={PERCENTAGE_RULES.MIN.toString()}
            max={PERCENTAGE_RULES.MAX.toString()}
            value={formData.gerente_percentage}
            onChange={(e) =>
              setFormData({ ...formData, gerente_percentage: e.target.value })
            }
            error={errors.gerente_percentage}
            icon={<Percent size={18} />}
            placeholder="0.00"
            disabled={isSaving}
          />
          <p className="text-xs text-gray-500 mt-1">
            Percentual de comissão que o gerente receberá sobre as transações
            dos clientes
          </p>
        </div>
      </form>
    </Dialog>
  )
})
