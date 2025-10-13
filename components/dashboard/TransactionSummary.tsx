'use client'

import { Card } from '@/components/ui/Card'
import {
  BarChart3,
  Receipt,
  QrCode,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Percent,
} from 'lucide-react'

export interface TransactionSummaryData {
  quantidadeTransacoes: {
    depositos: number
    saques: number
  }
  tarifaCobrada: number
  qrCodes: {
    pagos: number
    gerados: number
  }
  indiceConversao: number
  ticketMedio: {
    depositos: number
    saques: number
  }
  valorMinMax: {
    depositos: { min: number; max: number }
    saques: { min: number; max: number }
  }
  infracoes: number
  percentualInfracoes: {
    percentual: number
    valorTotal: number
  }
}

interface TransactionSummaryProps {
  data?: TransactionSummaryData
  embedded?: boolean
}

const defaultData: TransactionSummaryData = {
  quantidadeTransacoes: { depositos: 0, saques: 0 },
  tarifaCobrada: 0,
  qrCodes: { pagos: 0, gerados: 0 },
  indiceConversao: 0,
  ticketMedio: { depositos: 0, saques: 0 },
  valorMinMax: {
    depositos: { min: 0, max: 0 },
    saques: { min: 0, max: 0 },
  },
  infracoes: 0,
  percentualInfracoes: { percentual: 0, valorTotal: 0 },
}

export function TransactionSummary({
  data = defaultData,
  embedded = false,
}: TransactionSummaryProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const content = (
    <div className="space-y-6">
      {!embedded && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Resumo de Transações
          </h2>
          <p className="text-sm text-gray-600">Seus dados de transações</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Quantidade de Transações
          </h3>
          <div className="space-y-2">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-gray-600">Depósitos</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {data.quantidadeTransacoes.depositos}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-gray-600">Saques</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {data.quantidadeTransacoes.saques}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 bg-yellow-100 rounded-lg">
              <Receipt className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Tarifa Cobrada
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(data.tarifaCobrada)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Soma das taxas de depósitos
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 bg-purple-100 rounded-lg">
              <QrCode className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">QR Codes</h3>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Pagos / Gerados</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {data.qrCodes.pagos} / {data.qrCodes.gerados}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 bg-green-100 rounded-lg">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Índice de Conversão
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {formatPercent(data.indiceConversao)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Taxa de conversão de depósitos
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 bg-indigo-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Ticket Médio
          </h3>
          <div className="space-y-2">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-xs text-gray-600">Depósitos</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(data.ticketMedio.depositos)}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <TrendingDown className="w-3 h-3 text-red-600" />
                <span className="text-xs text-gray-600">Saques</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(data.ticketMedio.saques)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 bg-pink-100 rounded-lg">
              <Activity className="w-5 h-5 text-pink-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Valor Mínimo / Valor Máximo
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs text-red-600 font-medium">Mínimo</span>
                <span className="text-xs text-gray-500">Depósitos</span>
              </div>
              <p className="text-base font-bold text-red-600">
                {formatCurrency(data.valorMinMax.depositos.min)}
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs text-green-600 font-medium">
                  Máximo
                </span>
                <span className="text-xs text-gray-500">Depósitos</span>
              </div>
              <p className="text-base font-bold text-green-600">
                {formatCurrency(data.valorMinMax.depositos.max)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Infrações</h3>
          <p className="text-2xl font-bold text-orange-600">{data.infracoes}</p>
          <p className="text-xs text-gray-500 mt-1">
            Seus depósitos bloqueados
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 bg-red-100 rounded-lg">
              <Percent className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            % de Infrações
          </h3>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-red-600">
                {formatPercent(data.percentualInfracoes.percentual)}
              </p>
              <span className="text-xs text-gray-500">/</span>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(data.percentualInfracoes.valorTotal)}
              </p>
            </div>
            <p className="text-xs text-gray-500">
              Percentual e valor de infrações sobre QR Codes pagos
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return embedded ? content : <Card className="p-6">{content}</Card>
}
