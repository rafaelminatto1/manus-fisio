'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient, isMockMode } from '@/lib/auth'
import type { Database } from '@/types/database.types'
type User = Database['public']['Tables']['users']['Row']
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
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const isUsingMock = isMockMode()

  useEffect(() => {
    if (isMockMode()) {
      setUser({
        id: 'mock-user-id',
        email: 'mock@example.com',
        full_name: 'Usuário Mock',
        avatar_url: null,
        role: 'admin',
        crefito: null,
        specialty: null,
        university: null,
        semester: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      setLoading(false)
      return
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => authListener.subscription.unsubscribe()
  }, [isUsingMock])

  const fetchUserProfile = async (userId: string) => {
    if (isUsingMock) {
      setUser({
        id: 'mock-user-id',
        email: 'mock@example.com',
        full_name: 'Usuário Mock',
        avatar_url: null,
        role: 'admin',
        crefito: null,
        specialty: null,
        university: null,
        semester: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
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
          setUser({
            id: 'mock-user-id',
            email: 'mock@example.com',
            full_name: 'Usuário Mock',
            avatar_url: null,
            role: 'admin',
            crefito: null,
            specialty: null,
            university: null,
            semester: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
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
        setUser({
          id: 'mock-user-id',
          email: 'mock@example.com',
          full_name: 'Usuário Mock',
          avatar_url: null,
          role: 'admin',
          crefito: null,
          specialty: null,
          university: null,
          semester: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
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
          setUser({
            id: 'mock-user-id',
            email: 'mock@example.com',
            full_name: 'Usuário Mock',
            avatar_url: null,
            role: 'admin',
            crefito: null,
            specialty: null,
            university: null,
            semester: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
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