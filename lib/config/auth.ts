export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

export const AUTH_TOKEN_COOKIE = 'auth_token'
export const AUTH_2FA_PENDING_COOKIE = 'auth_2fa_pending'
export const AUTH_COOKIE_MAX_AGE = 86400

export const TEMP_TOKEN_STORAGE_KEY = 'auth_temp_token'
export const TWO_FA_VERIFIED_KEY = '2fa_verified'
export const TWO_FA_SETUP_CHECKED_KEY = '2fa_setup_checked'
export const TWO_FA_SETUP_PENDING_KEY = 'auth_2fa_setup_pending'

export function mark2FASetupPending(): void {
  if (typeof sessionStorage === 'undefined') {
    return
  }
  sessionStorage.setItem(TWO_FA_SETUP_PENDING_KEY, '1')
}

export function clear2FASetupPending(): void {
  if (typeof sessionStorage === 'undefined') {
    return
  }
  sessionStorage.removeItem(TWO_FA_SETUP_PENDING_KEY)
}

export function has2FASetupPending(): boolean {
  if (typeof sessionStorage === 'undefined') {
    return false
  }
  return sessionStorage.getItem(TWO_FA_SETUP_PENDING_KEY) === '1'
}

export function persistTempToken(tempToken: string): void {
  if (typeof sessionStorage === 'undefined') {
    return
  }
  sessionStorage.setItem(TEMP_TOKEN_STORAGE_KEY, tempToken)
}

export function readTempToken(): string | null {
  if (typeof sessionStorage === 'undefined') {
    return null
  }
  return sessionStorage.getItem(TEMP_TOKEN_STORAGE_KEY)
}

export function clearTempToken(): void {
  if (typeof sessionStorage === 'undefined') {
    return
  }
  sessionStorage.removeItem(TEMP_TOKEN_STORAGE_KEY)
}

/** Detecta 2FA pendente via sessionStorage (cookies de sessão são HttpOnly). */
export function hasPending2FA(): boolean {
  return !!readTempToken()
}
