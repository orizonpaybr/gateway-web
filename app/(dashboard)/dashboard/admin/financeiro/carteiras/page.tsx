'use client'

import { useState, useMemo, useCallback, memo } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { useWallets, useWalletsStats } from '@/hooks/useFinancial'
import { useFinancialExport } from '@/hooks/useFinancialExport'
import { Wallet, Download, Award } from 'lucide-react'
import { formatCurrencyBRL } from '@/lib/format'
import { useAuth } from '@/contexts/AuthContext'
import { USER_PERMISSION } from '@/lib/constants'
import { openWhatsApp } from '@/lib/helpers/whatsappUtils'
import { toast } from 'sonner'
import type { Wallet as WalletType, Top3User } from '@/lib/api'

const PER_PAGE = 20
const DEBOUNCE_DELAY = 500

const StatsCard = memo<{
  label: string
  value: string
  isLoading: boolean
  gradient: string
  textColor: string
}>(({ label, value, isLoading, gradient, textColor }) => (
  <Card className={gradient}>
    <div className="p-6">
      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <>
          <p className={`text-sm font-medium ${textColor} mb-1`}>{label}</p>
          <p
            className={`text-3xl font-bold ${textColor.replace('700', '900')}`}
          >
            {value}
          </p>
        </>
      )}
    </div>
  </Card>
))

StatsCard.displayName = 'StatsCard'

const Top3UserItem = memo<{
  user: Top3User
  index: number
}>(({ user, index }) => {
  const medalColors = useMemo(() => {
    if (index === 0) return 'bg-amber-500 text-white'
    if (index === 1) return 'bg-gray-400 text-white'
    return 'bg-orange-400 text-white'
  }, [index])

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${medalColors}`}
        >
          {index + 1}º
        </div>
        <div>
          <p className="font-semibold text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-600">@{user.username}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600">Saldo</p>
        <p className="font-bold text-green-600">
          {formatCurrencyBRL(user.saldo)}
        </p>
      </div>
    </div>
  )
})

Top3UserItem.displayName = 'Top3UserItem'

const WalletTableRow = memo<{
  wallet: WalletType
  onWhatsAppClick: (phone: string | null) => void
}>(({ wallet, onWhatsAppClick }) => (
  <tr className="border-b border-gray-100 hover:bg-gray-50">
    <td className="py-4 px-4">
      <span className="text-sm font-medium text-gray-900">
        {wallet.username}
      </span>
    </td>
    <td className="py-4 px-4">
      <span className="text-sm font-bold text-gray-900">
        {formatCurrencyBRL(wallet.total_transacoes)}
      </span>
    </td>
    <td className="py-4 px-4">
      <span className="text-sm font-bold text-gray-900">
        {formatCurrencyBRL(wallet.saldo)}
      </span>
    </td>
    <td className="py-4 px-4">
      <span className="text-sm text-gray-600">{wallet.email}</span>
    </td>
    <td className="py-4 px-4">
      <span className="text-sm text-gray-600">{wallet.telefone || '—'}</span>
    </td>
    <td className="py-4 px-4">
      <Button
        variant="primary"
        size="sm"
        className="bg-green-600 hover:bg-green-700"
        onClick={() => onWhatsAppClick(wallet.telefone)}
      >
        WHATSAPP
      </Button>
    </td>
  </tr>
))

WalletTableRow.displayName = 'WalletTableRow'

const CarteirasPage = memo(function CarteirasPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, DEBOUNCE_DELAY)
  const [page, setPage] = useState(1)

  const isAdmin = useMemo(() => {
    return !!user && Number(user.permission) === USER_PERMISSION.ADMIN
  }, [user])

  const filters = useMemo(
    () => ({
      page,
      limit: PER_PAGE,
      ...(debouncedSearch && { busca: debouncedSearch }),
    }),
    [page, debouncedSearch],
  )

  const { data, isLoading } = useWallets(filters, isAdmin)
  const { data: stats, isLoading: isLoadingStats } = useWalletsStats(isAdmin)

  const processedData = useMemo(() => {
    if (!data?.data) return { items: [], totalPages: 1, totalItems: 0 }

    return {
      items: data.data.data || [],
      totalPages: data.data.last_page || 1,
      totalItems: data.data.total || 0,
    }
  }, [data])

  const { handleExport } = useFinancialExport(processedData.items, {
    filename: `carteiras_${new Date().toISOString().slice(0, 10)}.csv`,
    sheetName: 'Carteiras',
    customMapper: (item) => ({
      'User ID': item.user_id,
      Faturamento: item.total_transacoes,
      'Saldo da Carteira': item.saldo,
      Email: item.email,
      Telefone: item.telefone || 'Não informado',
    }),
  })

  const handleWhatsApp = useCallback((telefone: string | null) => {
    if (!openWhatsApp(telefone)) {
      toast.error('Telefone não cadastrado ou inválido')
    }
  }, [])

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value)
      setPage(1)
    },
    [],
  )

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const canPrev = useMemo(() => page > 1, [page])
  const canNext = useMemo(
    () => page < processedData.totalPages,
    [page, processedData.totalPages],
  )
  const hasData = useMemo(
    () => !isLoading && processedData.items.length > 0,
    [isLoading, processedData.items.length],
  )

  const totalCarteiras = useMemo(
    () => formatCurrencyBRL(stats?.data.saldo_total || 0),
    [stats?.data.saldo_total],
  )

  const top3Users = useMemo(
    () => stats?.data.top_3_usuarios || [],
    [stats?.data.top_3_usuarios],
  )

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Wallet className="text-blue-600" size={28} />
          Carteiras
        </h1>
        <p className="text-sm text-gray-600">
          Gerencie saldos em carteiras e relatórios de usuários
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard
          label="Total em carteiras"
          value={totalCarteiras}
          isLoading={isLoadingStats}
          gradient="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
          textColor="text-green-700"
        />
        <StatsCard
          label="Total no gateway"
          value={totalCarteiras}
          isLoading={isLoadingStats}
          gradient="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
          textColor="text-blue-700"
        />
      </div>

      <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-amber-200">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="text-amber-600" size={24} />
            <h2 className="text-lg font-bold text-gray-900">
              TOP 3 com mais vendas
            </h2>
          </div>

          {isLoadingStats ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : top3Users.length > 0 ? (
            <div className="space-y-2">
              {top3Users.map((topUser, index) => (
                <Top3UserItem key={topUser.id} user={topUser} index={index} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg border border-amber-200 text-center">
              <p className="text-amber-700">Nenhum usuário encontrado</p>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">
                Relatório de Usuários
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<Download size={16} />}
              onClick={handleExport}
              className="border-blue-400 text-blue-600 hover:bg-blue-50 bg-white"
            >
              Exportar
            </Button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pesquisar
            </label>
            <Input
              placeholder="Pesquisar"
              value={search}
              onChange={handleSearchChange}
              className="max-w-md"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    User ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Faturamento
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Saldo da Carteira
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Telefone
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-4">
                      <div className="space-y-3">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    </td>
                  </tr>
                ) : !hasData ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Wallet className="text-blue-400" />
                        </div>
                      </div>
                      <p className="font-medium text-gray-900">
                        Nenhum usuário encontrado
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Tente ajustar sua pesquisa
                      </p>
                    </td>
                  </tr>
                ) : (
                  processedData.items.map((carteira) => (
                    <WalletTableRow
                      key={carteira.id}
                      wallet={carteira}
                      onWhatsAppClick={handleWhatsApp}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col items-center gap-3 xl:flex-row xl:items-center xl:justify-between">
            <p className="text-sm text-gray-600 text-center xl:text-left">
              Itens por página: <span className="font-medium">{PER_PAGE}</span>{' '}
              • Total:{' '}
              <span className="font-medium">{processedData.totalItems}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!canPrev}
                onClick={() => canPrev && handlePageChange(page - 1)}
              >
                {'<'}
              </Button>
              <span className="text-sm text-gray-600">
                Página {page} de {processedData.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!canNext}
                onClick={() => canNext && handlePageChange(page + 1)}
              >
                {'>'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
})

export default CarteirasPage
