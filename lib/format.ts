// Utilitários centralizados de formatação (DRY)

export function formatCurrencyBRL(value: number, opts?: { hide?: boolean }) {
  if (opts?.hide) return '••••••'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number.isFinite(value) ? value : 0)
}

export function formatDateBR(input: string | Date) {
  const d = typeof input === 'string' ? new Date(input) : input
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export function formatTimeBR(input: string | Date) {
  const d = typeof input === 'string' ? new Date(input) : input
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function formatDateTimeBR(input: string | Date) {
  return `${formatDateBR(input)} ${formatTimeBR(input)}`
}

// Formatação simples de documento para exibição (CPF/CNPJ)
export function formatDocumentBR(doc: string) {
  const cleaned = (doc || '').replace(/[^\d]/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  if (cleaned.length === 14) {
    return cleaned.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5',
    )
  }
  return doc
}

export function formatCurrencyInput(value: string): string {
  if (!value || value === '') return ''
  const numericValue = value.replace(/\D/g, '')
  if (numericValue === '') return ''
  const floatValue = parseFloat(numericValue) / 100
  if (isNaN(floatValue)) return ''
  return floatValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function cleanCurrency(value: string): string {
  return value.replace(/\D/g, '')
}

export function parseCurrencyInput(value: string): number {
  const cleaned = cleanCurrency(value)
  return cleaned ? parseFloat(cleaned) : 0
}

export function centsToBRL(cents: number): number {
  return cents / 100
}
