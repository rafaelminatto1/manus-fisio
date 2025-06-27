'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)

  const { signIn, signUp, resetPassword, loading, user } = useAuth()
  const router = useRouter()

  // Redirecionar automaticamente se o usuário já estiver logado
  useEffect(() => {
    if (user && !loading) {
      console.log('Usuário logado, redirecionando para dashboard...', user)
      // Aguardar um pouco antes de redirecionar para mostrar a mensagem
      const timer = setTimeout(() => {
        router.replace('/')
      }, message ? 1500 : 100)
      
      return () => clearTimeout(timer)
    }
  }, [user, loading, router, message])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    console.log('Iniciando processo de login...')
    const { error } = await signIn(email, password)

    if (error) {
      console.error('Erro no login:', error)
      setError(error.message)
    } else {
      console.log('Login bem-sucedido!')
      setMessage('Login realizado com sucesso!')
      // O redirecionamento será feito pelo useEffect quando user for atualizado
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { error } = await signUp(email, password, {
      full_name: email.split('@')[0], // Default name from email
      role: 'guest', // Default role - will be updated by admin
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Conta criada! Verifique seu email para confirmar o cadastro.')
      setIsSignUp(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Digite seu email primeiro')
      return
    }

    setError(null)

    const { error } = await resetPassword(email)

    if (error) {
      setError(error.message)
    } else {
      setMessage('Instruções enviadas para seu email!')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Heart className="h-8 w-8 text-medical-500" />
            <h1 className="text-2xl font-bold">Manus Fisio</h1>
          </div>
          <div>
            <CardTitle className="text-xl">
              {isSignUp ? 'Criar Conta' : 'Acesso ao Sistema'}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? 'Crie sua conta para acessar o sistema' 
                : 'Entre com suas credenciais para acessar o sistema de gestão clínica'
              }
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className="border-medical-200 bg-medical-50">
              <AlertDescription className="text-medical-800">{message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="rafael.minatto@yahoo.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full btn-medical"
                disabled={loading}
              >
                {loading 
                  ? (isSignUp ? 'Criando conta...' : 'Entrando...') 
                  : (isSignUp ? 'Criar Conta' : 'Entrar')
                }
              </Button>

              {!isSignUp && (
                <div className="flex justify-between text-sm">
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-medical-600 hover:text-medical-700"
                    onClick={handleForgotPassword}
                    disabled={loading}
                  >
                    Esqueci minha senha
                  </Button>
                </div>
              )}
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {isSignUp ? 'Já tem conta?' : 'Não tem conta?'}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
              setMessage(null)
            }}
            disabled={loading}
          >
            {isSignUp ? 'Fazer Login' : 'Criar nova conta'}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            <p>Sistema de Gestão Clínica</p>
            <p>Para fisioterapeutas e estagiários</p>
            <p className="mt-2 text-slate-500">
              Modo Mock: rafael.minatto@yahoo.com.br
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 