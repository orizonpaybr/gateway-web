'use client'

import React, { Suspense, lazy } from 'react'
import { Percent } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useGamification } from '@/hooks/useGamification'

const CurrentLevelProgress = lazy(
  () => import('@/components/gamification/CurrentLevelProgress'),
)
const AchievementTrail = lazy(
  () => import('@/components/gamification/AchievementTrail'),
)
const AchievementMessages = lazy(
  () => import('@/components/gamification/AchievementMessages'),
)
const SummaryCards = lazy(
  () => import('@/components/gamification/SummaryCards'),
)

const GamificationSkeleton = () => (
  <div className="space-y-8 p-6">
    <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex items-center gap-6">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-8 w-24 mb-4" />
          <Skeleton className="h-2 w-full rounded-full mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    </Card>

    <Card className="p-6">
      <Skeleton className="h-6 w-48 mb-6" />
      <div className="grid grid-cols-5 gap-4 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-center">
            <Skeleton className="w-12 h-12 rounded-full" />
          </div>
        ))}
      </div>
      <Skeleton className="w-full h-2 rounded-full mb-6" />
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="text-center">
            <Skeleton className="h-4 w-16 mx-auto mb-2" />
            <Skeleton className="h-4 w-20 mx-auto mb-2" />
            <Skeleton className="h-2 w-full rounded-full mb-2" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>
        ))}
      </div>
    </Card>

    <Card className="p-6">
      <Skeleton className="h-6 w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4 border">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-16 w-full" />
          </Card>
        ))}
      </div>
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-8 w-32" />
        </Card>
      ))}
    </div>
  </div>
)

export default function JornadaPage() {
  const { data, isLoading, error, refreshData } = useGamification()

  if (error) {
    return (
      <div className="space-y-8 p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Jornada Orizon
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Sua evolução no mundo dos pagamentos
          </p>
        </div>

        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            Erro ao carregar dados de gamificação
          </h2>
          <p className="text-gray-600 mb-4">
            {error?.message || 'Ocorreu um erro inesperado'}
          </p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
          Jornada Orizon
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Sua evolução no mundo dos pagamentos
        </p>
      </div>

      <Suspense fallback={<GamificationSkeleton />}>
        {isLoading ? (
          <GamificationSkeleton />
        ) : data ? (
          <>
            <CurrentLevelProgress
              currentLevel={data.currentLevel}
              totalDeposited={data.totalDeposited}
              currentLevelMax={data.currentLevelMax}
              nextLevelData={data.nextLevelData}
              progress={data.currentProgress}
            />

            <Card className="p-5 sm:p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Percent className="h-6 w-6" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    Benefício Cashback
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    A cada meta de faturamento atingida, você ganha{' '}
                    <span className="font-semibold text-emerald-700">3% de cashback</span>{' '}
                    sobre o valor. Quanto mais você evolui na jornada, mais você recebe.
                  </p>
                </div>
              </div>
            </Card>

            <AchievementTrail levels={data.achievementTrail} />

            <AchievementMessages messages={data.achievementMessages} />

            <SummaryCards cards={data.summaryCards} />
          </>
        ) : (
          <GamificationSkeleton />
        )}
      </Suspense>
    </div>
  )
}
