import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

// Verificar se estamos no lado do servidor
const isServer = typeof window === 'undefined'

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Configurações específicas para evitar erros
const supabaseOptions = {
  auth: {
    autoRefreshToken: !isServer,
    persistSession: !isServer,
    detectSessionInUrl: !isServer,
  },
  global: {
    headers: {
      'X-Client-Info': 'manus-fisio',
    },
  },
}

// Criar cliente do Supabase
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  supabaseOptions
)

// Função para criar cliente específico para server-side
export function createSupabaseClient() {
  return createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    supabaseOptions
  )
}

export default supabase 