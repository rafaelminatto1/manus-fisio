import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Permitir acesso público aos endpoints MCP
  if (req.nextUrl.pathname.startsWith('/api/mcp/')) {
    return res
  }

  // Permitir acesso público aos endpoints de API de saúde
  if (req.nextUrl.pathname.startsWith('/api/health')) {
    return res
  }

  // Permitir acesso público aos endpoints de autenticação
  if (req.nextUrl.pathname.startsWith('/api/auth/')) {
    return res
  }

  // Permitir acesso público aos endpoints de AI
  if (req.nextUrl.pathname.startsWith('/api/ai/')) {
    return res
  }

  // Para outras rotas, verificar autenticação
  const supabase = createMiddlewareClient({ req, res })

  // Verificar se há uma sessão válida
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Se não há sessão e está tentando acessar uma rota protegida
  if (!session && req.nextUrl.pathname !== '/auth/login' && !req.nextUrl.pathname.startsWith('/api/')) {
    // Redirecionar para login
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // Se há sessão e está tentando acessar a página de login
  if (session && req.nextUrl.pathname === '/auth/login') {
    // Redirecionar para dashboard
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 