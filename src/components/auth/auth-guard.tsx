'use client'

import { useAuth } from '@/hooks/use-auth-fixed'
import { Loading } from '@/components/ui/loading'
import { LoginForm } from '@/components/auth/login-form'

interface AuthGuardProps {
  children: React.ReactNode
  requireRole?: string[]
  fallback?: React.ReactNode
}

export function AuthGuard({ children, requireRole, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loading />
  }

  if (!user) {
    return fallback || <LoginForm />
  }

  if (requireRole && !requireRole.includes(user.role ?? '')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-white">Acesso Negado</h2>
          <p className="text-slate-400">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-slate-500 text-sm">
            Seu nível de acesso: {user.role}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 