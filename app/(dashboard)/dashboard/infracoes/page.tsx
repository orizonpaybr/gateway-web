'use client'

import { useState } from 'react'

import { Download, Search, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

export default function InfracoesPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const infracoes = [
    {
      id: '1',
      description: 'Chargeback identificado',
      value: 250.0,
      date: '05/10/2025 14:20',
      endToEnd: 'E1234567820251005142045',
      status: 'ativa',
    },
    {
      id: '2',
      description: 'Transação suspeita de fraude',
      value: 1200.0,
      date: '03/10/2025 10:15',
      endToEnd: 'E1234567820251003101532',
      status: 'ativa',
    },
    {
      id: '3',
      description: 'Valor retornado por contestação',
      value: 450.0,
      date: '01/10/2025 16:30',
      endToEnd: 'E1234567820251001163045',
      status: 'resolvida',
    },
    {
      id: '4',
      description: 'Bloqueio preventivo',
      value: 800.0,
      date: '28/09/2025 11:45',
      endToEnd: 'E1234567820250928114512',
      status: 'em_analise',
    },
  ]

  const filteredInfracoes = infracoes.filter((infracao) =>
    searchTerm
      ? infracao.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        infracao.endToEnd.includes(searchTerm)
      : true,
  )

  const stats = {
    total: infracoes.length,
    ativas: infracoes.filter((i) => i.status === 'ativa').length,
    resolvidas: infracoes.filter((i) => i.status === 'resolvida').length,
    emAnalise: infracoes.filter((i) => i.status === 'em_analise').length,
    valorTotal: infracoes
      .filter((i) => i.status === 'ativa')
      .reduce((acc, i) => acc + i.value, 0),
  }

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

  const handleExport = () => {
    toast.info(
      'Funcionalidade de exportação será implementada com a integração da API',
    )
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
        <Button icon={<Download size={18} />} onClick={handleExport}>
          Exportar Infrações
        </Button>
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
              {filteredInfracoes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Nenhuma infração encontrada
                  </td>
                </tr>
              ) : (
                filteredInfracoes.map((infracao) => {
                  const statusConfig = getStatusConfig(infracao.status)

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
                            {infracao.description}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-semibold text-red-600">
                          {infracao.value.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {infracao.date}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-mono text-gray-600">
                          {infracao.endToEnd}
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
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredInfracoes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Exibindo {filteredInfracoes.length} de {infracoes.length}{' '}
              infrações
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Anterior
              </Button>
              <Button variant="outline" size="sm">
                Próximo
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
