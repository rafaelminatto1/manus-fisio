import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // ✅ CORREÇÃO CRÍTICA: Permitir acesso completo aos arquivos PWA sem autenticação
  const publicPaths = [
    '/manifest.json',
    '/offline.html',
    '/sw.js',
    '/favicon.ico',
    '/favicon.svg'
  ]

  const isPublicFile = 
    publicPaths.includes(req.nextUrl.pathname) ||
    req.nextUrl.pathname.startsWith('/icons/') ||
    req.nextUrl.pathname.startsWith('/_next/') ||
    req.nextUrl.pathname.startsWith('/api/') ||
    req.nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)

  if (isPublicFile) {
    return res
  }
  
  // Modo desenvolvimento ou mock: permitir acesso livre
  const isMockMode = process.env.NODE_ENV === 'development' || 
                     !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                     !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                     process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

  if (isMockMode) {
    console.log('Middleware em modo mock - permitindo acesso', req.nextUrl.pathname)
    return res
  }

  try {
    // Para outras rotas, verificar autenticação apenas se Supabase estiver configurado
    const supabase = createMiddlewareClient({ req, res })

    // Verificar se há uma sessão válida
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Se não há sessão e está tentando acessar uma rota protegida
    if (!session && req.nextUrl.pathname !== '/auth/login') {
      // Redirecionar para login
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Se há sessão e está tentando acessar a página de login
    if (session && req.nextUrl.pathname === '/auth/login') {
      // Redirecionar para dashboard
      return NextResponse.redirect(new URL('/', req.url))
    }
  } catch (error) {
    // Em caso de erro, permitir acesso
    console.warn('Middleware auth error:', error)
    return res
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Simplificado: aplicar middleware apenas em rotas que não são arquivos estáticos
     */
    '/((?!_next|api|favicon.ico).*)',
  ],
}
