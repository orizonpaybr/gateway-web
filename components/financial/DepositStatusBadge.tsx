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
  WAITING_FOR_APPROVAL: {
    label: 'Aguardando aprovação',
    variant: 'warning',
  },
  REJECTED: { label: 'Rejeitado', variant: 'error' },
  CANCELLED: { label: 'Cancelado', variant: 'error' },
}

interface DepositStatusBadgeProps {
  status: string
  statusLegivel?: string
}

export const DepositStatusBadge = memo(
  ({ status, statusLegivel }: DepositStatusBadgeProps) => {
    const statusUpper = status.toUpperCase()
    const config = STATUS_MAP[statusUpper] || {
      label: statusLegivel || statusUpper.replace(/_/g, ' '),
      variant: 'default' as const,
    }

    return <Badge variant={config.variant}>{config.label}</Badge>
  },
)
