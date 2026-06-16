const IPV4_OCTET = '(?:25[0-5]|2[0-4]\\d|1?\\d{1,2})'
const IPV4_PATTERN = `^${IPV4_OCTET}\\.${IPV4_OCTET}\\.${IPV4_OCTET}\\.${IPV4_OCTET}$`
const CIDR_V4_PATTERN = `^${IPV4_OCTET}\\.${IPV4_OCTET}\\.${IPV4_OCTET}\\.${IPV4_OCTET}\\/(?:[0-9]|[1-2][0-9]|3[0-2])$`
const WILDCARD_PATTERN = `^(?:\\d{1,3}|\\*)\\.(?:\\d{1,3}|\\*)\\.(?:\\d{1,3}|\\*)\\.(?:\\d{1,3}|\\*)$`

export function isValidIPv4(ip: string): boolean {
  if (!new RegExp(IPV4_PATTERN).test(ip)) {
    return false
  }

  const parts = ip.split('.').map(Number)
  return parts.every((part) => part >= 0 && part <= 255)
}

/**
 * Valida IPv6 (inclui formas comprimidas com ::).
 * Usa URL nativa — disponível nos browsers alvo do dashboard.
 */
export function isValidIPv6(ip: string): boolean {
  const trimmed = ip.trim()
  if (!trimmed.includes(':')) {
    return false
  }

  try {
    const url = new URL(`http://[${trimmed}]/`)
    return url.hostname.includes(':')
  } catch {
    return false
  }
}

function isValidCidrV4(value: string): boolean {
  if (!new RegExp(CIDR_V4_PATTERN).test(value)) {
    return false
  }

  const [address, prefix] = value.split('/')
  return isValidIPv4(address) && Number(prefix) >= 0 && Number(prefix) <= 32
}

function isValidCidrV6(value: string): boolean {
  const slash = value.indexOf('/')
  if (slash <= 0) {
    return false
  }

  const address = value.slice(0, slash)
  const prefix = value.slice(slash + 1)
  if (!/^\d+$/.test(prefix)) {
    return false
  }

  const mask = Number(prefix)
  return mask >= 0 && mask <= 128 && isValidIPv6(address)
}

/**
 * Valida entrada da allowlist: IPv4, IPv6, CIDR (/0–/32 ou /0–/128) ou wildcard IPv4.
 */
export function isValidAllowedIP(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) {
    return false
  }

  if (trimmed.includes('/')) {
    return isValidCidrV4(trimmed) || isValidCidrV6(trimmed)
  }

  if (trimmed.includes('*')) {
    return new RegExp(WILDCARD_PATTERN).test(trimmed)
  }

  return isValidIPv4(trimmed) || isValidIPv6(trimmed)
}

/**
 * Permite dígitos, pontos, dois-pontos, letras hex (IPv6) e barra (CIDR) durante a digitação.
 */
export function sanitizeAllowedIPInput(value: string): string {
  return value.replace(/[^0-9a-fA-F:./]/g, '').slice(0, 64)
}

/**
 * @deprecated Use sanitizeAllowedIPInput para allowlist com CIDR.
 */
export function maskIPInput(value: string): string {
  const cleaned = value.replace(/[^0-9.]/g, '')
  const parts = cleaned.split('.')
  const limitedParts = parts.slice(0, 4)

  const maskedParts = limitedParts.map((part) => {
    let limited = part.slice(0, 3)
    if (parseInt(limited, 10) > 255) {
      limited = '255'
    }
    return limited
  })

  return maskedParts.join('.')
}

export function formatIP(value: string): string {
  const parts = value.split('.')
  const nonEmptyParts = parts.filter((p) => p.length > 0)
  return nonEmptyParts.join('.')
}

export function extractIPs(text: string): string[] {
  const ipv4Regex = /\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g
  const matches = text.match(ipv4Regex) || []
  return matches.filter(isValidIPv4)
}
