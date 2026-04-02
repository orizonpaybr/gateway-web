'use client'

import { useMemo, useState, type CSSProperties } from 'react'
import { type DateRange, DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Button } from '@/components/ui/Button'
import 'react-day-picker/style.css'

const currentYear = () => new Date().getFullYear()

function parseYmd(s: string): Date | undefined {
  const t = s?.trim()
  if (!t) {
    return undefined
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t)
  if (!m) {
    return undefined
  }
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) {
    return undefined
  }
  return new Date(y, mo - 1, d)
}

export const dateRangePopoverContainerClassName =
  'absolute z-20 top-11 -left-3 -right-3 min-w-0 w-auto max-w-none box-border sm:left-auto sm:right-0 sm:w-[min(22.5rem,calc(100vw-1.5rem))] sm:max-w-[min(22.5rem,calc(100vw-1.5rem))] bg-white border border-gray-200 rounded-lg shadow-md px-1.5 py-2 sm:p-3 sm:shadow-lg'

export type DateRangeFilterPanelProps = {
  startDate: string
  endDate: string
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  /** Chamado com intervalo normalizado (fim = início se só um dia). */
  onApply: (start: string, end: string) => void
  onCancel: () => void
}

export function DateRangeFilterPanel({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
  onCancel,
}: DateRangeFilterPanelProps) {
  const selected: DateRange | undefined = useMemo(() => {
    const from = parseYmd(startDate)
    if (!from) {
      return undefined
    }
    const to = parseYmd(endDate) ?? from
    return { from, to }
  }, [startDate, endDate])

  const [month, setMonth] = useState<Date>(() => selected?.from ?? new Date())

  const handleSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      onStartDateChange('')
      onEndDateChange('')
      return
    }
    onStartDateChange(format(range.from, 'yyyy-MM-dd'))
    onEndDateChange(range.to ? format(range.to, 'yyyy-MM-dd') : '')
  }

  const handleLimpar = () => {
    onStartDateChange('')
    onEndDateChange('')
  }

  const handleHoje = () => {
    const t = new Date()
    const s = format(t, 'yyyy-MM-dd')
    onStartDateChange(s)
    onEndDateChange(s)
    setMonth(t)
  }

  const handleAplicar = () => {
    const s = startDate.trim()
    if (!s) {
      return
    }
    const e = endDate.trim() || s
    onApply(s, e)
  }

  const { fromYear, toYear } = useMemo(
    () => ({
      fromYear: currentYear() - 20,
      toYear: currentYear() + 3,
    }),
    [],
  )

  const rangeMinimalVars = {
    ['--rdp-accent-background-color' as string]: 'transparent',
    ['--rdp-range_middle-background-color' as string]: 'transparent',
    ['--rdp-range_start-background' as string]: 'none',
    ['--rdp-range_end-background' as string]: 'none',
  } as CSSProperties

  return (
    <div className="date-range-filter-panel w-full max-w-full min-w-0">
      <div className="flex w-full min-w-0 justify-center">
        <DayPicker
          mode="range"
          locale={ptBR}
          captionLayout="dropdown"
          hideNavigation
          reverseYears
          fromYear={fromYear}
          toYear={toYear}
          month={month}
          onMonthChange={setMonth}
          selected={selected}
          onSelect={handleSelect}
          numberOfMonths={1}
          showOutsideDays
          className="text-sm rdp-coratri"
          style={
            {
              ['--rdp-accent-color' as string]: '#101010',
              ...rangeMinimalVars,
            } as CSSProperties
          }
        />
      </div>

      <div className="flex items-center justify-between gap-2 mt-1 pt-2 border-t border-gray-100">
        <button
          type="button"
          className="min-h-9 touch-manipulation px-1 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline sm:min-h-0"
          onClick={handleLimpar}
        >
          Limpar
        </button>
        <button
          type="button"
          className="min-h-9 touch-manipulation px-1 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline sm:min-h-0"
          onClick={handleHoje}
        >
          Hoje
        </button>
      </div>

      <div className="flex w-full gap-1.5 pt-2 max-sm:gap-2 sm:justify-end sm:gap-2 sm:pt-3">
        <Button
          variant="inkOutline"
          size="sm"
          type="button"
          onClick={onCancel}
          className="max-sm:min-h-9 max-sm:flex-1 max-sm:!px-3 max-sm:!py-2 max-sm:!text-xs min-h-10 flex-1 touch-manipulation sm:min-h-0 sm:flex-initial sm:!px-4 sm:!py-2 sm:!text-sm sm:min-w-[5.5rem]"
        >
          Cancelar
        </Button>
        <Button
          variant="inkSolid"
          size="sm"
          type="button"
          onClick={handleAplicar}
          disabled={!startDate.trim()}
          className="max-sm:min-h-9 max-sm:flex-1 max-sm:!px-3 max-sm:!py-2 max-sm:!text-xs min-h-10 flex-1 touch-manipulation sm:min-h-0 sm:flex-initial sm:!px-4 sm:!py-2 sm:!text-sm sm:min-w-[5.5rem]"
        >
          Aplicar
        </Button>
      </div>
    </div>
  )
}
