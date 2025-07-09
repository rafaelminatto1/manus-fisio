import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Skip middleware for auth callback route
  if (request.nextUrl.pathname === '/auth/callback') {
    return response
  }
  
  // Modo desenvolvimento ou mock: permitir acesso livre
  const isMockMode = process.env.NODE_ENV === 'development' || 
                     !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                     !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                     process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

  if (isMockMode) {
    console.log('Middleware em modo mock - permitindo acesso', request.nextUrl.pathname)
    return response
  }

  try {
    // Verificar se há uma sessão válida
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Se não há sessão e está tentando acessar uma rota protegida
    if (!session && request.nextUrl.pathname !== '/auth/login') {
      // Redirecionar para login
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Se há sessão e está tentando acessar a página de login
    if (session && request.nextUrl.pathname === '/auth/login') {
      // Redirecionar para dashboard
      return NextResponse.redirect(new URL('/', request.url))
    }
  } catch (error) {
    // Em caso de erro, permitir acesso
    console.warn('Middleware auth error:', error)
    return response
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - sw.js (service worker)
     * - icons/ (PWA icons)
     * - .png, .jpg, .svg, .ico files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|manifest.webmanifest|sw.js|icons|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)',
  ],
}
