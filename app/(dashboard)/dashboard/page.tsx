'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { NotificationBanner } from '@/components/dashboard/NotificationBanner'
import { TransactionChart } from '@/components/dashboard/TransactionChart'
import { TransactionSummary } from '@/components/dashboard/TransactionSummary'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { useRouter } from 'next/navigation'
import { dashboardAPI } from '@/lib/api'
import { toast } from 'sonner'
import {
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  DollarSign,
  Search,
  List,
} from 'lucide-react'
import { PixIcon } from '@/components/icons/PixIcon'

interface DashboardStats {
  saldo_disponivel: number
  entradas_mes: number
  saidas_mes: number
  splits_mes: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [chartPeriod, setChartPeriod] = useState<
    'hoje' | 'ontem' | '7dias' | '30dias'
  >('hoje')
  const [stats, setStats] = useState<DashboardStats>({
    saldo_disponivel: 0,
    entradas_mes: 0,
    saidas_mes: 0,
    splits_mes: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const rawToken = localStorage.getItem('token')
      const token =
        rawToken === 'null' || rawToken === null || rawToken === ''
          ? null
          : rawToken

      if (!token) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await dashboardAPI.getStats()
        if (response.success) {
          setStats(response.data)
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
        if (error instanceof Error && !error.message.includes('Token')) {
          toast.error('Erro ao carregar estatísticas do dashboard')
        }
      } finally {
        setIsLoading(false)
      }
    }

    const handleAuthTokenStored = () => {
      fetchStats()
    }

    window.addEventListener('auth-token-stored', handleAuthTokenStored)

    const rawToken = localStorage.getItem('token')
    const token =
      rawToken === 'null' || rawToken === null || rawToken === ''
        ? null
        : rawToken

    if (token) {
      fetchStats()
    } else {
      setIsLoading(false)
    }

    return () => {
      window.removeEventListener('auth-token-stored', handleAuthTokenStored)
    }
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const statsDisplay = [
    {
      title: 'Saldo Disponível',
      value: formatCurrency(stats.saldo_disponivel),
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Entradas do Mês',
      value: formatCurrency(stats.entradas_mes),
      icon: ArrowDownLeft,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Saídas do Mês',
      value: formatCurrency(stats.saidas_mes),
      icon: ArrowUpRight,
      color: 'bg-red-100 text-red-600',
    },
    {
      title: 'Splits do Mês',
      value: formatCurrency(stats.splits_mes),
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
    },
  ]

  const quickActions = [
    {
      icon: PixIcon,
      label: 'Pix com Chave',
      onClick: () => router.push('/dashboard/pix'),
    },
    {
      icon: Search,
      label: 'Buscar Transações',
      onClick: () => router.push('/dashboard/buscar'),
    },
    {
      icon: List,
      label: 'Extrato Detalhado',
      onClick: () => router.push('/dashboard/extrato'),
    },
  ]

  const recentTransactions = [
    {
      id: '1',
      type: 'saque' as const,
      valor: 29.0,
      descricao: 'Pagamento Enviado',
      data: '31/08/2025',
      hora: '15:16',
    },
    {
      id: '2',
      type: 'deposito' as const,
      valor: 17.0,
      descricao: 'Pagamento Recebido',
      data: '30/08/2025',
      hora: '05:42',
    },
    {
      id: '3',
      type: 'deposito' as const,
      valor: 17.0,
      descricao: 'Pagamento Recebido',
      data: '28/08/2025',
      hora: '07:22',
    },
  ]

  return (
    <div className="space-y-6">
      <NotificationBanner />
      <div className="p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.label}
                  variant="outline"
                  className="justify-start h-auto py-4"
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
            <TransactionChart
              period={chartPeriod}
              onPeriodChange={setChartPeriod}
              embedded={true}
            />

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Resumo de Transações
              </h2>
              <p className="text-sm text-gray-600">Seus dados de transações</p>
            </div>

            <TransactionSummary period={chartPeriod} embedded={true} />
          </div>
        </Card>

        <RecentTransactions
          transactions={recentTransactions}
          onViewExtract={() => router.push('/dashboard/extrato')}
        />
      </div>
    </div>
  )
}
