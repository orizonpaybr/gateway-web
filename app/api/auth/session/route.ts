import { NextResponse } from 'next/server'
import {
  AUTH_2FA_PENDING_COOKIE,
  AUTH_TOKEN_COOKIE,
  authCookieOptions,
  expiredAuthCookieOptions,
} from '@/lib/auth-cookies-server'

interface SessionBody {
  token?: string
  pending2FA?: boolean
}

export async function POST(request: Request) {
  let body: SessionBody = {}

  try {
    body = (await request.json()) as SessionBody
  } catch {
    return NextResponse.json(
      { success: false, message: 'Corpo inválido' },
      { status: 400 },
    )
  }

  const response = NextResponse.json({ success: true })

  if (body.token) {
    response.cookies.set(AUTH_TOKEN_COOKIE, body.token, authCookieOptions())
    response.cookies.set(
      AUTH_2FA_PENDING_COOKIE,
      '',
      expiredAuthCookieOptions(),
    )
    return response
  }

  if (body.pending2FA) {
    response.cookies.set(AUTH_2FA_PENDING_COOKIE, '1', authCookieOptions())
    response.cookies.set(AUTH_TOKEN_COOKIE, '', expiredAuthCookieOptions())
    return response
  }

  return NextResponse.json(
    { success: false, message: 'Nenhuma ação de sessão informada' },
    { status: 400 },
  )
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(AUTH_TOKEN_COOKIE, '', expiredAuthCookieOptions())
  response.cookies.set(AUTH_2FA_PENDING_COOKIE, '', expiredAuthCookieOptions())
  return response
}
