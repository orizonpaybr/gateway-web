/**
 * Card de visualização de Nível
 *
 * Componente reutilizável para exibir informações
 * de um nível de gamificação
 *
 * @module components/admin/levels/LevelCard
 */

import React from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Edit2, TrendingUp, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import { getLevelIcon } from '@/lib/constants/gamification'
import type { GamificationLevel } from '@/lib/types/gamification'

interface LevelCardProps {
  level: GamificationLevel
  onEdit: (level: GamificationLevel) => void
}

export function LevelCard({ level, onEdit }: LevelCardProps) {
  const iconUrl = level.icone || getLevelIcon(level.nome)

  return (
    <Card className="p-4 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 md:gap-4 flex-1">
          <div
            className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-white shadow-lg border"
            style={{ borderColor: level.cor ?? '#gray-200' }}
          >
            {iconUrl ? (
              <Image
                src={iconUrl}
                alt={level.nome}
                width={40}
                height={40}
                className="object-contain"
              />
            ) : (
              <span
                className="text-xl font-bold"
                style={{ color: level.cor ?? '#6b7280' }}
              >
                {level.nome.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-base md:text-xl font-bold text-gray-900 mb-1">
              {level.nome}
            </h3>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4 text-xs md:text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                <span>
                  <strong>Mínimo:</strong> {formatCurrency(level.minimo)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                <span>
                  <strong>Máximo:</strong> {formatCurrency(level.maximo)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end lg:justify-center gap-2 pr-1 md:pr-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(level)}
            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>
    </Card>
  )
}
