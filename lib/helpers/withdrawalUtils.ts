/**
 * Utilitários para gerenciamento de saques
 * Centraliza lógica reutilizável
 */

import { formatCurrencyBRL, formatDateBR, formatDateTimeBR } from '@/lib/format'

/**
 * Formata valor monetário para exibição
 */
export function formatWithdrawalValue(value: number): string {
  return formatCurrencyBRL(value)
}

/**
 * Formata data de saque para exibição
 */
export function formatWithdrawalDate(dateString: string): string {
  return formatDateBR(dateString)
}

/**
 * Formata data e hora completa para exibição
 */
export function formatWithdrawalDateTime(dateString: string): string {
  return formatDateTimeBR(dateString)
}

/**
 * Obtém classes CSS para badge de status
 */
export function getStatusBadgeClasses(status: string): string {
  const baseClasses = 'inline-flex px-2 py-1 text-xs font-medium rounded-full'

  if (status === 'COMPLETED' || status === 'PAID_OUT') {
    return `${baseClasses} bg-green-100 text-green-700`
  }
  if (status === 'PENDING') {
    return `${baseClasses} bg-yellow-100 text-yellow-700`
  }
  if (status === 'CANCELLED') {
    return `${baseClasses} bg-red-100 text-red-700`
  }
  return `${baseClasses} bg-gray-100 text-gray-700`
}

/**
 * Calcula range de datas baseado no período
 */
export function computeDateRange(
  period: 'hoje' | '7d' | '30d' | 'custom' | null,
  startDate?: string,
  endDate?: string,
): { data_inicio?: string; data_fim?: string } {
  if (!period) {
    return {}
  }

  const now = new Date()
  let data_inicio: string | undefined
  let data_fim: string | undefined

  if (period === 'hoje') {
    const today = now.toISOString().split('T')[0]
    data_inicio = today
    data_fim = today
  } else if (period === '7d') {
    const date = new Date(now)
    date.setDate(now.getDate() - 7)
    data_inicio = date.toISOString().split('T')[0]
    data_fim = now.toISOString().split('T')[0]
  } else if (period === '30d') {
    const date = new Date(now)
    date.setDate(now.getDate() - 30)
    data_inicio = date.toISOString().split('T')[0]
    data_fim = now.toISOString().split('T')[0]
  } else if (period === 'custom' && startDate && endDate) {
    data_inicio = startDate
    data_fim = endDate
  }

  return { data_inicio, data_fim }
}
