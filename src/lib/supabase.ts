import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import { createClient as authClient } from '@/lib/auth'

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

// Mock do Supabase para desenvolvimento
// Este arquivo fornece um cliente mock quando as credenciais não estão disponíveis

// Re-exportar o cliente do auth.ts
export const supabase = hasValidCredentials() 
  ? authClient<Database>(supabaseUrl!, supabaseAnonKey!)
  : createMockSupabaseClient()

// Mock de dados para desenvolvimento
const mockData = {
  notifications: [],
  projects: [
    {
      id: '1',
      title: 'Fisioterapia Neurológica - Ana Costa',
      description: 'Tratamento para hemiplegia pós-AVC',
      status: 'planning',
      priority: 'medium',
      owner_id: 'mock-user-123',
      due_date: '2024-02-15',
      start_date: '2024-01-15',
      progress: 25,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      owner: { full_name: 'Dr. Rafael Santos' }
    },
    {
      id: '2',
      title: 'Reabilitação Pós-Cirúrgica - João Silva',
      description: 'Protocolo de reabilitação após cirurgia de LCA',
      status: 'active',
      priority: 'high',
      owner_id: 'mock-user-123',
      due_date: '2024-03-01',
      start_date: '2024-01-20',
      progress: 60,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      owner: { full_name: 'Dr. Rafael Santos' }
    }
  ],
  notebooks: [],
  tasks: [],
  users: [],
  activity_logs: [],
  calendar_events: []
}

// Tipos auxiliares
export type SupabaseClient = typeof supabase

// Helper functions que retornam dados mock
export const getCurrentUser = async () => {
  console.warn('🚧 Mock Mode: getCurrentUser')
  return null
}

export const signOut = async () => {
  console.warn('🚧 Mock Mode: signOut')
}

export const isAuthenticated = async () => {
  console.warn('🚧 Mock Mode: isAuthenticated')
  return true
}

export const isMockMode = () => {
  return true
}

// Cliente principal do Supabase
export const supabasePrincipal = hasValidCredentials() 
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

// Helper function to get the current user
export const getCurrentUserPrincipal = async () => {
  try {
    const { data: { user }, error } = await supabasePrincipal.auth.getUser();
    if (error) return null;
    return user;
  } catch (error) {
    console.warn('getCurrentUser: Auth service not available:', error);
    return null;
  }
};

// Helper function to sign out
export const signOutPrincipal = async () => {
  try {
    const { error } = await supabasePrincipal.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.warn('signOut: Auth service not available:', error);
  }
};

// Helper function to check if user is authenticated
export const isAuthenticatedPrincipal = async () => {
  try {
    const { data: { session } } = await supabasePrincipal.auth.getSession();
    return !!session?.user;
  } catch (error) {
    console.warn('isAuthenticated: Auth service not available:', error);
    return false;
  }
};

// Helper function to check if we're in mock mode
export const isMockModePrincipal = () => {
  return !hasValidCredentials();
}; 