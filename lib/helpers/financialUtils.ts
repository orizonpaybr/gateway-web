/**
 * Utilitários para gerenciamento financeiro
 * Centraliza lógica reutilizável
 */

import { format } from 'date-fns'

/**
 * Obtém classes CSS para badge de status financeiro
 */
export function getFinancialStatusBadgeClasses(status: string): string {
  const statusLower = status.toLowerCase()

  if (statusLower.includes('paid') || statusLower.includes('complete')) {
    return 'text-green-600 bg-green-50'
  }
  if (statusLower.includes('pending') || statusLower.includes('aguardando')) {
    return 'text-yellow-600 bg-yellow-50'
  }
  if (statusLower.includes('cancel') || statusLower.includes('reject')) {
    return 'text-red-600 bg-red-50'
  }
  return 'text-gray-600 bg-gray-50'
}

/**
 * Calcula range de datas baseado no período
 */
export function computeFinancialDateRange(
  period: 'hoje' | '7d' | '30d' | 'custom' | null,
  startDate?: string,
  endDate?: string,
): { data_inicio?: string; data_fim?: string } {
  if (!period) {
    return {}
  }

  const now = new Date()

  if (period === 'hoje') {
    const today = format(now, 'yyyy-MM-dd')
    return { data_inicio: today, data_fim: today }
  }

  if (period === '7d') {
    const seteDiasAtras = new Date(now)
    seteDiasAtras.setDate(now.getDate() - 7)
    return {
      data_inicio: format(seteDiasAtras, 'yyyy-MM-dd'),
      data_fim: format(now, 'yyyy-MM-dd'),
    }
  }

  if (period === '30d') {
    const trintaDiasAtras = new Date(now)
    trintaDiasAtras.setDate(now.getDate() - 30)
    return {
      data_inicio: format(trintaDiasAtras, 'yyyy-MM-dd'),
      data_fim: format(now, 'yyyy-MM-dd'),
    }
  }

  if (period === 'custom' && startDate && endDate) {
    return { data_inicio: startDate, data_fim: endDate }
  }

  return {}
}

/**
 * Formata tipo de transação para exibição
 */
export function formatTransactionType(tipo: string): string {
  return tipo === 'deposito' ? 'Depósito' : 'Saque'
}

/**
 * Formata data de transação para exibição
 */
export function formatTransactionDate(dateString: string): string {
  return format(new Date(dateString), 'dd/MM/yyyy HH:mm')
}

/**
 * Formata data e hora de transação para exibição completa
 */
export function formatTransactionDateTime(dateString: string): string {
  const date = new Date(dateString)
  return `${format(date, 'dd/MM/yyyy')} às ${format(date, 'HH:mm:ss')}`
}
