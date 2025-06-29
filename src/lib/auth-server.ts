import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

// Types for authentication
export type User = {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: 'admin' | 'mentor' | 'intern' | 'guest'
  crefito?: string
  specialty?: string
  university?: string
  semester?: number
}

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Server-side auth client
export const createServerAuthClient = async () => {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

// Server-side authentication helpers
export const getUser = async () => {
  try {
    const supabase = await createServerAuthClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Get user profile from our custom users table
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return profile as User
  } catch (error) {
    console.warn('Auth service not available:', error)
    return null
  }
}

export const requireAuth = async () => {
  const user = await getUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export const requireRole = async (allowedRoles: string[]) => {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions')
  }
  return user
}

// Role checking utilities
export const isAdmin = (user: User | null) => user?.role === 'admin'
export const isMentor = (user: User | null) => user?.role === 'mentor' || user?.role === 'admin'
export const isIntern = (user: User | null) => user?.role === 'intern'

// Permission checking
export const canManageUsers = (user: User | null) => isAdmin(user)
export const canManageNotebooks = (user: User | null) => isMentor(user)
export const canManageProjects = (user: User | null) => isMentor(user)
export const canSuperviseInterns = (user: User | null) => isMentor(user) 