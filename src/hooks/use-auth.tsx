'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient, mockUser, isMockMode, hasSupabaseCredentials } from '@/lib/auth'
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
  
  const supabase = createClient()
  const isUsingMock = isMockMode()

  useEffect(() => {
    console.log('AuthProvider inicializando...', { isUsingMock })
    
    if (isUsingMock) {
      console.warn('⚠️ Usando modo mock - Configure as credenciais Supabase para produção')
      // Em modo mock, não autenticar automaticamente na inicialização
      setUser(null)
      setLoading(false)
      return
    }

    setLoading(true)

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Sessão atual:', session)
      setSession(session)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session)
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
      setUser(mockUser)
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
        if (process.env.NODE_ENV === 'development') {
          setUser(mockUser)
        } else {
          setUser(null)
        }
      } else {
        setUser(profile as User)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      if (process.env.NODE_ENV === 'development') {
        setUser(mockUser)
      } else {
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('Tentando login...', { email, isUsingMock })
    setLoading(true)
    
    try {
      if (isUsingMock) {
        await new Promise(resolve => setTimeout(resolve, 800))
        if (email === 'admin@clinica.com' || email === 'rafael.minatto@yahoo.com.br') {
          console.log('Login mock bem-sucedido')
          setUser(mockUser)
          return { error: null }
        }
        return { error: { message: 'Email ou senha inválidos' } }
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (!error) {
        console.log('Login Supabase bem-sucedido')
      }
      
      return { error }
    } catch (error) {
      console.error('Erro no signIn:', error)
      return { error: { message: 'Erro interno do sistema' } }
    } finally {
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
