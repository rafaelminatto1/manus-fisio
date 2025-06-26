'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient, mockUser } from '@/lib/auth'
import type { User } from '@/lib/auth'
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
  
  // Verificar se as credenciais do Supabase estão configuradas
  const hasSupabaseCredentials = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const supabase = hasSupabaseCredentials ? createClient() : null

  useEffect(() => {
    // Se não tem credenciais do Supabase, usar modo mock
    if (!hasSupabaseCredentials || !supabase) {
      console.warn('⚠️ Credenciais do Supabase não encontradas. Usando modo mock.')
      setUser(mockUser)
      setLoading(false)
      return
    }

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
  }, [supabase, hasSupabaseCredentials])

  const fetchUserProfile = async (userId: string) => {
    if (!supabase) {
      setUser(mockUser)
      setLoading(false)
      return
    }

    try {
      // Se estivermos em modo mock, usa os dados mock
      if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' || userId === mockUser.id) {
        setUser(mockUser)
        setLoading(false)
        return
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        // Em caso de erro, usar dados mock como fallback
        setUser(mockUser)
      } else {
        setUser(profile as User)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      // Em caso de erro, usar dados mock como fallback
      setUser(mockUser)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    
    if (!supabase) {
      // Modo mock - simular login
      if (email === 'admin@clinica.com' || email === 'rafael.minatto@yahoo.com.br') {
        setUser(mockUser)
        setLoading(false)
        return { error: null }
      }
      setLoading(false)
      return { error: { message: 'Email ou senha inválidos' } }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (!error && session?.user) {
      await fetchUserProfile(session.user.id)
    }
    setLoading(false)
    return { error }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    setLoading(true)
    
    if (!supabase) {
      setLoading(false)
      return { error: { message: 'Supabase não configurado' } }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    })
    setLoading(false)
    return { error }
  }

  const signOut = async () => {
    setLoading(true)
    
    if (supabase) {
      await supabase.auth.signOut()
    }
    
    setUser(null)
    setSession(null)
    setLoading(false)
  }

  const resetPassword = async (email: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase não configurado' } }
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