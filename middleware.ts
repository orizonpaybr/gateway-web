import { NextResponse, type NextRequest } from 'next/server'
import {
  AUTH_2FA_PENDING_COOKIE,
  AUTH_TOKEN_COOKIE,
} from '@/lib/config/auth'

const publicRoutes = ['/login', '/cadastro', '/termos', '/']
const protectedRoutes = ['/dashboard']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value
  const pending2FA = request.cookies.get(AUTH_2FA_PENDING_COOKIE)?.value

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  )

  const canAccessProtected = Boolean(token || pending2FA)

  if (isProtectedRoute && !canAccessProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (
    publicRoutes.includes(pathname) &&
    token &&
    (pathname === '/login' || pathname === '/cadastro')
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
