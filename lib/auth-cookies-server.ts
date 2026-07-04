import {
  AUTH_2FA_PENDING_COOKIE,
  AUTH_COOKIE_MAX_AGE,
  AUTH_TOKEN_COOKIE,
} from '@/lib/config/auth'

export function authCookieOptions(maxAge = AUTH_COOKIE_MAX_AGE) {
  const isProduction = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

export function expiredAuthCookieOptions() {
  return {
    ...authCookieOptions(0),
    maxAge: 0,
  }
}

export { AUTH_TOKEN_COOKIE, AUTH_2FA_PENDING_COOKIE }
