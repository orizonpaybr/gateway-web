'use client'

import { Card } from '@/components/ui/Card'
import { Trophy, TrendingUp, Target, Award } from 'lucide-react'

const levels = [
  { name: 'Bronze', color: 'bg-amber-700', minDeposit: 0 },
  { name: 'Prata', color: 'bg-gray-400', minDeposit: 10000 },
  { name: 'Ouro', color: 'bg-yellow-400', minDeposit: 50000 },
  { name: 'Safira', color: 'bg-blue-500', minDeposit: 100000 },
  { name: 'Diamante', color: 'bg-purple-500', minDeposit: 250000 },
]

export default function JornadaPage() {
  const currentLevel = 'Prata'
  const totalDeposited = 32500
  const currentLevelIndex = levels.findIndex((l) => l.name === currentLevel)
  const nextLevel = levels[currentLevelIndex + 1]
  const progress = nextLevel
    ? ((totalDeposited - levels[currentLevelIndex].minDeposit) /
        (nextLevel.minDeposit - levels[currentLevelIndex].minDeposit)) *
      100
    : 100

  const achievements = [
    {
      title: 'Primeiro Depósito',
      description: 'Realize seu primeiro depósito',
      completed: true,
      icon: Trophy,
    },
    {
      title: 'Nível Bronze',
      description: 'Alcance o nível Bronze',
      completed: true,
      icon: Award,
    },
    {
      title: 'R$ 10.000 Depositados',
      description: 'Deposite R$ 10.000',
      completed: true,
      icon: TrendingUp,
    },
    {
      title: 'Nível Prata',
      description: 'Alcance o nível Prata',
      completed: true,
      icon: Award,
    },
    {
      title: 'R$ 50.000 Depositados',
      description: 'Deposite R$ 50.000',
      completed: false,
      icon: Target,
    },
    {
      title: 'Nível Ouro',
      description: 'Alcance o nível Ouro',
      completed: false,
      icon: Award,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Jornada HorsePay</h1>
        <p className="text-gray-600 text-sm mt-1">
          Acompanhe seu progresso e desbloqueie novos níveis
        </p>
      </div>

      <Card padding="lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full mb-4">
            <Trophy size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Nível {currentLevel}
          </h2>
          <p className="text-gray-600">
            Total depositado:{' '}
            <span className="font-semibold text-gray-900">
              {totalDeposited.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </span>
          </p>
        </div>

        {nextLevel && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progresso para {nextLevel.name}
              </span>
              <span className="text-sm font-medium text-primary">
                {progress.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Faltam{' '}
              {(nextLevel.minDeposit - totalDeposited).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}{' '}
              para alcançar o próximo nível
            </p>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Todos os Níveis
        </h2>
        <div className="space-y-3">
          {levels.map((level, index) => {
            const isUnlocked = index <= currentLevelIndex
            const isCurrent = level.name === currentLevel

            return (
              <div
                key={level.name}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                  isCurrent
                    ? 'border-primary bg-primary/5'
                    : isUnlocked
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div
                  className={`w-12 h-12 ${
                    level.color
                  } rounded-full flex items-center justify-center ${
                    !isUnlocked && 'opacity-40'
                  }`}
                >
                  <Trophy size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {level.name}
                    </h3>
                    {isCurrent && (
                      <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                        Atual
                      </span>
                    )}
                    {isUnlocked && !isCurrent && (
                      <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                        Desbloqueado
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Depósito mínimo:{' '}
                    {level.minDeposit.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Conquistas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => {
            const Icon = achievement.icon
            return (
              <div
                key={achievement.title}
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  achievement.completed
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div
                  className={`p-3 rounded-lg ${
                    achievement.completed
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {achievement.description}
                  </p>
                  {achievement.completed && (
                    <span className="inline-block text-xs text-green-600 font-medium mt-2">
                      ✓ Conquistado
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
