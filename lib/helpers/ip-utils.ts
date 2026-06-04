const IPV4_OCTET = '(?:25[0-5]|2[0-4]\\d|1?\\d{1,2})'
const IPV4_PATTERN = `^${IPV4_OCTET}\\.${IPV4_OCTET}\\.${IPV4_OCTET}\\.${IPV4_OCTET}$`
const CIDR_PATTERN = `^${IPV4_OCTET}\\.${IPV4_OCTET}\\.${IPV4_OCTET}\\.${IPV4_OCTET}\\/(?:[0-9]|[1-2][0-9]|3[0-2])$`
const WILDCARD_PATTERN = `^(?:\\d{1,3}|\\*)\\.(?:\\d{1,3}|\\*)\\.(?:\\d{1,3}|\\*)\\.(?:\\d{1,3}|\\*)$`

export function isValidIPv4(ip: string): boolean {
  if (!new RegExp(IPV4_PATTERN).test(ip)) {
    return false
  }

  const parts = ip.split('.').map(Number)
  return parts.every((part) => part >= 0 && part <= 255)
}

/**
 * Valida entrada da allowlist: IPv4, CIDR (/0–/32) ou wildcard (192.168.1.*).
 */
export function isValidAllowedIP(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) {
    return false
  }

  if (trimmed.includes('/')) {
    return isValidCidr(trimmed)
  }

  if (trimmed.includes('*')) {
    return new RegExp(WILDCARD_PATTERN).test(trimmed)
  }

  return isValidIPv4(trimmed)
}

function isValidCidr(value: string): boolean {
  if (!new RegExp(CIDR_PATTERN).test(value)) {
    return false
  }

  const [address, prefix] = value.split('/')
  return isValidIPv4(address) && Number(prefix) >= 0 && Number(prefix) <= 32
}

/**
 * Permite dígitos, pontos e barra (CIDR) durante a digitação.
 */
export function sanitizeAllowedIPInput(value: string): string {
  return value.replace(/[^0-9./]/g, '').slice(0, 64)
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
