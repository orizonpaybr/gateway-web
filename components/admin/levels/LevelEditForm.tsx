/**
 * Formulário de edição de Nível
 *
 * Componente controlado com validação Zod
 *
 * @module components/admin/levels/LevelEditForm
 */

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CurrencyInput } from '@/components/ui/CurrencyInput'
import { X, Loader2 } from 'lucide-react'
import { toReais, reaisToCentsString } from '@/lib/currency'
import { isBronzeLevel } from '@/lib/constants/gamification'
import {
  validateNivelForm,
  type NivelFormData,
} from '@/lib/schemas/nivel.schema'
import type {
  GamificationLevel,
  UpdateLevelData,
} from '@/lib/types/gamification'

interface LevelEditFormProps {
  level: GamificationLevel
  onSave: (id: number, data: UpdateLevelData) => void
  onCancel: () => void
  isSaving?: boolean
}

export function LevelEditForm({
  level,
  onSave,
  onCancel,
  isSaving = false,
}: LevelEditFormProps) {
  const [formData, setFormData] = useState<NivelFormData>({
    nome: level.nome,
    minimo: isBronzeLevel(level.nome) ? '0' : reaisToCentsString(level.minimo),
    maximo: reaisToCentsString(level.maximo),
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const isBronze = isBronzeLevel(level.nome)

  const handleSubmit = () => {
    const validation = validateNivelForm(formData)

    if (!validation.success) {
      setErrors(validation.errors ?? {})
      return
    }

    const updateData: UpdateLevelData = {
      nome: formData.nome,
      minimo: isBronze ? 0 : toReais(formData.minimo),
      maximo: toReais(formData.maximo),
    }

    onSave(level.id, updateData)
  }

  return (
    <Card className="p-4 md:p-6 border-2 border-blue-300 bg-blue-50">
      <div>
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-base md:text-lg font-bold text-gray-900">
            Editando: {level.nome}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSaving}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
              Nome do Nível *
            </label>
            <Input
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              className={errors.nome ? 'border-red-500' : ''}
              disabled={isSaving}
            />
            {errors.nome && (
              <p className="text-xs text-red-600 mt-1">{errors.nome}</p>
            )}
          </div>

          {isBronze ? (
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                Valor Mínimo (R$)
              </label>
              <Input value="R$ 0,00" disabled className="bg-gray-50" />
              <p className="text-[11px] md:text-xs text-gray-500 mt-1">
                O nível Bronze sempre inicia em R$ 0,00. O usuário começa no
                Bronze com saldo zero e progride conforme deposita.
              </p>
            </div>
          ) : (
            <div>
              <CurrencyInput
                label="Valor Mínimo (R$) *"
                value={formData.minimo}
                onChange={(value) =>
                  setFormData({ ...formData, minimo: value })
                }
                error={errors.minimo}
                disabled={isSaving}
              />
            </div>
          )}

          <div>
            <CurrencyInput
              label="Valor Máximo (R$) *"
              value={formData.maximo}
              onChange={(value) => setFormData({ ...formData, maximo: value })}
              error={errors.maximo}
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 md:gap-3 mt-4 md:mt-6">
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
