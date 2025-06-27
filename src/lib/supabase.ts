import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Configuração do Supabase com fallbacks para desenvolvimento
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verificar se as credenciais são válidas
const hasValidCredentials = () => {
  return !!(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') && 
    supabaseAnonKey.length > 20 &&
    !supabaseUrl.includes('mock') &&
    !supabaseAnonKey.includes('mock') &&
    supabaseUrl.includes('.supabase.co')
  )
}

// Mock client para desenvolvimento
const createMockSupabaseClient = () => {
  console.warn('🚧 Supabase Mock Mode: Credenciais não encontradas ou inválidas.')
  
  return {
    auth: {
      getUser: () => Promise.resolve({ 
        data: { user: null }, 
        error: null 
      }),
      getSession: () => Promise.resolve({ 
        data: { session: null }, 
        error: null 
      }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          order: () => Promise.resolve({ data: [], error: null })
        }),
        order: () => Promise.resolve({ data: [], error: null })
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null })
    }),
    channel: () => ({
      on: () => ({ subscribe: () => Promise.resolve() }),
      unsubscribe: () => Promise.resolve()
    })
  } as any
}

// Cliente principal do Supabase
export const supabase = hasValidCredentials() 
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : createMockSupabaseClient()

// Cliente para operações administrativas (server-side)
export const supabaseAdmin = (hasValidCredentials() && serviceRoleKey)
  ? createClient<Database>(supabaseUrl!, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : createMockSupabaseClient()

// Tipos auxiliares para o cliente
export type SupabaseClient = typeof supabase;

// Helper function to get the current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user;
  } catch (error) {
    console.warn('getCurrentUser: Auth service not available:', error);
    return null;
  }
};

// Helper function to sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.warn('signOut: Auth service not available:', error);
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session?.user;
  } catch (error) {
    console.warn('isAuthenticated: Auth service not available:', error);
    return false;
  }
};

// Helper function to check if we're in mock mode
export const isMockMode = () => {
  return !hasValidCredentials();
}; 