'use client'

import { memo, useState } from 'react'
import { Calendar, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DateRangeFilterPopover } from '@/components/ui/DateRangeFilterPanel'
import { Input } from '@/components/ui/Input'
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
  dynamicStatusByTipo?: boolean
}

export const FinancialFilters = memo(
  ({
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
    dynamicStatusByTipo = false,
  }: FinancialFiltersProps) => {
    const [showDatePicker, setShowDatePicker] = useState(false)

    const showStatusFilter =
      !dynamicStatusByTipo ||
      tipoFilter === 'deposito' ||
      tipoFilter === 'saque'

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
            placeholder="Buscar por cliente..."
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value)
              onPageReset()
            }}
            className="w-full sm:max-w-md"
          />
        </div>

        <div
          className={`grid grid-cols-1 gap-4 ${
            showStatusFilter && showTipoFilter ? 'md:grid-cols-2' : ''
          }`}
        >
          {showStatusFilter && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-600">Status</span>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={
                    statusFilter === 'PAID_OUT' ? 'inkSolid' : 'inkOutline'
                  }
                  size="sm"
                  onClick={() => handleStatusChange('PAID_OUT')}
                >
                  Pago
                </Button>
                {(!dynamicStatusByTipo || tipoFilter === 'deposito') && (
                  <Button
                    variant={
                      statusFilter === 'WAITING_FOR_APPROVAL'
                        ? 'inkSolid'
                        : 'inkOutline'
                    }
                    size="sm"
                    onClick={() =>
                      handleStatusChange('WAITING_FOR_APPROVAL')
                    }
                  >
                    Pendente
                  </Button>
                )}
                {dynamicStatusByTipo && tipoFilter === 'saque' && (
                  <>
                    <Button
                      variant={
                        statusFilter === 'FAILED' ? 'inkSolid' : 'inkOutline'
                      }
                      size="sm"
                      onClick={() => handleStatusChange('FAILED')}
                    >
                      Falhou
                    </Button>
                    <Button
                      variant={
                        statusFilter === 'CANCELLED'
                          ? 'inkSolid'
                          : 'inkOutline'
                      }
                      size="sm"
                      onClick={() => handleStatusChange('CANCELLED')}
                    >
                      Cancelado
                    </Button>
                  </>
                )}
                <Button
                  variant={statusFilter === 'all' ? 'inkSolid' : 'inkOutline'}
                  size="sm"
                  onClick={() => handleStatusChange('all')}
                >
                  Todos
                </Button>
              </div>
            </div>
          )}

          {showTipoFilter && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-600">Tipo</span>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={
                    tipoFilter === 'deposito' ? 'inkSolid' : 'inkOutline'
                  }
                  size="sm"
                  onClick={() => handleTipoChange('deposito')}
                >
                  Depósitos
                </Button>
                <Button
                  variant={tipoFilter === 'saque' ? 'inkSolid' : 'inkOutline'}
                  size="sm"
                  onClick={() => handleTipoChange('saque')}
                >
                  Saques
                </Button>
                <Button
                  variant={tipoFilter === 'all' ? 'inkSolid' : 'inkOutline'}
                  size="sm"
                  onClick={() => handleTipoChange('all')}
                >
                  Todos
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="w-full min-w-0 max-w-full space-y-2">
          <span className="text-xs font-semibold text-gray-600">Período</span>
          <div className="relative flex w-full min-w-0 max-w-full flex-wrap items-center gap-1.5 sm:gap-2">
            <Button
              variant={period === null ? 'inkSolid' : 'inkOutline'}
              size="sm"
              className="shrink-0 px-2.5 !text-xs sm:px-4 sm:!text-sm"
              onClick={() => handlePeriodChange(null)}
            >
              <span className="sm:hidden">Todas</span>
              <span className="hidden sm:inline">Todas Datas</span>
            </Button>
            <Button
              variant={period === 'hoje' ? 'inkSolid' : 'inkOutline'}
              size="sm"
              className="shrink-0 px-2.5 !text-xs sm:px-4 sm:!text-sm"
              onClick={() => handlePeriodChange('hoje')}
            >
              Hoje
            </Button>
            <Button
              variant={period === '7d' ? 'inkSolid' : 'inkOutline'}
              size="sm"
              className="shrink-0 px-2.5 !text-xs sm:px-4 sm:!text-sm"
              onClick={() => handlePeriodChange('7d')}
            >
              <span className="sm:hidden">7d</span>
              <span className="hidden sm:inline">7 dias</span>
            </Button>
            <Button
              variant={period === '30d' ? 'inkSolid' : 'inkOutline'}
              size="sm"
              className="shrink-0 px-2.5 !text-xs sm:px-4 sm:!text-sm"
              onClick={() => handlePeriodChange('30d')}
            >
              <span className="sm:hidden">30d</span>
              <span className="hidden sm:inline">30 dias</span>
            </Button>
            <Button
              variant={period === 'custom' ? 'inkSolid' : 'inkOutline'}
              size="sm"
              icon={<Calendar size={14} />}
              className="shrink-0 px-2.5 sm:px-4"
              aria-label="Período personalizado"
              onClick={() => setShowDatePicker((v) => !v)}
            />
            <Button
              variant="inkOutline"
              size="sm"
              icon={<RotateCcw size={14} />}
              className="shrink-0 px-2.5 sm:px-4"
              aria-label="Limpar filtros de data"
              onClick={resetDates}
            />

            <DateRangeFilterPopover
              open={showDatePicker}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={onStartDateChange}
              onEndDateChange={onEndDateChange}
              onApply={(s, e) => {
                onStartDateChange(s)
                onEndDateChange(e)
                onPeriodChange('custom')
                onPageReset()
                setShowDatePicker(false)
              }}
              onCancel={() => setShowDatePicker(false)}
            />
          </div>
        </div>
      </div>
    )
  },
)
