import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Allow access to static files and public resources
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.includes('.') || // Files with extensions (.json, .png, .ico, etc.)
    request.nextUrl.pathname === '/manifest.json' ||
    request.nextUrl.pathname.startsWith('/icons/') ||
    request.nextUrl.pathname === '/favicon.ico' ||
    request.nextUrl.pathname === '/favicon.svg' ||
    request.nextUrl.pathname.startsWith('/sw.js') ||
    request.nextUrl.pathname.startsWith('/workbox-')
  ) {
    return response
  }

  // Allow access to public routes (for testing and landing page)
  if (
    request.nextUrl.pathname === '/public' ||
    request.nextUrl.pathname.startsWith('/public/')
  ) {
    return response
  }

  // Get environment variables with fallbacks
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Auth routes - redirect to dashboard if already authenticated
    if (request.nextUrl.pathname.startsWith('/auth/login')) {
      if (user) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      return response
    }

    // Auth callback route - allow through
    if (request.nextUrl.pathname.startsWith('/auth/callback')) {
      return response
    }

    // Protected routes - redirect to login if not authenticated
    const protectedRoutes = [
      '/',
      '/notebooks',
      '/projects', 
      '/team',
      '/calendar',
      '/settings',
      '/dashboard-pro'
    ]

    const isProtectedRoute = protectedRoutes.some(route => 
      request.nextUrl.pathname === route || 
      request.nextUrl.pathname.startsWith(route + '/')
    )

    if (isProtectedRoute && !user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    return response
  } catch (error) {
    console.warn('Auth middleware error:', error)
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 