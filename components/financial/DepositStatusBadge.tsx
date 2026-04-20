'use client'

import { memo } from 'react'
import { Badge } from '@/components/ui/Badge'
interface StatusConfig {
  label: string
  variant: 'default' | 'success' | 'warning' | 'error'
}

const STATUS_MAP: Record<string, StatusConfig> = {
  PAID_OUT: { label: 'Pago', variant: 'success' },
  COMPLETED: { label: 'Completo', variant: 'success' },
  APPROVED: { label: 'Aprovado', variant: 'success' },
  PENDING: { label: 'Pendente', variant: 'warning' },
  WAITING_FOR_APPROVAL: { label: 'Pendente', variant: 'warning' },
  NEW: { label: 'Pendente', variant: 'warning' },
  CREATED: { label: 'Pendente', variant: 'warning' },
  REJECTED: { label: 'Rejeitado', variant: 'error' },
  CANCELLED: { label: 'Cancelado', variant: 'error' },
  REFUNDED: { label: 'Estornado', variant: 'default' },
  PARTIALLY_REFUNDED: { label: 'Estorno parcial', variant: 'default' },
}

interface DepositStatusBadgeProps {
  status: string
  statusLegivel?: string
}

function resolvePendenteVariant(
  statusUpper: string,
  label: string,
  base: StatusConfig['variant'],
): StatusConfig['variant'] {
  if (base !== 'default') {
    return base
  }
  if (label.trim().toLowerCase() === 'pendente') {
    return 'warning'
  }
  // Status não mapeado que ainda assim costuma ser pendente no fluxo de depósito
  const pendentes = new Set([
    'WAITING_FOR_APPROVAL',
    'PENDING',
    'NEW',
    'CREATED',
  ])
  if (pendentes.has(statusUpper)) {
    return 'warning'
  }
  return base
}

export const DepositStatusBadge = memo(
  ({ status, statusLegivel }: DepositStatusBadgeProps) => {
    const statusUpper = String(status ?? '')
      .trim()
      .toUpperCase()
    const config = STATUS_MAP[statusUpper] || {
      label: statusLegivel || statusUpper.replace(/_/g, ' '),
      variant: 'default' as const,
    }

    const variant = resolvePendenteVariant(
      statusUpper,
      config.label,
      config.variant,
    )

    return (
      <Badge
        variant={variant}
        className={
          variant === 'warning'
            ? '!bg-amber-100 !text-amber-900 ring-1 ring-inset ring-amber-300/70'
            : undefined
        }
      >
        {config.label}
      </Badge>
    )
  },
)
