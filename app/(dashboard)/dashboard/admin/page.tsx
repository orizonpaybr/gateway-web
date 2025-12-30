'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import {
  DollarSign,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'

import { PeriodSelector } from '@/components/admin/PeriodSelector'
import { RecentTransactionsTable } from '@/components/admin/RecentTransactionsTable'
import { StatCard } from '@/components/admin/StatCard'
import { UsersStatsCard } from '@/components/admin/UsersStatsCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import {
  useAdminDashboardStats,
  useAdminTransactions,
} from '@/hooks/useAdminDashboard'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, isLoading: authLoading, authReady } = useAuth()
  const [periodo, setPeriodo] = useState('hoje')

  // Verificar se usuário é admin
  useEffect(() => {
    if (authReady && (!user || user.permission !== 3)) {
      toast.error('Acesso negado', {
        description: 'Você não tem permissão para acessar esta página',
      })
      router.push('/dashboard')
    }
  }, [user, authReady, router])

  // Buscar dados do dashboard
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useAdminDashboardStats(
    periodo,
    authReady && !!user && Number(user.permission) === 3,
  )

  // Buscar transações recentes
  const {
    data: transactions,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useAdminTransactions(
    { limit: 10 },
    authReady && !!user && Number(user.permission) === 3,
  )

  // Exibir erros
  useEffect(() => {
    if (statsError) {
      toast.error('Erro ao carregar dados', {
        description: statsError.message || 'Tente novamente mais tarde',
      })
    }
  }, [statsError])

  useEffect(() => {
    if (transactionsError) {
      toast.error('Erro ao carregar transações', {
        description: transactionsError.message || 'Tente novamente mais tarde',
      })
    }
  }, [transactionsError])

  // Loading state
  if (authLoading || !user || user.permission !== 3) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 md:px-6 pb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Administrativo
          </h1>
          <p className="text-gray-600 mt-1">Visão geral completa do sistema</p>
        </div>
        <div className="w-full md:w-64">
          <PeriodSelector value={periodo} onChange={setPeriodo} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 gap-6">
        <StatCard
          title="Saldo em Carteiras"
          value={stats?.financeiro.saldo_carteiras ?? 0}
          icon={Wallet}
          description="Total em carteiras de usuários"
          colorScheme="blue"
          formatAsCurrency
        />

        <StatCard
          title="Lucro Líquido"
          value={stats?.financeiro.lucro_liquido ?? 0}
          icon={TrendingUp}
          description="Taxas - custos de adquirentes"
          colorScheme="green"
          formatAsCurrency
        />

        <StatCard
          title="Taxas de Depósitos"
          value={stats?.financeiro.lucro_depositos ?? 0}
          icon={ArrowDownCircle}
          description="Receita de depósitos"
          colorScheme="purple"
          formatAsCurrency
        />

        <StatCard
          title="Taxas de Saques"
          value={stats?.financeiro.lucro_saques ?? 0}
          icon={ArrowUpCircle}
          description="Receita de saques"
          colorScheme="orange"
          formatAsCurrency
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatCard
          title="Transações Aprovadas"
          value={stats?.transacoes.total.quantidade ?? 0}
          icon={DollarSign}
          description={`Total: ${
            stats?.transacoes.total.valor_total.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }) ?? 'R$ 0,00'
          }`}
          colorScheme="blue"
          formatAsNumber
        />

        <StatCard
          title="Depósitos"
          value={stats?.transacoes.depositos.quantidade ?? 0}
          icon={ArrowDownCircle}
          description={`Total: ${
            stats?.transacoes.depositos.valor_total.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }) ?? 'R$ 0,00'
          }`}
          colorScheme="green"
          formatAsNumber
        />

        <StatCard
          title="Saques"
          value={stats?.transacoes.saques.quantidade ?? 0}
          icon={ArrowUpCircle}
          description={`Total: ${
            stats?.transacoes.saques.valor_total.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }) ?? 'R$ 0,00'
          }`}
          colorScheme="orange"
          formatAsNumber
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatCard
          title="Saques Pendentes"
          value={stats?.saques_pendentes.quantidade ?? 0}
          icon={Clock}
          description={`Valor total: ${
            stats?.saques_pendentes.valor_total.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }) ?? 'R$ 0,00'
          }`}
          colorScheme="yellow"
          formatAsNumber
        />

        <UsersStatsCard
          cadastrados={stats?.usuarios.cadastrados ?? 0}
          aprovados={stats?.usuarios.aprovados ?? 0}
          pendentes={stats?.usuarios.pendentes ?? 0}
          isLoading={statsLoading}
        />
      </div>

      {stats?.financeiro.taxas_adquirentes && (
        <div className="grid grid-cols-1 xl:grid-cols-1 2xl:grid-cols-3 gap-6">
          <StatCard
            title="Taxas de Entradas"
            value={stats.financeiro.taxas_adquirentes.entradas}
            icon={ArrowDownCircle}
            description="Pagas aos adquirentes"
            colorScheme="red"
            formatAsCurrency
          />

          <StatCard
            title="Taxas de Saídas"
            value={stats.financeiro.taxas_adquirentes.saidas}
            icon={ArrowUpCircle}
            description="Pagas aos adquirentes"
            colorScheme="red"
            formatAsCurrency
          />

          <StatCard
            title="Total de Taxas"
            value={stats.financeiro.taxas_adquirentes.total}
            icon={DollarSign}
            description="Custos totais com adquirentes"
            colorScheme="red"
            formatAsCurrency
          />
        </div>
      )}

      <RecentTransactionsTable
        transactions={transactions ?? []}
        isLoading={transactionsLoading}
      />
    </div>
  )
}
