import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

// Types for authentication (re-exported from server)
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

// Get environment variables with defaults for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const isMockMode = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

// Mock user for development
export const mockUser: User = {
  id: 'mock-user-123',
  email: 'admin@clinica.com',
  full_name: 'Dr. Rafael Santos',
  avatar_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face',
  role: 'admin',
  crefito: 'CREFITO-123456',
  specialty: 'Fisioterapia Traumato-Ortopédica'
}

// Client-side auth client
export const createClient = () => {
  // Se estivermos em modo mock ou sem credenciais, retorna um cliente mock
  if (isMockMode || !supabaseUrl || !supabaseAnonKey) {
    console.warn('🚧 Usando modo MOCK - Configure as credenciais Supabase para produção')
    
    // Cliente mock básico para desenvolvimento
    return {
      auth: {
        getSession: () => Promise.resolve({ 
          data: { 
            session: {
              user: { id: mockUser.id, email: mockUser.email },
              access_token: 'mock-token'
            }
          }, 
          error: null 
        }),
        getUser: () => Promise.resolve({ 
          data: { user: { id: mockUser.id, email: mockUser.email } }, 
          error: null 
        }),
        onAuthStateChange: (callback: any) => {
          // Simula login automático em desenvolvimento
          setTimeout(() => {
            callback('SIGNED_IN', {
              user: { id: mockUser.id, email: mockUser.email },
              access_token: 'mock-token'
            })
          }, 100)
          return { data: { subscription: { unsubscribe: () => {} } } }
        },
        signInWithPassword: ({ email, password }: any) => {
          if (email && password) {
            return Promise.resolve({ data: { user: mockUser }, error: null })
          }
          return Promise.resolve({ data: null, error: { message: 'Credenciais inválidas' } })
        },
        signUp: ({ email, password }: any) => {
          return Promise.resolve({ data: { user: null }, error: null })
        },
        signOut: () => Promise.resolve({ error: null }),
        resetPasswordForEmail: () => Promise.resolve({ error: null })
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: mockUser, error: null })
          })
        })
      })
    } as any
  }

  // Cliente real do Supabase
  return createBrowserClient<Database>(
    supabaseUrl!,
    supabaseAnonKey!
  )
}

// Role checking utilities (client-side)
export const isAdmin = (user: User | null) => user?.role === 'admin'
export const isMentor = (user: User | null) => user?.role === 'mentor' || user?.role === 'admin'
export const isIntern = (user: User | null) => user?.role === 'intern'

// Permission checking (client-side)
export const canManageUsers = (user: User | null) => isAdmin(user)
export const canManageNotebooks = (user: User | null) => isMentor(user)
export const canManageProjects = (user: User | null) => isMentor(user)
export const canSuperviseInterns = (user: User | null) => isMentor(user) 