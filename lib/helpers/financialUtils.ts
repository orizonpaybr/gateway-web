import { format } from 'date-fns'

/**
 * Obtém classes CSS para badge de status financeiro
 * Padroniza as cores dos badges em todas as páginas de extrato
 */
export function getFinancialStatusBadgeClasses(status: string): string {
  const statusUpper = status.toUpperCase()

  switch (statusUpper) {
    case 'COMPLETED':
    case 'PAID_OUT':
    case 'PAGO':
    case 'CONCLUÍDA':
    case 'CONCLUIDA':
      return 'bg-green-100 text-green-700'
    case 'PENDING':
    case 'WAITING_FOR_APPROVAL':
    case 'PENDENTE':
    case 'AGUARDANDO':
      return 'bg-yellow-100 text-yellow-700'
    case 'CANCELLED':
    case 'CANCELED':
    case 'REJECTED':
    case 'CANCELADA':
    case 'REJEITADA':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
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
 * Formata descrição técnica da transação para exibição ao usuário (pt-BR).
 */
export function formatarDescricao(
  descricao: string,
  tipo?: 'deposito' | 'saque',
): string {
  if (!descricao?.trim()) {
    return tipo === 'deposito' ? 'Pagamento recebido' : 'Saque realizado'
  }
  const d = descricao.trim().toUpperCase()
  if (d === 'PERSONALIZADA_FIXA' || d === 'PERSONALIZADA FIXA') {
    return tipo === 'saque' ? 'Pagamento enviado' : 'Pagamento recebido'
  }
  if (d === 'AUTOMATICO' || d === 'AUTOMÁTICO') {
    return 'Saque automático'
  }
  if (d === 'MANUAL') {
    return 'Saque manual'
  }
  if (d === 'PAGAMENTO RECEBIDO') {
    return 'Pagamento recebido'
  }
  if (d === 'PAGAMENTO ENVIADO') {
    return 'Pagamento enviado'
  }
  return descricao
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
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
