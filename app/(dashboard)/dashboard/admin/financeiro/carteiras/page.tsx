'use client'

import { useState, useMemo, useCallback, memo } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { useWallets, useWalletsStats } from '@/hooks/useFinancial'
import {
  Wallet,
  Users,
  DollarSign,
  TrendingUp,
  Download,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { formatCurrencyBRL } from '@/lib/format'
import { useAuth } from '@/contexts/AuthContext'
import { USER_PERMISSION } from '@/lib/constants'
import { format } from 'date-fns'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'

const CarteirasPage = memo(function CarteirasPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [tipoUsuarioFilter, setTipoUsuarioFilter] = useState<string>('all')
  const [ordenar, setOrdenar] = useState<string>('saldo_desc')
  const [page, setPage] = useState(1)
  const perPage = 20

  const isAdmin = useMemo(() => {
    return !!user && Number(user.permission) === USER_PERMISSION.ADMIN
  }, [user])

  const filters = useMemo(() => {
    return {
      page,
      limit: perPage,
      ...(debouncedSearch && { busca: debouncedSearch }),
      ...(tipoUsuarioFilter !== 'all' && { tipo_usuario: tipoUsuarioFilter }),
      ordenar,
    }
  }, [page, perPage, debouncedSearch, tipoUsuarioFilter, ordenar])

  const { data, isLoading } = useWallets(filters, isAdmin)
  const { data: stats } = useWalletsStats(isAdmin)

  const processedData = useMemo(() => {
    if (!data?.data) return { items: [], totalPages: 1, totalItems: 0 }

    return {
      items: data.data.data || [],
      totalPages: data.data.last_page || 1,
      totalItems: data.data.total || 0,
    }
  }, [data])

  const handleExport = useCallback(() => {
    if (processedData.items.length === 0) {
      toast.error('Nenhuma carteira para exportar')
      return
    }

    const exportData = processedData.items.map((item) => ({
      ID: item.id,
      'User ID': item.user_id,
      Nome: item.name,
      Username: item.username,
      Email: item.email,
      Saldo: item.saldo,
      'Total Transações': item.total_transacoes,
      'Valor Sacado': item.valor_sacado,
      Status: item.status,
      'Data Cadastro': format(new Date(item.created_at), 'dd/MM/yyyy HH:mm'),
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Carteiras')
    XLSX.writeFile(
      wb,
      `carteiras_${new Date().toISOString().slice(0, 10)}.xlsx`,
    )
    toast.success('Arquivo exportado com sucesso!')
  }, [processedData.items])

  const canPrev = page > 1
  const canNext = page < processedData.totalPages
  const hasData = !isLoading && processedData.items.length > 0

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">Carteiras</h1>
          <p className="text-sm text-gray-600">
            Gerencie os saldos dos usuários da plataforma
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={16} />}
            onClick={handleExport}
          >
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
      </div>

      {stats?.data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Total Carteiras</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.data.total_carteiras}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg shrink-0">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Saldo Total</p>
                <p className="text-lg font-bold text-gray-900 truncate">
                  {formatCurrencyBRL(stats.data.saldo_total)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg shrink-0">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Carteiras Ativas</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.data.carteiras_ativas}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg shrink-0">
                <Wallet className="text-purple-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Valor Médio</p>
                <p className="text-lg font-bold text-gray-900 truncate">
                  {formatCurrencyBRL(stats.data.valor_medio_carteira)}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg shrink-0">
                <TrendingUp className="text-indigo-600" size={24} />
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex w-full items-center gap-2">
            <Input
              placeholder="Buscar por nome, username, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full sm:max-w-md"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-600">
                Tipo de Usuário
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={
                    tipoUsuarioFilter === 'ativo' ? 'primary' : 'outline'
                  }
                  size="sm"
                  onClick={() => {
                    setTipoUsuarioFilter('ativo')
                    setPage(1)
                  }}
                >
                  Com Saldo
                </Button>
                <Button
                  variant={
                    tipoUsuarioFilter === 'inativo' ? 'primary' : 'outline'
                  }
                  size="sm"
                  onClick={() => {
                    setTipoUsuarioFilter('inativo')
                    setPage(1)
                  }}
                >
                  Sem Saldo
                </Button>
                <Button
                  variant={tipoUsuarioFilter === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setTipoUsuarioFilter('all')
                    setPage(1)
                  }}
                >
                  Todos
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-600">
                Ordenar Por
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={ordenar === 'saldo_desc' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setOrdenar('saldo_desc')
                    setPage(1)
                  }}
                >
                  Maior Saldo
                </Button>
                <Button
                  variant={ordenar === 'saldo_asc' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setOrdenar('saldo_asc')
                    setPage(1)
                  }}
                >
                  Menor Saldo
                </Button>
                <Button
                  variant={ordenar === 'nome_asc' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setOrdenar('nome_asc')
                    setPage(1)
                  }}
                >
                  Nome A-Z
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          {!hasData ? (
            <div className="py-16 text-center text-gray-600">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Wallet className="text-blue-400" />
                </div>
              </div>
              <p className="font-medium">Nenhuma carteira encontrada</p>
              <p className="text-sm text-gray-500 mt-1">
                Não há carteiras para os filtros selecionados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 xl:mx-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      Usuário
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      Email
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      Saldo
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      Total Transações
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      Valor Sacado
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-4">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-5/6" />
                        </div>
                      </td>
                    </tr>
                  ) : (
                    processedData.items.map((carteira) => (
                      <tr
                        key={carteira.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {carteira.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              @{carteira.username}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-600">
                          {carteira.email}
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-sm font-bold text-green-600">
                            {formatCurrencyBRL(carteira.saldo)}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-sm font-semibold text-blue-600">
                            {formatCurrencyBRL(carteira.total_transacoes)}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-sm font-semibold text-red-600">
                            {formatCurrencyBRL(carteira.valor_sacado)}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            {carteira.status === 'Aprovado' ? (
                              <>
                                <CheckCircle
                                  className="text-green-600"
                                  size={14}
                                />
                                <span className="text-xs font-medium text-green-600">
                                  Aprovado
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle
                                  className="text-yellow-600"
                                  size={14}
                                />
                                <span className="text-xs font-medium text-yellow-600">
                                  Pendente
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col items-center gap-3 xl:flex-row xl:items-center xl:justify-between">
          <p className="text-sm text-gray-600 text-center xl:text-left">
            Itens por página: <span className="font-medium">{perPage}</span> •
            Total:{' '}
            <span className="font-medium">{processedData.totalItems}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!canPrev}
              onClick={() => canPrev && setPage((p) => p - 1)}
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
              onClick={() => canNext && setPage((p) => p + 1)}
            >
              {'>'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
})

export default CarteirasPage
