'use client'

import { useState, useMemo } from 'react'

import { Search, AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { usePixInfracoes } from '@/hooks/useReactQuery'
import { useDebounce } from '@/hooks/useDebounce'
import { formatCurrencyBRL } from '@/lib/format'
import { formatDateForDisplay } from '@/lib/dateUtils'

export default function InfracoesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)
  const [page, setPage] = useState(1)
  const perPage = 20

  // Buscar dados da API
  const { data, isLoading } = usePixInfracoes({
    page,
    per_page: perPage,
    search: debouncedSearch,
  })

  const processedData = useMemo(() => {
    if (!data?.data) {
      return { items: [], totalPages: 1, totalItems: 0 }
    }

    return {
      items: data.data.data || [],
      totalPages: data.data.last_page || 1,
      totalItems: data.data.total || 0,
    }
  }, [data])

  const filteredInfracoes = useMemo(() => {
    if (!processedData.items) {
      return []
    }

    return processedData.items.filter(
      (infracao: { descricao?: string; end_to_end?: string }) => {
        if (searchTerm) {
          return (
            (infracao.descricao || '')
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (infracao.end_to_end || '').includes(searchTerm)
          )
        }
        return true
      },
    )
  }, [processedData.items, searchTerm])

  const stats = useMemo(() => {
    if (!processedData.items) {
      return { total: 0, ativas: 0, resolvidas: 0, emAnalise: 0, valorTotal: 0 }
    }

    const ativas = processedData.items.filter((i: { status?: string }) => {
      return i.status?.toLowerCase() === 'ativa'
    })

    return {
      total: processedData.totalItems,
      ativas: ativas.length,
      resolvidas: processedData.items.filter((i: { status?: string }) => {
        return i.status?.toLowerCase() === 'resolvida'
      }).length,
      emAnalise: processedData.items.filter((i: { status?: string }) => {
        return (
          i.status?.toLowerCase() === 'em_analise' ||
          i.status?.toLowerCase() === 'em análise'
        )
      }).length,
      valorTotal: ativas.reduce(
        (
          acc: number,
          i: {
            valor?: string | number
          },
        ) => {
          return acc + parseFloat(String(i.valor || 0))
        },
        0,
      ),
    }
  }, [processedData])

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ativa':
        return { label: 'Ativa', className: 'bg-red-100 text-red-700' }
      case 'resolvida':
        return { label: 'Resolvida', className: 'bg-green-100 text-green-700' }
      case 'em_analise':
        return {
          label: 'Em Análise',
          className: 'bg-yellow-100 text-yellow-700',
        }
      default:
        return { label: 'Desconhecido', className: 'bg-gray-100 text-gray-700' }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Infrações</h1>
          <p className="text-gray-600 text-sm mt-1">
            Acompanhe infrações e bloqueios em sua conta
          </p>
        </div>
      </div>

      {stats.ativas > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="text-red-600 flex-shrink-0" size={20} />
          <div className="text-sm text-red-800">
            <p className="font-medium">
              Você possui {stats.ativas} infrações ativas
            </p>
            <p className="mt-1">
              Entre em contato com o suporte para mais informações sobre como
              resolver.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card hover>
          <p className="text-sm text-gray-600 mb-2">Total de Infrações</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </Card>
        <Card hover>
          <p className="text-sm text-gray-600 mb-2">Ativas</p>
          <p className="text-2xl font-bold text-red-600">{stats.ativas}</p>
        </Card>
        <Card hover>
          <p className="text-sm text-gray-600 mb-2">Em Análise</p>
          <p className="text-2xl font-bold text-yellow-600">
            {stats.emAnalise}
          </p>
        </Card>
        <Card hover>
          <p className="text-sm text-gray-600 mb-2">Valor Total Ativo</p>
          <p className="text-2xl font-bold text-red-600">
            {stats.valorTotal.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </p>
        </Card>
      </div>

      <Card>
        <Input
          placeholder="Buscar por descrição ou EndToEndID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={18} />}
        />
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Descrição
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Valor
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Data
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  EndToEndID
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td colSpan={6} className="py-3 px-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredInfracoes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Nenhuma infração encontrada
                  </td>
                </tr>
              ) : (
                filteredInfracoes.map(
                  (infracao: {
                    id: number
                    descricao?: string
                    valor?: string | number
                    data_criacao?: string
                    date?: string
                    end_to_end?: string
                    endToEnd?: string
                    status?: string
                  }) => {
                    const status = infracao.status?.toLowerCase() || ''
                    const statusConfig = getStatusConfig(status)

                    return (
                      <tr
                        key={infracao.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-100 text-red-600">
                              <AlertTriangle size={16} />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {infracao.descricao || 'Infração PIX'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-semibold text-red-600">
                            {formatCurrencyBRL(
                              parseFloat(String(infracao.valor || 0)),
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDateForDisplay(
                            infracao.data_criacao || infracao.date || '',
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-mono text-gray-600">
                            {infracao.end_to_end || infracao.endToEnd || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusConfig.className}`}
                          >
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm">
                            Ver Detalhes
                          </Button>
                        </td>
                      </tr>
                    )
                  },
                )
              )}
            </tbody>
          </table>
        </div>

        {filteredInfracoes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Exibindo {filteredInfracoes.length} de {processedData.totalItems}{' '}
              infrações
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((p) => Math.min(processedData.totalPages, p + 1))
                }
                disabled={page >= processedData.totalPages}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
