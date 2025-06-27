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

console.log('🔧 Auth Configuration:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  isDev: process.env.NODE_ENV === 'development',
  isMockAuth: process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'
})

// Mock user for development (only when credentials are missing)
export const mockUser: User = {
  id: 'mock-user-123',
  email: 'rafael.minatto@yahoo.com.br',
  full_name: 'Dr. Rafael Minatto',
  avatar_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face',
  role: 'admin',
  crefito: 'CREFITO-123456',
  specialty: 'Fisioterapia Traumato-Ortopédica'
}

// Função para verificar se as credenciais estão configuradas e são válidas
export const hasSupabaseCredentials = () => {
  const hasValidCredentials = !!(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') && 
    supabaseAnonKey.length > 20 &&
    !supabaseUrl.includes('mock') &&
    !supabaseAnonKey.includes('mock') &&
    supabaseUrl.includes('.supabase.co')
  )
  
  console.log('🔍 Credenciais Supabase:', { hasValidCredentials, supabaseUrl: supabaseUrl?.substring(0, 30) + '...' })
  return hasValidCredentials
}

// Função para verificar se está em modo mock
export const isMockMode = () => {
  const mockMode = !hasSupabaseCredentials() || process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'
  console.log('🎭 Modo Mock:', mockMode)
  return mockMode
}

// Cliente mock básico para desenvolvimento
const createMockClient = () => {
  console.warn('🚧 Modo Mock ativo: Credenciais do Supabase não encontradas ou inválidas.')
  console.warn('📧 Use: rafael.minatto@yahoo.com.br ou admin@clinica.com para login')
  
  return {
    auth: {
      getSession: () => Promise.resolve({ 
        data: { 
          session: null // Começar sem sessão em modo mock
        }, 
        error: null 
      }),
      getUser: () => Promise.resolve({ 
        data: { user: null }, 
        error: null 
      }),
      onAuthStateChange: (callback: any) => {
        // Não simular login automático
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
      signInWithPassword: ({ email, password }: any) => {
        console.log('🔐 Mock login attempt:', email)
        if ((email === 'rafael.minatto@yahoo.com.br' || email === 'admin@clinica.com') && password) {
          console.log('✅ Mock login successful')
          return Promise.resolve({ data: { user: mockUser }, error: null })
        }
        console.log('❌ Mock login failed')
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
          single: () => Promise.resolve({ data: mockUser, error: null }),
          order: () => Promise.resolve({ data: [mockUser], error: null })
        }),
        order: () => Promise.resolve({ data: [mockUser], error: null })
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null })
    })
  } as any
}

// Client-side auth client
export const createClient = () => {
  // Verificar se as credenciais estão disponíveis e válidas
  if (!hasSupabaseCredentials()) {
    return createMockClient()
  }

  try {
    // Cliente real do Supabase
    console.log('🚀 Criando cliente Supabase real')
    return createBrowserClient<Database>(
      supabaseUrl!,
      supabaseAnonKey!
    )
  } catch (error) {
    console.error('❌ Erro ao criar cliente Supabase:', error)
    return createMockClient()
  }
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