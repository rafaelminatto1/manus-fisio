'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Alert, AlertDescription } from './alert'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  eventId: string | null
}

class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Generate unique event ID for tracking
    const eventId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    this.setState({
      errorInfo,
      eventId
    })

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to external service (in production)
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo, eventId)
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some((key, idx) => prevProps.resetKeys?.[idx] !== key)) {
        this.resetErrorBoundary()
      }
    }

    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary()
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo, eventId: string) => {
    // In production, send to error tracking service
    try {
      // Example: Sentry, LogRocket, etc.
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        })
      }).catch(console.error)
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    })
  }

  handleRetry = () => {
    this.resetErrorBoundary()
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  copyErrorDetails = () => {
    const { error, errorInfo, eventId } = this.state
    const errorDetails = {
      eventId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => alert('Detalhes do erro copiados para a área de transferência'))
      .catch(() => alert('Falha ao copiar detalhes do erro'))
  }

  render() {
    const { hasError, error, errorInfo, eventId } = this.state
    const { children, fallback, showDetails = false } = this.props

    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        return fallback
      }

      const isDevelopment = process.env.NODE_ENV === 'development'
      const isNetworkError = error?.message.includes('fetch') || error?.message.includes('network')
      const isChunkError = error?.message.includes('Loading chunk') || error?.message.includes('ChunkLoadError')

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Oops! Algo deu errado</CardTitle>
              <CardDescription>
                {isChunkError && 'Erro ao carregar recursos. Isso pode acontecer após atualizações.'}
                {isNetworkError && 'Problema de conexão detectado.'}
                {!isChunkError && !isNetworkError && 'Ocorreu um erro inesperado na aplicação.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error message */}
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  <strong>Erro:</strong> {error?.message || 'Erro desconhecido'}
                </AlertDescription>
              </Alert>

              {eventId && (
                <Alert>
                  <AlertDescription>
                    <strong>ID do Evento:</strong> {eventId}
                  </AlertDescription>
                </Alert>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </Button>
                
                {isChunkError && (
                  <Button onClick={this.handleReload} variant="outline" className="flex-1">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Recarregar Página
                  </Button>
                )}
                
                <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                  <Home className="mr-2 h-4 w-4" />
                  Ir para Início
                </Button>
              </div>

              {/* Developer details */}
              {(isDevelopment || showDetails) && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    Detalhes técnicos
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div className="rounded-md bg-muted p-3">
                      <h4 className="text-sm font-medium mb-2">Stack Trace:</h4>
                      <pre className="text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                        {error?.stack}
                      </pre>
                    </div>
                    
                    {errorInfo?.componentStack && (
                      <div className="rounded-md bg-muted p-3">
                        <h4 className="text-sm font-medium mb-2">Component Stack:</h4>
                        <pre className="text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                    
                    <Button 
                      onClick={this.copyErrorDetails} 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                    >
                      Copiar Detalhes do Erro
                    </Button>
                  </div>
                </details>
              )}

              {/* Help text */}
              <div className="text-center text-sm text-muted-foreground">
                Se o problema persistir, entre em contato com o suporte técnico
                {eventId && ` informando o ID: ${eventId}`}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return children
  }
}

// Hook for functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
    console.error('Error captured by useErrorHandler:', error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}

// HOC for wrapping components
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Specialized error boundaries
export const AIErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.error('AI Component Error:', error, errorInfo)
      // Send to AI error tracking
    }}
    fallback={
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro no assistente IA. Recarregue a página para tentar novamente.
        </AlertDescription>
      </Alert>
    }
  >
    {children}
  </ErrorBoundary>
)

export const FormErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary
    resetOnPropsChange={true}
    fallback={
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro no formulário. Alguns campos podem não estar funcionando corretamente.
        </AlertDescription>
      </Alert>
    }
  >
    {children}
  </ErrorBoundary>
)

export const ChartErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary
    fallback={
      <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/10">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Erro ao carregar gráfico
          </p>
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
)

export default ErrorBoundary 