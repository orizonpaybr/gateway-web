'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Filter, Plus, Minus } from 'lucide-react'
import { useBalanceVisibility } from '@/contexts/BalanceVisibilityContext'
import { formatCurrencyBRL } from '@/lib/format'
import { useInteractiveMovement } from '@/hooks/useReactQuery'

interface TransactionChartProps {
  period?: 'hoje' | 'ontem' | '7dias' | '30dias'
  onPeriodChange?: (period: 'hoje' | 'ontem' | '7dias' | '30dias') => void
  embedded?: boolean
}

const periodLabels = {
  hoje: 'Hoje',
  ontem: 'Ontem',
  '7dias': '7 dias',
  '30dias': '30 dias',
}

export function TransactionChart({
  period = '30dias',
  onPeriodChange,
  embedded = false,
}: TransactionChartProps) {
  const [zoom, setZoom] = useState(100)
  const [showFilters, setShowFilters] = useState(false)
  const { isBalanceHidden } = useBalanceVisibility()

  // React Query hook para dados otimizados
  const {
    data: interactiveData,
    isLoading,
    error,
  } = useInteractiveMovement(period)

  // Memorizar dados processados
  const processedData = useMemo(() => {
    if (!interactiveData?.data) {
      return {
        chartData: [],
        cardData: {
          total_depositos: 0,
          qtd_depositos: 0,
          total_saques: 0,
          qtd_saques: 0,
        },
      }
    }

    return {
      chartData: interactiveData.data.chart || [],
      cardData: interactiveData.data.cards || {
        total_depositos: 0,
        qtd_depositos: 0,
        total_saques: 0,
        qtd_saques: 0,
      },
    }
  }, [interactiveData])

  // Memorizar handlers
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 10, 200))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 10, 50))
  }, [])

  const handlePeriodChange = useCallback(
    (newPeriod: 'hoje' | 'ontem' | '7dias' | '30dias') => {
      onPeriodChange?.(newPeriod)
    },
    [onPeriodChange],
  )

  const handleReset = useCallback(() => {
    setZoom(100)
    onPeriodChange?.('30dias')
  }, [onPeriodChange])

  const needsReset = zoom !== 100 || period !== '30dias'

  const formatCurrency = useCallback(
    (value: number) => formatCurrencyBRL(value, { hide: isBalanceHidden }),
    [isBalanceHidden],
  )

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const content = (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Movimentação Interativa
            </h2>
            <p className="text-sm text-gray-600">
              Depósitos e saques por período
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<Filter size={16} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
          </Button>
        </div>

        <div className="flex flex-wrap justify-end gap-1">
          {(Object.keys(periodLabels) as Array<keyof typeof periodLabels>).map(
            (key) => (
              <Button
                key={key}
                variant={period === key ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handlePeriodChange(key)}
                className="text-xs sm:text-sm whitespace-nowrap"
              >
                {periodLabels[key]}
              </Button>
            ),
          )}
        </div>

        <div className="flex flex-wrap justify-end items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2 text-sm text-gray-700">
            <span className="text-xs sm:text-sm">Zoom:</span>
            <Button
              variant="outline"
              size="sm"
              icon={<Minus size={14} />}
              onClick={handleZoomOut}
            />
            <span className="font-medium w-8 sm:w-12 text-center text-xs sm:text-sm">
              {zoom}%
            </span>
            <Button
              variant="outline"
              size="sm"
              icon={<Plus size={14} />}
              onClick={handleZoomIn}
            />
          </div>

          <Button
            variant={needsReset ? 'primary' : 'outline'}
            size="sm"
            onClick={handleReset}
            disabled={!needsReset}
            className="text-xs sm:text-sm"
          >
            Resetar
          </Button>
        </div>
      </div>

      <div className="w-full" style={{ height: zoom * 2.5 }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="space-y-3 w-full">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={processedData.chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="periodo"
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `R$ ${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '14px' }}
                iconType="circle"
                formatter={(value) =>
                  value === 'depositos' ? 'Depósitos' : 'Saques'
                }
              />
              <Line
                type="monotone"
                dataKey="depositos"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="saques"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-2">Total Depósitos</p>
              <p className="text-xl font-bold text-green-600 mb-1">
                {formatCurrency(processedData.cardData.total_depositos)}
              </p>
              <p className="text-xs text-gray-500">Valor em reais</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-2">Total Saques</p>
              <p className="text-xl font-bold text-red-600 mb-1">
                {formatCurrency(processedData.cardData.total_saques)}
              </p>
              <p className="text-xs text-gray-500">Valor em reais</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-2">Qtd Depósitos</p>
              <p className="text-xl font-bold text-gray-900 mb-1">
                {processedData.cardData.qtd_depositos}
              </p>
              <p className="text-xs text-gray-500">Transações</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-2">Qtd Saques</p>
              <p className="text-xl font-bold text-gray-900 mb-1">
                {processedData.cardData.qtd_saques}
              </p>
              <p className="text-xs text-gray-500">Transações</p>
            </div>
          </>
        )}
      </div>
    </div>
  )

  return embedded ? content : <Card>{content}</Card>
}
