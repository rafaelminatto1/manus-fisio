import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Clock, 
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  X,
  Minimize2
} from 'lucide-react'

interface PerformanceMetrics {
  loadTime: number
  memoryUsage: number
  networkLatency: number
  renderTime: number
  errorCount: number
  userActions: number
  timestamp: Date
}

interface PerformanceMonitorProps {
  isOpen: boolean
  onClose: () => void
  onMinimize: () => void
}

export function PerformanceMonitor({ isOpen, onClose, onMinimize }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([])
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null)
  const [isCollecting, setIsCollecting] = useState(true)

  // Simular coleta de métricas
  useEffect(() => {
    if (!isCollecting) return

    const collectMetrics = () => {
      const newMetrics: PerformanceMetrics = {
        loadTime: Math.random() * 1000 + 200, // 200-1200ms
        memoryUsage: Math.random() * 60 + 20, // 20-80%
        networkLatency: Math.random() * 100 + 10, // 10-110ms
        renderTime: Math.random() * 20 + 5, // 5-25ms
        errorCount: Math.floor(Math.random() * 3), // 0-2 errors
        userActions: Math.floor(Math.random() * 10) + 1, // 1-10 actions
        timestamp: new Date()
      }

      setCurrentMetrics(newMetrics)
      setMetrics(prev => [...prev.slice(-19), newMetrics]) // Keep last 20 readings
    }

    collectMetrics()
    const interval = setInterval(collectMetrics, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [isCollecting])

  const getStatusColor = (value: number, thresholds: { good: number, warning: number }) => {
    if (value <= thresholds.good) return 'text-green-500'
    if (value <= thresholds.warning) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getStatusIcon = (value: number, thresholds: { good: number, warning: number }) => {
    if (value <= thresholds.good) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (value <= thresholds.warning) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return <AlertTriangle className="h-4 w-4 text-red-500" />
  }

  const averageMetrics = metrics.length > 0 ? {
    loadTime: metrics.reduce((sum, m) => sum + m.loadTime, 0) / metrics.length,
    memoryUsage: metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length,
    networkLatency: metrics.reduce((sum, m) => sum + m.networkLatency, 0) / metrics.length,
    renderTime: metrics.reduce((sum, m) => sum + m.renderTime, 0) / metrics.length,
    errorCount: metrics.reduce((sum, m) => sum + m.errorCount, 0),
    userActions: metrics.reduce((sum, m) => sum + m.userActions, 0)
  } : null

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card 
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Monitor de Performance
                <Badge variant={isCollecting ? "default" : "secondary"}>
                  {isCollecting ? "Ativo" : "Pausado"}
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCollecting(!isCollecting)}
                >
                  {isCollecting ? "Pausar" : "Iniciar"}
                </Button>
                <Button variant="ghost" size="icon" onClick={onMinimize}>
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 overflow-y-auto">
            {currentMetrics && (
              <div className="space-y-6">
                {/* Current Metrics */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Métricas Atuais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Load Time */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">Tempo de Carregamento</span>
                          </div>
                          {getStatusIcon(currentMetrics.loadTime, { good: 500, warning: 1000 })}
                        </div>
                        <div className="text-2xl font-bold mb-1">
                          {currentMetrics.loadTime.toFixed(0)}ms
                        </div>
                        <Progress 
                          value={Math.min((currentMetrics.loadTime / 1200) * 100, 100)} 
                          className="h-2"
                        />
                      </CardContent>
                    </Card>

                    {/* Memory Usage */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-medium">Uso de Memória</span>
                          </div>
                          {getStatusIcon(currentMetrics.memoryUsage, { good: 40, warning: 70 })}
                        </div>
                        <div className="text-2xl font-bold mb-1">
                          {currentMetrics.memoryUsage.toFixed(1)}%
                        </div>
                        <Progress 
                          value={currentMetrics.memoryUsage} 
                          className="h-2"
                        />
                      </CardContent>
                    </Card>

                    {/* Network Latency */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Wifi className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Latência de Rede</span>
                          </div>
                          {getStatusIcon(currentMetrics.networkLatency, { good: 50, warning: 100 })}
                        </div>
                        <div className="text-2xl font-bold mb-1">
                          {currentMetrics.networkLatency.toFixed(0)}ms
                        </div>
                        <Progress 
                          value={Math.min((currentMetrics.networkLatency / 200) * 100, 100)} 
                          className="h-2"
                        />
                      </CardContent>
                    </Card>

                    {/* Render Time */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium">Tempo de Renderização</span>
                          </div>
                          {getStatusIcon(currentMetrics.renderTime, { good: 10, warning: 20 })}
                        </div>
                        <div className="text-2xl font-bold mb-1">
                          {currentMetrics.renderTime.toFixed(1)}ms
                        </div>
                        <Progress 
                          value={Math.min((currentMetrics.renderTime / 30) * 100, 100)} 
                          className="h-2"
                        />
                      </CardContent>
                    </Card>

                    {/* Error Count */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium">Erros</span>
                          </div>
                          {currentMetrics.errorCount === 0 ? 
                            <CheckCircle className="h-4 w-4 text-green-500" /> :
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          }
                        </div>
                        <div className="text-2xl font-bold mb-1">
                          {currentMetrics.errorCount}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {currentMetrics.errorCount === 0 ? 'Nenhum erro' : 'Erros detectados'}
                        </div>
                      </CardContent>
                    </Card>

                    {/* User Actions */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-indigo-500" />
                            <span className="text-sm font-medium">Ações do Usuário</span>
                          </div>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="text-2xl font-bold mb-1">
                          {currentMetrics.userActions}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Últimas 2 segundos
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Average Metrics */}
                {averageMetrics && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Médias ({metrics.length} leituras)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Carregamento Médio</div>
                        <div className="text-xl font-bold">
                          {averageMetrics.loadTime.toFixed(0)}ms
                        </div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Memória Média</div>
                        <div className="text-xl font-bold">
                          {averageMetrics.memoryUsage.toFixed(1)}%
                        </div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Latência Média</div>
                        <div className="text-xl font-bold">
                          {averageMetrics.networkLatency.toFixed(0)}ms
                        </div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Total de Erros</div>
                        <div className="text-xl font-bold">
                          {averageMetrics.errorCount}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance Tips */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Dicas de Performance</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Sistema otimizado para carregamento rápido</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Componentes carregados sob demanda</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Cache otimizado para recursos estáticos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Monitoramento contínuo de performance</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Hook para gerenciar performance monitor
export function usePerformanceMonitor() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  return {
    isOpen,
    isMinimized,
    openMonitor: () => setIsOpen(true),
    closeMonitor: () => setIsOpen(false),
    minimizeMonitor: () => {
      setIsMinimized(true)
      setIsOpen(false)
    },
    restoreMonitor: () => {
      setIsMinimized(false)
      setIsOpen(true)
    }
  }
} 