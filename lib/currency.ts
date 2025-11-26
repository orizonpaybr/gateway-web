/**
 * Utilit\u00e1rios para manipula\u00e7\u00e3o de moeda (BRL)
 *
 * Conven\u00e7\u00f5es:
 * - Frontend usa "centavos" (string) para inputs mascarados
 * - Backend usa "reais" (number) para c\u00e1lculos
 *
 * @module lib/currency
 */

/**
 * Converte string de centavos (CurrencyInput) para valor em reais (number)
 *
 * @example
 * toReais("10000") => 100.00
 * toReais("500") => 5.00
 *
 * @param value - Valor em centavos (string do CurrencyInput)
 * @returns Valor em reais (number)
 */
export function toReais(value: string): number {
  const numeric = parseFloat(value || '0')
  if (Number.isNaN(numeric)) return 0
  return numeric / 100
}

/**
 * Converte valor em reais (number ou string) para string de centavos
 * Usado para popular o CurrencyInput com dados do backend
 *
 * @example
 * reaisToCentsString(100.50) => "10050"
 * reaisToCentsString("100.50") => "10050"
 *
 * @param value - Valor em reais (number ou string)
 * @returns String de centavos para o CurrencyInput
 */
export function reaisToCentsString(
  value: number | string | null | undefined,
): string {
  if (value === null || value === undefined) return '0'

  let numeric: number

  if (typeof value === 'number') {
    numeric = value
  } else {
    const parsed = parseFloat(value)
    numeric = Number.isNaN(parsed) ? 0 : parsed
  }

  return Math.round(numeric * 100).toString()
}

/**
 * Formata n\u00famero como moeda BRL
 *
 * @example
 * formatCurrency(1000.50) => "R$ 1.000,50"
 *
 * @param value - Valor num\u00e9rico em reais
 * @param options - Op\u00e7\u00f5es de formata\u00e7\u00e3o customizadas
 * @returns String formatada como moeda BRL
 */
export function formatCurrency(
  value: number,
  options?: Partial<Intl.NumberFormatOptions>,
): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(value)
}

/**
 * Formata n\u00famero como moeda BRL sem casas decimais
 * \u00datil para valores grandes onde centavos n\u00e3o s\u00e3o relevantes
 *
 * @example
 * formatCurrencyCompact(100000) => "R$ 100.000"
 *
 * @param value - Valor num\u00e9rico em reais
 * @returns String formatada como moeda BRL sem decimais
 */
export function formatCurrencyCompact(value: number): string {
  return formatCurrency(value, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

/**
 * Valida se um valor \u00e9 um n\u00famero v\u00e1lido e positivo
 *
 * @param value - Valor a ser validado
 * @returns true se v\u00e1lido, false caso contr\u00e1rio
 */
export function isValidCurrencyValue(value: unknown): boolean {
  if (typeof value === 'number') {
    return !Number.isNaN(value) && value >= 0
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return !Number.isNaN(parsed) && parsed >= 0
  }

  return false
}

/**
 * Parse seguro de valor monet\u00e1rio (evita NaN)
 *
 * @param value - Valor a ser parseado
 * @param defaultValue - Valor padr\u00e3o se parsing falhar
 * @returns N\u00famero v\u00e1lido ou valor padr\u00e3o
 */
export function parseCurrency(
  value: unknown,
  defaultValue: number = 0,
): number {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return Number.isNaN(parsed) ? defaultValue : parsed
  }

  return defaultValue
}
