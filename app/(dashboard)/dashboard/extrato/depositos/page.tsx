'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { transactionsAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import {
  ArrowDownLeft,
  Filter,
  Download,
  RotateCcw,
  Calendar,
} from 'lucide-react'
import * as XLSX from 'xlsx'

type DepositoItem = {
  id: number
  transaction_id: string
  tipo: 'deposito' | 'saque'
  amount: number
  valor_liquido: number
  taxa: number
  status: string
  status_legivel: string
  data: string
  created_at: string
  nome_cliente: string
  documento: string
  adquirente: string
  descricao: string
}

export default function DepositosPage() {
  const { authReady, user } = useAuth()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [period, setPeriod] = useState<'hoje' | '7d' | '30d' | 'custom'>('hoje')
  const [isLoading, setIsLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 20

  const [items, setItems] = useState<DepositoItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const normalize = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()

  const computeDateRange = () => {
    const now = new Date()
    let inicio: string | undefined
    let fim: string | undefined

    if (period === 'hoje') {
      const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      inicio = d1.toISOString().slice(0, 10)
      fim = d2.toISOString().slice(0, 10)
    } else if (period === '7d') {
      const d1 = new Date(now)
      d1.setDate(now.getDate() - 6)
      inicio = d1.toISOString().slice(0, 10)
      fim = now.toISOString().slice(0, 10)
    } else if (period === '30d') {
      const d1 = new Date(now)
      d1.setDate(now.getDate() - 29)
      inicio = d1.toISOString().slice(0, 10)
      fim = now.toISOString().slice(0, 10)
    } else if (period === 'custom' && startDate && endDate) {
      inicio = startDate
      fim = endDate
    }

    return { inicio, fim }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!authReady || !user) return
      setIsLoading(true)
      try {
        const { inicio, fim } = computeDateRange()
        const resp = await transactionsAPI.list({
          page,
          limit: perPage,
          tipo: 'deposito',
          busca: debouncedSearch || undefined,
          data_inicio: inicio,
          data_fim: fim,
        })
        if (resp?.success) {
          setItems(resp.data.data as unknown as DepositoItem[])
          setTotalPages(resp.data.last_page)
          setTotalItems(resp.data.total)
        } else {
          setItems([])
          setTotalPages(1)
          setTotalItems(0)
        }
      } catch (e) {
        console.error('Erro ao carregar depósitos:', e)
        setItems([])
        setTotalPages(1)
        setTotalItems(0)
      } finally {
        setIsLoading(false)
      }
    }

    setPage((prev) =>
      prev > 1 && (period !== 'custom' || debouncedSearch) ? 1 : prev,
    )
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, user, period, startDate, endDate, debouncedSearch, page])

  const canPrev = page > 1
  const canNext = page < totalPages

  const resetDates = () => {
    setStartDate('')
    setEndDate('')
    setShowDatePicker(false)
    setPeriod('hoje')
    setPage(1)
  }

  const hasData = !isLoading && items.length > 0

  const buildRowsForExcel = (rows: DepositoItem[]) =>
    rows.map((r) => ({
      ID: r.id,
      Transação: r.transaction_id,
      Tipo: r.tipo,
      Descrição: r.descricao,
      'Data (ISO)': r.data,
      'Valor Líquido (BRL)': r.valor_liquido,
      Taxa: r.taxa,
      Status: r.status_legivel || r.status,
      Adquirente: r.adquirente,
      Cliente: r.nome_cliente,
      Documento: r.documento,
    }))

  const handleExport = async () => {
    try {
      let allRows: DepositoItem[] = []
      const { inicio, fim } = computeDateRange()

      if (items.length > 0) {
        if (totalPages === 1) {
          allRows = items
        } else {
          for (let p = 1; p <= totalPages; p++) {
            const resp = await transactionsAPI.list({
              page: p,
              limit: perPage,
              tipo: 'deposito',
              busca: debouncedSearch || undefined,
              data_inicio: inicio,
              data_fim: fim,
            })
            if (resp?.success) {
              allRows = allRows.concat(
                (resp.data.data as unknown as DepositoItem[]) || [],
              )
            }
          }
        }
      } else {
        allRows = []
      }

      const ws = XLSX.utils.json_to_sheet(buildRowsForExcel(allRows))
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Depositos')
      XLSX.writeFile(
        wb,
        `depositos_${new Date().toISOString().slice(0, 10)}.xlsx`,
      )
    } catch (e) {
      console.error('Erro ao exportar XLSX:', e)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Extrato da Conta
          </h1>
          <p className="text-sm text-gray-600">
            Detalhamento de movimentações financeiras da conta
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={<Download size={18} />}
            onClick={handleExport}
          >
            Exportar
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full sm:w-72"
            />
            <Button variant="outline" icon={<Filter size={16} />}>
              Avançado
            </Button>
          </div>

          <div className="relative flex items-center gap-2">
            <Button
              variant={period === 'hoje' ? 'primary' : 'outline'}
              onClick={() => {
                setPeriod('hoje')
                setPage(1)
              }}
            >
              Hoje
            </Button>
            <Button
              variant={period === '7d' ? 'primary' : 'outline'}
              onClick={() => {
                setPeriod('7d')
                setPage(1)
              }}
            >
              7 dias
            </Button>
            <Button
              variant={period === '30d' ? 'primary' : 'outline'}
              onClick={() => {
                setPeriod('30d')
                setPage(1)
              }}
            >
              30 dias
            </Button>
            <Button
              variant={period === 'custom' ? 'primary' : 'outline'}
              icon={<Calendar size={16} />}
              onClick={() => setShowDatePicker((v) => !v)}
            />
            <Button
              variant="outline"
              icon={<RotateCcw size={16} />}
              onClick={resetDates}
            />

            {showDatePicker && (
              <div className="absolute right-0 top-11 z-10 bg-white border border-gray-200 rounded-lg shadow-md p-3 w-64">
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Data inicial
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Data final
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="ghost"
                      onClick={() => setShowDatePicker(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => {
                        setPeriod('custom')
                        setPage(1)
                        setShowDatePicker(false)
                      }}
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          {!hasData ? (
            <div className="py-16 text-center text-gray-600">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <ArrowDownLeft className="text-gray-400" />
                </div>
              </div>
              <p className="font-medium">Nenhum depósito encontrado</p>
              <p className="text-sm text-gray-500 mt-1">
                Não há depósitos para o período selecionado. Tente ajustar os
                filtros de data ou verificar novamente em alguns instantes.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                      Descrição
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                      Data
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                      Valor
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="p-4">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-5/6" />
                        </div>
                      </td>
                    </tr>
                  ) : (
                    items.map((deposito) => (
                      <tr
                        key={deposito.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 text-green-600">
                              <ArrowDownLeft size={16} />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {deposito.descricao}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(deposito.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-semibold text-green-600">
                            +
                            {deposito.valor_liquido.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                            {deposito.status_legivel || 'concluído'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Itens por página: <span className="font-medium">{perPage}</span> •
            Total: <span className="font-medium">{totalItems}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={!canPrev}
              onClick={() => canPrev && setPage((p) => p - 1)}
            >
              {'<'}
            </Button>
            <Button
              variant="outline"
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
}
