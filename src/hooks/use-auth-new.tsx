'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient, isMockMode } from '@/lib/auth'
import type { Tables } from '@/types/database.types'
type User = Tables<'users'>
import type { Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(false) // ✅ CORREÇÃO: Iniciar como false
  
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const isUsingMock = isMockMode()

  // Mock completo para o tipo User
  const fullMockUser: User = {
    id: 'mock-user',
    email: 'mock@mock.com',
    full_name: 'Usuário Mock',
    role: 'admin',
    avatar_url: null,
    created_at: '',
    crefito: null,
    is_active: true,
    semester: null,
    specialty: null,
    university: null,
    updated_at: '',
  }

  useEffect(() => {
    // ✅ CORREÇÃO: Só setar loading quando realmente precisar carregar dados
    
    // Se não tem credenciais do Supabase ou está em modo mock, usar dados mock
    if (isUsingMock) {
      console.warn('⚠️ Usando modo mock - Configure as credenciais Supabase para produção')
      setUser(fullMockUser)
      setLoading(false)
      return
    }

    // ✅ Só setar loading quando for buscar dados do Supabase
    setLoading(true)

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [isUsingMock])

  const fetchUserProfile = async (userId: string) => {
    if (isUsingMock) {
      setUser(fullMockUser)
      setLoading(false)
      return
    }

    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        // Em caso de erro, usar dados mock como fallback apenas em dev
        if (process.env.NODE_ENV === 'development') {
          setUser(fullMockUser)
        } else {
          setUser(null)
        }
      } else {
        setUser(profile as User)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      // Em caso de erro, usar dados mock como fallback apenas em dev
      if (process.env.NODE_ENV === 'development') {
        setUser(fullMockUser)
      } else {
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    
    try {
      if (isUsingMock) {
        // Modo mock - simular login com delay reduzido
        await new Promise(resolve => setTimeout(resolve, 800))
        if (email === 'admin@clinica.com' || email === 'rafael.minatto@yahoo.com.br') {
          setUser(fullMockUser)
          return { error: null }
        }
        return { error: { message: 'Email ou senha inválidos' } }
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      // ✅ CORREÇÃO: Deixar o onAuthStateChange gerenciar o perfil do usuário
      return { error }
    } catch (error) {
      console.error('Erro no signIn:', error)
      return { error: { message: 'Erro interno do sistema' } }
    } finally {
      // ✅ CORREÇÃO CRÍTICA: Sempre resetar loading no finally
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    setLoading(true)
    
    try {
      if (isUsingMock) {
        return { error: { message: 'Cadastro não disponível no modo mock' } }
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      })
      
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    
    try {
      if (!isUsingMock) {
        await supabase.auth.signOut()
      }
      
      setUser(null)
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    if (isUsingMock) {
      return { error: { message: 'Reset de senha não disponível no modo mock' } }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email)
    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 