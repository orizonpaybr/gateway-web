'use client'

/**
 * Página de gerenciamento de níveis de gamificação (Admin)
 *
 * Versão refatorada usando:
 * - useGamificationLevels (React Query)
 * - LevelCard e LevelEditForm (componentes)
 *
 * @module app/(dashboard)/dashboard/admin/configuracoes/niveis
 */

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Switch } from '@/components/ui/Switch'
import { LevelCard } from '@/components/admin/levels/LevelCard'
import { LevelEditForm } from '@/components/admin/levels/LevelEditForm'
import { useGamificationLevels } from '@/hooks/useGamificationLevels'
import { useAuth } from '@/contexts/AuthContext'
import { USER_PERMISSION } from '@/lib/constants'
import { Trophy, AlertCircle } from 'lucide-react'
import type {
  GamificationLevel,
  UpdateLevelData,
} from '@/lib/types/gamification'

export default function NiveisPage() {
  const { user } = useAuth()
  const [editingLevelId, setEditingLevelId] = useState<number | null>(null)

  // Hook centralizado com React Query
  const {
    levels,
    isSystemActive,
    isLoading,
    error,
    updateLevel,
    toggleActive,
    isUpdating,
    isTogglingActive,
  } = useGamificationLevels()

  if (user?.permission !== USER_PERMISSION.ADMIN) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600">
            Você não tem permissão para acessar esta página.
          </p>
        </Card>
      </div>
    )
  }

  const handleSave = (id: number, data: UpdateLevelData) => {
    updateLevel(
      { id, data },
      {
        onSuccess: () => {
          setEditingLevelId(null)
        },
      },
    )
  }

  const handleCancel = () => {
    setEditingLevelId(null)
  }

  const handleEdit = (level: GamificationLevel) => {
    setEditingLevelId(level.id)
  }

  const handleToggleSystem = () => {
    toggleActive(!isSystemActive)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Erro ao carregar níveis
          </h2>
          <p className="text-gray-600">{error.message}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        <Card className="p-4 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Níveis de Gamificação
                </h1>
                <p className="text-xs md:text-sm text-gray-600 mt-1 max-w-sm">
                  Configure os níveis e valores da jornada do usuário
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 lg:justify-end">
              <span className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                Sistema de Níveis
              </span>
              <Switch
                checked={isSystemActive}
                onCheckedChange={handleToggleSystem}
                disabled={isTogglingActive}
              />
              <span
                className={`text-sm font-semibold ${
                  isSystemActive ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {isSystemActive ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {levels.map((level) => (
            <div key={level.id}>
              {editingLevelId === level.id ? (
                <LevelEditForm
                  level={level}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  isSaving={isUpdating}
                />
              ) : (
                <LevelCard level={level} onEdit={handleEdit} />
              )}
            </div>
          ))}
        </div>

        {levels.length === 0 && (
          <Card className="p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum nível cadastrado
            </h3>
            <p className="text-gray-600">
              Execute o seeder para criar os níveis padrão.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
