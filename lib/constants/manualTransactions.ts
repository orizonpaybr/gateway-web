export const CURRENCY_CENTS_DIVISOR = 100

/**
 * Valores rápidos para seleção no formulário de depósito
 */
export const QUICK_DEPOSIT_AMOUNTS = [
  { label: 'R$ 100', value: 10000 },
  { label: 'R$ 250', value: 25000 },
  { label: 'R$ 500', value: 50000 },
  { label: 'R$ 1.000', value: 100000 },
  { label: 'R$ 2.000', value: 200000 },
] as const

/**
 * Valores rápidos para seleção no formulário de saque
 */
export const QUICK_WITHDRAWAL_AMOUNTS = [
  { label: 'R$ 50', value: 5000 },
  { label: 'R$ 100', value: 10000 },
  { label: 'R$ 200', value: 20000 },
  { label: 'R$ 500', value: 50000 },
  { label: 'R$ 1.000', value: 100000 },
  { label: 'R$ 2.000', value: 200000 },
] as const

/**
 * Configurações de paginação para lista de depósitos recentes
 */
export const DEPOSITS_LIST_CONFIG = {
  perPage: 5,
  defaultStatus: 'all' as const,
} as const

/**
 * Configurações de paginação para lista de saques recentes
 */
export const WITHDRAWALS_LIST_CONFIG = {
  perPage: 5,
  defaultStatus: 'all' as const,
} as const

/**
 * Debounce delays (em ms)
 */
export const DEBOUNCE_DELAYS = {
  userSearch: 400,
  depositsSearch: 400,
  withdrawalsSearch: 400,
} as const

/**
 * Configurações do modal
 */
export const MODAL_CONFIG = {
  userSearchLimit: 50,
} as const
