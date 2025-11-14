/**
 * Utilitários para integração com WhatsApp
 */

/**
 * Limpa número de telefone removendo caracteres não numéricos
 */
export function cleanPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return ''
  return phone.replace(/\D/g, '')
}

/**
 * Gera URL do WhatsApp para um número de telefone
 * @param phone - Número de telefone (pode conter formatação)
 * @returns URL do WhatsApp ou null se telefone inválido
 */
export function getWhatsAppUrl(
  phone: string | null | undefined,
): string | null {
  const cleaned = cleanPhoneNumber(phone)
  if (!cleaned || cleaned.length < 10) {
    return null
  }
  return `https://wa.me/${cleaned}`
}

/**
 * Abre WhatsApp em nova aba
 * @param phone - Número de telefone
 * @returns true se abriu com sucesso, false caso contrário
 */
export function openWhatsApp(phone: string | null | undefined): boolean {
  const url = getWhatsAppUrl(phone)
  if (!url) {
    return false
  }
  window.open(url, '_blank', 'noopener,noreferrer')
  return true
}
