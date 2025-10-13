'use client'

import { useState, useEffect } from 'react'
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
import { Filter } from 'lucide-react'
import { dashboardAPI } from '@/lib/api'

interface TransactionChartProps {
  period?: 'hoje' | 'ontem' | '7dias' | '30dias'
  onPeriodChange?: (period: 'hoje' | 'ontem' | '7dias' | '30dias') => void
  embedded?: boolean
}

interface ChartData {
  periodo: string
  depositos: number
  saques: number
}

interface CardData {
  total_depositos: number
  qtd_depositos: number
  total_saques: number
  qtd_saques: number
}

const periodLabels = {
  hoje: 'Hoje',
  ontem: 'Ontem',
  '7dias': '7 dias',
  '30dias': '30 dias',
}

export function TransactionChart({
  period = 'hoje',
  onPeriodChange,
  embedded = false,
}: TransactionChartProps) {
  const [zoom, setZoom] = useState(100)
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [cardData, setCardData] = useState<CardData>({
    total_depositos: 0,
    qtd_depositos: 0,
    total_saques: 0,
    qtd_saques: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
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
        const response = await dashboardAPI.getInteractiveMovement(period)
        if (response.success) {
          setChartData(response.data.chart)
          setCardData(response.data.cards)
        }
      } catch (error) {
        console.error('Erro ao buscar dados da movimentação:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const handleAuthTokenStored = () => {
      fetchData()
    }

    window.addEventListener('auth-token-stored', handleAuthTokenStored)

    const rawToken = localStorage.getItem('token')
    const token =
      rawToken === 'null' || rawToken === null || rawToken === ''
        ? null
        : rawToken
    if (token) {
      fetchData()
    } else {
      setIsLoading(false)
    }

    return () => {
      window.removeEventListener('auth-token-stored', handleAuthTokenStored)
    }
  }, [period])

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50))
  }

  const handleReset = () => {
    setZoom(100)
    onPeriodChange?.('hoje')
  }

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`
  }

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
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Movimentação Interativa
          </h2>
          <p className="text-sm text-gray-600">
            Depósitos e saques por período
          </p>
        </div>

        <div className="flex justify-end">
          <div className="flex items-center gap-1">
            {(
              Object.keys(periodLabels) as Array<keyof typeof periodLabels>
            ).map((key) => (
              <Button
                key={key}
                variant={period === key ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onPeriodChange?.(key)}
              >
                {periodLabels[key]}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-end items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            icon={<Filter size={16} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
          </Button>

          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>Zoom:</span>
            <span className="font-medium">{zoom}%</span>
          </div>

          <Button variant="primary" size="sm" onClick={handleReset}>
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
              data={chartData}
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
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
                {formatCurrency(cardData.total_depositos)}
              </p>
              <p className="text-xs text-gray-500">Valor em reais</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-2">Total Saques</p>
              <p className="text-xl font-bold text-red-600 mb-1">
                {formatCurrency(cardData.total_saques)}
              </p>
              <p className="text-xs text-gray-500">Valor em reais</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-2">Qtd Depósitos</p>
              <p className="text-xl font-bold text-gray-900 mb-1">
                {cardData.qtd_depositos}
              </p>
              <p className="text-xs text-gray-500">Transações</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-2">Qtd Saques</p>
              <p className="text-xl font-bold text-gray-900 mb-1">
                {cardData.qtd_saques}
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
