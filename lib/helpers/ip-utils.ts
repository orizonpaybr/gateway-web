export function isValidIPv4(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/

  if (!ipv4Regex.test(ip)) return false

  const parts = ip.split('.').map(Number)
  return parts.every((part) => part >= 0 && part <= 255)
}

/**
 * Aplicar máscara de IP enquanto usuário digita
 * Remove caracteres inválidos e limita a 4 octetos
 */
export function maskIPInput(value: string): string {
  // Remover tudo exceto números e pontos
  const cleaned = value.replace(/[^0-9.]/g, '')

  // Dividir em octetos
  const parts = cleaned.split('.')

  // Limitar a 4 octetos
  const limitedParts = parts.slice(0, 4)

  // Limitar cada octeto a 3 dígitos e máximo 255
  const maskedParts = limitedParts.map((part, index) => {
    // Limitar a 3 dígitos
    let limited = part.slice(0, 3)

    // Se valor > 255, truncar
    if (parseInt(limited) > 255) {
      limited = '255'
    }

    return limited
  })

  return maskedParts.join('.')
}

/**
 * Formatar IP removendo octetos vazios finais
 */
export function formatIP(value: string): string {
  const parts = value.split('.')
  const nonEmptyParts = parts.filter((p) => p.length > 0)
  return nonEmptyParts.join('.')
}

/**
 * Extrair IPs de texto (útil para colar múltiplos IPs)
 */
export function extractIPs(text: string): string[] {
  const ipv4Regex = /\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g
  const matches = text.match(ipv4Regex) || []
  return matches.filter(isValidIPv4)
}
