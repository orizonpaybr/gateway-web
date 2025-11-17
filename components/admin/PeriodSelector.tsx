'use client'

import { Select } from '@/components/ui/Select'

interface PeriodSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function PeriodSelector({
  value,
  onChange,
  className,
}: PeriodSelectorProps) {
  const periods = [
    { value: 'hoje', label: 'Hoje' },
    { value: 'ontem', label: 'Ontem' },
    { value: '7dias', label: 'Últimos 7 dias' },
    { value: '30dias', label: 'Últimos 30 dias' },
    { value: 'mes_atual', label: 'Mês atual' },
    { value: 'mes_anterior', label: 'Mês anterior' },
    { value: 'total', label: 'Todo o período' },
  ]

  return (
    <Select
      value={value}
      onChange={onChange}
      options={periods.map((p) => ({ value: p.value, label: p.label }))}
      placeholder="Selecione o período"
      className={className}
    />
  )
}
