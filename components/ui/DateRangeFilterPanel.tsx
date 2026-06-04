'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { type DateRange, DayPicker } from 'react-day-picker'
import { format, parse, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Calendar, X } from 'lucide-react'
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

export const dateRangePopoverContainerClassName =
  'absolute z-20 top-full mt-2 left-0 w-[18.25rem] max-w-[calc(100vw-1.25rem)] sm:left-auto sm:right-0'

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

  const dayPickerStyle = {
    ['--rdp-accent-color' as string]: '#101010',
    ['--rdp-accent-background-color' as string]: '#f3f4f6',
    ['--rdp-range_middle-background-color' as string]: '#f3f4f6',
    ['--rdp-range_start-background' as string]:
      'linear-gradient(90deg, transparent 50%, #f3f4f6 50%)',
    ['--rdp-range_end-background' as string]:
      'linear-gradient(270deg, transparent 50%, #f3f4f6 50%)',
  } as CSSProperties

  const startLabel = formatDisplayDate(startDate) || 'dd/mm/aaaa'
  const endLabel = formatDisplayDate(endDate) || 'dd/mm/aaaa'
  const selectingEnd = Boolean(startDate.trim() && !endDate.trim())

  return (
    <div className="date-range-filter-panel flex w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/5">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
          <p className="truncate text-sm font-medium text-gray-900">
            Período personalizado
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          aria-label="Fechar calendário"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 border-b border-gray-100 px-3 py-2.5">
        <div
          className={`rounded-lg border px-2.5 py-2 ${
            !startDate.trim()
              ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900/10'
              : 'border-gray-200 bg-white'
          }`}
        >
          <span className="block text-[10px] font-medium uppercase tracking-wide text-gray-500">
            Início
          </span>
          <span className="mt-0.5 block truncate text-sm font-medium text-gray-900">
            {startLabel}
          </span>
        </div>
        <div
          className={`rounded-lg border px-2.5 py-2 ${
            selectingEnd
              ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900/10'
              : 'border-gray-200 bg-white'
          }`}
        >
          <span className="block text-[10px] font-medium uppercase tracking-wide text-gray-500">
            Fim
          </span>
          <span className="mt-0.5 block truncate text-sm font-medium text-gray-900">
            {endLabel}
          </span>
        </div>
      </div>

      <p className="px-3 pt-2 text-center text-[11px] text-gray-500">
        {selectingEnd
          ? 'Selecione a data final'
          : startDate.trim()
            ? 'Ajuste as datas no calendário ou navegue pelos meses'
            : 'Selecione a data inicial no calendário'}
      </p>

      <div className="flex justify-center px-2 pb-1 pt-1">
        <DayPicker
          mode="range"
          locale={ptBR}
          captionLayout="dropdown"
          numberOfMonths={1}
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
          className="text-sm rdp-coratri rdp-coratri-popup"
          style={dayPickerStyle}
        />
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-3 py-2">
        <button
          type="button"
          className="min-h-9 touch-manipulation px-1 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline"
          onClick={handleLimpar}
        >
          Limpar
        </button>
        <button
          type="button"
          className="min-h-9 touch-manipulation px-1 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline"
          onClick={handleHoje}
        >
          Hoje
        </button>
      </div>

      <div className="flex gap-2 border-t border-gray-100 px-3 py-2.5">
        <Button
          variant="inkOutline"
          size="sm"
          type="button"
          onClick={onCancel}
          className="min-h-10 flex-1 touch-manipulation !px-3 !py-2 !text-xs sm:!text-sm"
        >
          Cancelar
        </Button>
        <Button
          variant="inkSolid"
          size="sm"
          type="button"
          onClick={handleAplicar}
          disabled={!startDate.trim()}
          className="min-h-10 flex-1 touch-manipulation !px-3 !py-2 !text-xs sm:!text-sm"
        >
          Aplicar
        </Button>
      </div>
    </div>
  )
}

type DateRangeFilterPopoverProps = DateRangeFilterPanelProps & {
  open: boolean
}

/** Pop-up flutuante (fecha ao clicar fora). */
export function DateRangeFilterPopover({
  open,
  onCancel,
  ...panelProps
}: DateRangeFilterPopoverProps) {
  if (!open) {
    return null
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[15]"
        aria-hidden
        onClick={onCancel}
      />
      <div className={dateRangePopoverContainerClassName}>
        <DateRangeFilterPanel onCancel={onCancel} {...panelProps} />
      </div>
    </>
  )
}
