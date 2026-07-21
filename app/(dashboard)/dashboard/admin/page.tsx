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
  CalendarRange,
} from 'lucide-react'
import { toast } from 'sonner'

import { PeriodSelector } from '@/components/admin/PeriodSelector'
import { RecentTransactionsTable } from '@/components/admin/RecentTransactionsTable'
import { ReconciliationExportCard } from '@/components/admin/ReconciliationExportCard'
import { StatCard } from '@/components/admin/StatCard'
import { UsersStatsCard } from '@/components/admin/UsersStatsCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import {
  useAdminDashboardStats,
  useAdminTransactions,
} from '@/hooks/useAdminDashboard'

/** Conciliação/Excel: "tudo" vira 30 dias (limite do relatório). */
function reconciliationPeriod(periodo: string): string {
  return periodo === 'tudo' ? '30dias' : periodo
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, isLoading: authLoading, authReady } = useAuth()
  const [periodo, setPeriodo] = useState('hoje')

  const isAdmin = authReady && !!user && Number(user.permission) === 3

  useEffect(() => {
    if (authReady && (!user || user.permission !== 3)) {
      toast.error('Acesso negado', {
        description: 'Você não tem permissão para acessar esta página',
      })
      router.push('/dashboard')
    }
  }, [user, authReady, router])

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useAdminDashboardStats(periodo, isAdmin)

  // Complemento fixo: lucro dos últimos 30 dias (independente do filtro)
  const { data: stats30 } = useAdminDashboardStats('30dias', isAdmin)

  const {
    data: transactions,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useAdminTransactions({ limit: 10 }, isAdmin)

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

  if (authLoading || !user || user.permission !== 3) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  const lucroBrutoTaxas =
    (stats?.financeiro.lucro_depositos ?? 0) +
    (stats?.financeiro.lucro_saques ?? 0)

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
          description="Taxas cobradas − custos de adquirentes"
          colorScheme="green"
          formatAsCurrency
        />

        <StatCard
          title="Lucro Últimos 30 Dias"
          value={stats30?.financeiro.lucro_liquido ?? 0}
          icon={CalendarRange}
          description="Referência fixa (não muda com o filtro)"
          colorScheme="blue"
          formatAsCurrency
        />

        <StatCard
          title="Receita Bruta (taxas)"
          value={lucroBrutoTaxas}
          icon={DollarSign}
          description="Soma taxas de depósitos + saques do período"
          colorScheme="purple"
          formatAsCurrency
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
        <StatCard
          title="Taxas de Depósitos"
          value={stats?.financeiro.lucro_depositos ?? 0}
          icon={ArrowDownCircle}
          description="Receita Coratri em cash-in (taxa_cash_in)"
          colorScheme="purple"
          formatAsCurrency
        />

        <StatCard
          title="Taxas de Saques"
          value={stats?.financeiro.lucro_saques ?? 0}
          icon={ArrowUpCircle}
          description="Receita Coratri em cash-out (taxa_cash_out)"
          colorScheme="orange"
          formatAsCurrency
        />
      </div>

      <ReconciliationExportCard
        periodo={reconciliationPeriod(periodo)}
        dashboardPeriodo={periodo}
        enabled={isAdmin}
      />

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
            title="Custo Adquirente (entradas)"
            value={stats.financeiro.taxas_adquirentes.entradas}
            icon={ArrowDownCircle}
            description="Custo fixo pago à adquirente por depósito — não é lucro Coratri"
            colorScheme="red"
            formatAsCurrency
          />

          <StatCard
            title="Custo Adquirente (saídas)"
            value={stats.financeiro.taxas_adquirentes.saidas}
            icon={ArrowUpCircle}
            description="Custo fixo pago à adquirente por saque — não é lucro Coratri"
            colorScheme="red"
            formatAsCurrency
          />

          <StatCard
            title="Total Custo Adquirentes"
            value={stats.financeiro.taxas_adquirentes.total}
            description="Descontado do lucro líquido"
            icon={DollarSign}
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
