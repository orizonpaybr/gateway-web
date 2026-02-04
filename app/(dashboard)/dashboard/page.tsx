'use client'

import { useState, useMemo, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import {
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  DollarSign,
  Search,
} from 'lucide-react'

import { PixIcon } from '@/components/icons/PixIcon'
import { createLazyComponent } from '@/components/optimized/LazyComponent'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useBalanceVisibility } from '@/contexts/BalanceVisibilityContext'

const LazyTransactionChart = createLazyComponent(() =>
  import('@/components/dashboard/TransactionChart').then((m) => ({
    default: m.TransactionChart,
  })),
)
const LazyTransactionSummary = createLazyComponent(() =>
  import('@/components/dashboard/TransactionSummary').then((m) => ({
    default: m.TransactionSummary,
  })),
)
const LazyRecentTransactions = createLazyComponent(() =>
  import('@/components/dashboard/RecentTransactions').then((m) => ({
    default: m.RecentTransactions,
  })),
)
import {
  useDashboardStats,
  useInteractiveMovement,
  useTransactionSummary,
  useRecentTransactions,
} from '@/hooks/useReactQuery'
import { formatCurrencyBRL } from '@/lib/format'

export default function DashboardPage() {
  const router = useRouter()
  const [chartPeriod, setChartPeriod] = useState<
    'hoje' | 'ontem' | '7dias' | '30dias'
  >('30dias')

  // Usar AuthContext para token
  const { isBalanceHidden } = useBalanceVisibility()

  // React Query hooks para dados otimizados
  const {
    data: stats,
    isLoading: statsLoading,
    error: _statsError,
  } = useDashboardStats()
  const { data: _interactiveData, isLoading: interactiveLoading } =
    useInteractiveMovement(chartPeriod)
  const { data: _summaryData, isLoading: summaryLoading } =
    useTransactionSummary(chartPeriod)
  const { data: _recentData, isLoading: recentLoading } =
    useRecentTransactions(7)

  const handlePeriodChange = useCallback(
    (period: 'hoje' | 'ontem' | '7dias' | '30dias') => {
      setChartPeriod(period)
    },
    [],
  )

  const isLoading =
    statsLoading || interactiveLoading || summaryLoading || recentLoading

  // Memorizar formatação de moeda
  const formatCurrency = useCallback(
    (value: number) => formatCurrencyBRL(value, { hide: isBalanceHidden }),
    [isBalanceHidden],
  )

  // Memorizar dados das estatísticas
  const statsDisplay = useMemo(() => {
    if (!stats?.data) {
      return []
    }

    return [
      {
        title: 'Saldo Disponível',
        value: formatCurrency(stats.data.saldo_disponivel),
        icon: DollarSign,
        color: 'bg-green-100 text-green-600',
      },
      {
        title: 'Entradas do Mês',
        value: formatCurrency(stats.data.entradas_mes),
        icon: ArrowDownLeft,
        color: 'bg-blue-100 text-blue-600',
      },
      {
        title: 'Saídas do Mês',
        value: formatCurrency(stats.data.saidas_mes),
        icon: ArrowUpRight,
        color: 'bg-red-100 text-red-600',
      },
      {
        title: 'Splits do Mês',
        value: formatCurrency(stats.data.splits_mes),
        icon: TrendingUp,
        color: 'bg-purple-100 text-purple-600',
      },
    ]
  }, [stats, formatCurrency])

  const quickActions = useMemo(
    () => [
      {
        icon: PixIcon,
        label: 'Pix com Chave',
        onClick: () => router.push('/dashboard/pix/depositar'),
      },
      {
        icon: Search,
        label: 'Buscar Transações',
        onClick: () => router.push('/dashboard/buscar'),
      },
    ],
    [router],
  )

  return (
    <div className="space-y-6">
      <div className="p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
          {statsDisplay.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} hover>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <Icon size={24} />
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Acesso Rápido
          </h2>
          <div className="flex flex-col md:flex-row gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.label}
                  variant="outline"
                  className="justify-start h-auto py-4 md:flex-1"
                  icon={<Icon size={20} />}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              )
            })}
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-6">
            <LazyTransactionChart
              period={chartPeriod}
              onPeriodChange={handlePeriodChange}
              embedded
            />

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Resumo de Transações
              </h2>
              <p className="text-sm text-gray-600">Seus dados de transações</p>
            </div>

            <LazyTransactionSummary period={chartPeriod} embedded />
          </div>
        </Card>

        <LazyRecentTransactions />
      </div>
    </div>
  )
}
