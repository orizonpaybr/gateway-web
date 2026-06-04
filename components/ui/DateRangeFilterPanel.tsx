'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { type DateRange, DayPicker } from 'react-day-picker'
import { format, parse, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Button } from '@/components/ui/Button'
import 'react-day-picker/style.css'

/** Primeiro ano com dados na plataforma */
export const APP_DATA_START_YEAR = 2026

const minAppDate = new Date(APP_DATA_START_YEAR, 0, 1)

function parseYmd(s: string): Date | undefined {
  const t = s?.trim()
  if (!t) {
    return undefined
  }
  const parsed = parse(t, 'yyyy-MM-dd', new Date())
  return isValid(parsed) ? parsed : undefined
}

function formatDisplayDate(ymd: string): string {
  const d = parseYmd(ymd)
  if (!d) {
    return ''
  }
  return format(d, 'dd/MM/yyyy', { locale: ptBR })
}

function useTwoMonthCalendar(): boolean {
  const [twoMonths, setTwoMonths] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    const update = () => setTwoMonths(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return twoMonths
}

export const dateRangePopoverContainerClassName =
  'absolute z-20 top-11 -left-3 -right-3 min-w-0 w-auto max-w-none box-border sm:left-auto sm:right-0 sm:w-[min(44rem,calc(100vw-1rem))] sm:max-w-[min(44rem,calc(100vw-1rem))] bg-white border border-gray-200 rounded-xl shadow-lg px-2 py-3 sm:px-4 sm:py-4'

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
  const twoMonths = useTwoMonthCalendar()
  const today = useMemo(() => new Date(), [])
  const endMonth = useMemo(
    () => new Date(today.getFullYear() + 1, 11, 1),
    [today],
  )

  const selected: DateRange | undefined = useMemo(() => {
    const from = parseYmd(startDate)
    if (!from) {
      return undefined
    }
    const to = parseYmd(endDate) ?? from
    return { from, to: to < from ? from : to }
  }, [startDate, endDate])

  const [month, setMonth] = useState<Date>(() => {
    const from = parseYmd(startDate)
    if (from && from >= minAppDate) {
      return from
    }
    const now = new Date()
    return now < minAppDate ? minAppDate : now
  })

  useEffect(() => {
    const from = parseYmd(startDate)
    if (from && from >= minAppDate) {
      setMonth(from)
    }
  }, [startDate])

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
    setMonth(t < minAppDate ? minAppDate : t)
  }

  const handleAplicar = () => {
    const s = startDate.trim()
    if (!s) {
      return
    }
    const e = endDate.trim() || s
    onApply(s, e)
  }

  const rangeSummary = useMemo(() => {
    const s = startDate.trim()
    const e = endDate.trim()
    if (!s) {
      return 'Selecione a data inicial e a final no calendário'
    }
    if (!e || e === s) {
      return formatDisplayDate(s)
    }
    return `${formatDisplayDate(s)} — ${formatDisplayDate(e)}`
  }, [startDate, endDate])

  const dayPickerStyle = {
    ['--rdp-accent-color' as string]: '#101010',
    ['--rdp-accent-background-color' as string]: '#f3f4f6',
    ['--rdp-range_middle-background-color' as string]: '#f9fafb',
    ['--rdp-range_start-background' as string]:
      'linear-gradient(90deg, transparent 50%, #f9fafb 50%)',
    ['--rdp-range_end-background' as string]:
      'linear-gradient(270deg, transparent 50%, #f9fafb 50%)',
  } as CSSProperties

  return (
    <div className="date-range-filter-panel w-full max-w-full min-w-0">
      <p className="mb-2 text-center text-xs text-gray-600 px-1">{rangeSummary}</p>

      <div className="flex w-full min-w-0 justify-center overflow-x-auto">
        <DayPicker
          mode="range"
          locale={ptBR}
          captionLayout="dropdown-years"
          navLayout="around"
          numberOfMonths={twoMonths ? 2 : 1}
          pagedNavigation={twoMonths}
          startMonth={minAppDate}
          endMonth={endMonth}
          fromYear={APP_DATA_START_YEAR}
          toYear={today.getFullYear() + 1}
          reverseYears
          month={month}
          onMonthChange={setMonth}
          selected={selected}
          onSelect={handleSelect}
          showOutsideDays
          fixedWeeks
          disabled={{ before: minAppDate, after: today }}
          className="text-sm rdp-coratri"
          style={dayPickerStyle}
        />
      </div>

      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-100">
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
