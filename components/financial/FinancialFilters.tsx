'use client'

import { memo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Calendar, RotateCcw } from 'lucide-react'
import { createResetDatesHandler } from '@/lib/dateUtils'

export interface FinancialFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  tipoFilter?: string
  onTipoFilterChange?: (value: string) => void
  period: 'hoje' | '7d' | '30d' | 'custom' | null
  onPeriodChange: (value: 'hoje' | '7d' | '30d' | 'custom' | null) => void
  startDate: string
  endDate: string
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onPageReset: () => void
  showTipoFilter?: boolean
}

export const FinancialFilters = memo(function FinancialFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  tipoFilter,
  onTipoFilterChange,
  period,
  onPeriodChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onPageReset,
  showTipoFilter = false,
}: FinancialFiltersProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)

  const resetDates = createResetDatesHandler(
    onStartDateChange,
    onEndDateChange,
    setShowDatePicker,
    onPeriodChange,
    onPageReset,
  )

  const handleStatusChange = (value: string) => {
    onStatusFilterChange(value)
    onPageReset()
  }

  const handleTipoChange = (value: string) => {
    if (onTipoFilterChange) {
      onTipoFilterChange(value)
      onPageReset()
    }
  }

  const handlePeriodChange = (
    value: 'hoje' | '7d' | '30d' | 'custom' | null,
  ) => {
    onPeriodChange(value)
    onStartDateChange('')
    onEndDateChange('')
    onPageReset()
  }

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center gap-2">
        <Input
          placeholder="Buscar por cliente, transação..."
          value={search}
          onChange={(e) => {
            onSearchChange(e.target.value)
            onPageReset()
          }}
          className="w-full sm:max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <span className="text-xs font-semibold text-gray-600">Status</span>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={statusFilter === 'PAID_OUT' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange('PAID_OUT')}
            >
              Pago
            </Button>
            <Button
              variant={
                statusFilter === 'WAITING_FOR_APPROVAL' ? 'primary' : 'outline'
              }
              size="sm"
              onClick={() => handleStatusChange('WAITING_FOR_APPROVAL')}
            >
              Aguardando
            </Button>
            <Button
              variant={statusFilter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange('all')}
            >
              Todos
            </Button>
          </div>
        </div>

        {showTipoFilter && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-600">Tipo</span>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={tipoFilter === 'deposito' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleTipoChange('deposito')}
              >
                Depósitos
              </Button>
              <Button
                variant={tipoFilter === 'saque' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleTipoChange('saque')}
              >
                Saques
              </Button>
              <Button
                variant={tipoFilter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleTipoChange('all')}
              >
                Todos
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="relative flex flex-wrap items-center gap-2">
        <Button
          variant={period === null ? 'primary' : 'outline'}
          size="sm"
          className="shrink-0"
          onClick={() => handlePeriodChange(null)}
        >
          Todas Datas
        </Button>
        <Button
          variant={period === 'hoje' ? 'primary' : 'outline'}
          size="sm"
          className="shrink-0"
          onClick={() => handlePeriodChange('hoje')}
        >
          Hoje
        </Button>
        <Button
          variant={period === '7d' ? 'primary' : 'outline'}
          size="sm"
          className="shrink-0"
          onClick={() => handlePeriodChange('7d')}
        >
          7 dias
        </Button>
        <Button
          variant={period === '30d' ? 'primary' : 'outline'}
          size="sm"
          className="shrink-0"
          onClick={() => handlePeriodChange('30d')}
        >
          30 dias
        </Button>
        <Button
          variant={period === 'custom' ? 'primary' : 'outline'}
          size="sm"
          icon={<Calendar size={14} />}
          className="shrink-0"
          onClick={() => setShowDatePicker((v) => !v)}
        />
        <Button
          variant="outline"
          size="sm"
          icon={<RotateCcw size={14} />}
          className="shrink-0"
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
                  onChange={(e) => onStartDateChange(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Data final
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
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
                    onPeriodChange('custom')
                    onPageReset()
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
  )
})
