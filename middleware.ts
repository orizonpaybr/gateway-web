import { NextResponse, type NextRequest } from 'next/server'

// Rotas públicas que não precisam de autenticação
const _publicRoutes = ['/login', '/cadastro', '/']

// Rotas protegidas que precisam de autenticação
const protectedRoutes = ['/dashboard']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar se é uma rota protegida
  const _isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  )

  // TODO: Quando a API estiver integrada, verificar o token aqui
  // const token = request.cookies.get('token')?.value

  // Se for uma rota protegida e não houver token, redirecionar para login
  // if (isProtectedRoute && !token) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }

  // Se estiver autenticado e tentar acessar login/cadastro, redirecionar para dashboard
  // if (publicRoutes.includes(pathname) && token && pathname !== '/') {
  //   return NextResponse.redirect(new URL('/dashboard', request.url))
  // }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
