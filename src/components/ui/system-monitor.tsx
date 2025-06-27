'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Activity,
  Cpu,
  Database,
  Globe,
  HardDrive,
  MemoryStick,
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  Users,
  FileText,
  BarChart3,
  RefreshCw,
  Settings,
  Download,
  Upload,
  Server,
  Shield,
  Eye,
  Bell,
  Gauge
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/cn'

interface SystemMetrics {
  cpu: {
    usage: number
    temperature: number
    cores: number
  }
  memory: {
    used: number
    total: number
    usage: number
  }
  disk: {
    used: number
    total: number
    usage: number
  }
  network: {
    upload: number
    download: number
    latency: number
  }
  database: {
    connections: number
    queries: number
    responseTime: number
  }
  application: {
    users: number
    requests: number
    errors: number
    uptime: number
  }
}

interface SystemAlert {
  id: string
  type: 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
  resolved: boolean
}

export function SystemMonitor() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: { usage: 0, temperature: 0, cores: 4 },
    memory: { used: 0, total: 8192, usage: 0 },
    disk: { used: 0, total: 512000, usage: 0 },
    network: { upload: 0, download: 0, latency: 0 },
    database: { connections: 0, queries: 0, responseTime: 0 },
    application: { users: 0, requests: 0, errors: 0, uptime: 0 }
  })

  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Simular métricas do sistema
  const generateMetrics = useCallback((): SystemMetrics => {
    const baseTime = Date.now()
    
    return {
      cpu: {
        usage: Math.max(5, Math.min(95, 15 + Math.sin(baseTime / 10000) * 20 + Math.random() * 10)),
        temperature: Math.max(35, Math.min(85, 45 + Math.sin(baseTime / 15000) * 15 + Math.random() * 5)),
        cores: 4
      },
      memory: {
        used: Math.max(1024, Math.min(7168, 2048 + Math.sin(baseTime / 8000) * 1024 + Math.random() * 512)),
        total: 8192,
        usage: 0 // Será calculado
      },
      disk: {
        used: Math.max(50000, Math.min(450000, 120000 + Math.sin(baseTime / 20000) * 50000 + Math.random() * 10000)),
        total: 512000,
        usage: 0 // Será calculado
      },
      network: {
        upload: Math.max(0, Math.sin(baseTime / 5000) * 100 + Math.random() * 50),
        download: Math.max(0, Math.sin(baseTime / 7000) * 200 + Math.random() * 100),
        latency: Math.max(1, Math.min(500, 25 + Math.random() * 50))
      },
      database: {
        connections: Math.max(1, Math.min(100, 10 + Math.sin(baseTime / 12000) * 20 + Math.random() * 5)),
        queries: Math.max(0, Math.sin(baseTime / 3000) * 1000 + Math.random() * 200),
        responseTime: Math.max(1, Math.min(1000, 50 + Math.random() * 100))
      },
      application: {
        users: Math.max(0, Math.min(500, 25 + Math.sin(baseTime / 15000) * 50 + Math.random() * 10)),
        requests: Math.max(0, Math.sin(baseTime / 4000) * 500 + Math.random() * 100),
        errors: Math.max(0, Math.random() < 0.1 ? Math.random() * 5 : 0),
        uptime: Math.floor((Date.now() - (Date.now() - 86400000)) / 1000) // 24h em segundos
      }
    }
  }, [])

  // Verificar alertas baseado nas métricas
  const checkAlerts = useCallback((newMetrics: SystemMetrics) => {
    const newAlerts: SystemAlert[] = []

    // CPU alto
    if (newMetrics.cpu.usage > 80) {
      newAlerts.push({
        id: `cpu-${Date.now()}`,
        type: 'warning',
        title: 'CPU Alta',
        message: `Uso da CPU em ${newMetrics.cpu.usage.toFixed(1)}%`,
        timestamp: new Date(),
        resolved: false
      })
    }

    // Temperatura alta
    if (newMetrics.cpu.temperature > 75) {
      newAlerts.push({
        id: `temp-${Date.now()}`,
        type: 'error',
        title: 'Temperatura Alta',
        message: `Temperatura da CPU em ${newMetrics.cpu.temperature.toFixed(1)}°C`,
        timestamp: new Date(),
        resolved: false
      })
    }

    // Memória alta
    if (newMetrics.memory.usage > 85) {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: 'warning',
        title: 'Memória Alta',
        message: `Uso de memória em ${newMetrics.memory.usage.toFixed(1)}%`,
        timestamp: new Date(),
        resolved: false
      })
    }

    // Disco cheio
    if (newMetrics.disk.usage > 90) {
      newAlerts.push({
        id: `disk-${Date.now()}`,
        type: 'error',
        title: 'Disco Cheio',
        message: `Uso de disco em ${newMetrics.disk.usage.toFixed(1)}%`,
        timestamp: new Date(),
        resolved: false
      })
    }

    // Latência alta
    if (newMetrics.network.latency > 200) {
      newAlerts.push({
        id: `latency-${Date.now()}`,
        type: 'warning',
        title: 'Latência Alta',
        message: `Latência de rede em ${newMetrics.network.latency.toFixed(0)}ms`,
        timestamp: new Date(),
        resolved: false
      })
    }

    // Erros da aplicação
    if (newMetrics.application.errors > 0) {
      newAlerts.push({
        id: `errors-${Date.now()}`,
        type: 'error',
        title: 'Erros da Aplicação',
        message: `${newMetrics.application.errors} erro(s) detectado(s)`,
        timestamp: new Date(),
        resolved: false
      })
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev.slice(0, 19)]) // Manter apenas 20 alertas
      
      // Mostrar toast para alertas críticos
      newAlerts.forEach(alert => {
        if (alert.type === 'error') {
          toast.error(`${alert.title}: ${alert.message}`)
        }
      })
    }
  }, [])

  // Atualizar métricas
  const updateMetrics = useCallback(() => {
    if (!isMonitoring) return

    const newMetrics = generateMetrics()
    
    // Calcular percentuais
    newMetrics.memory.usage = (newMetrics.memory.used / newMetrics.memory.total) * 100
    newMetrics.disk.usage = (newMetrics.disk.used / newMetrics.disk.total) * 100

    setMetrics(newMetrics)
    setLastUpdate(new Date())
    checkAlerts(newMetrics)
  }, [isMonitoring, generateMetrics, checkAlerts])

  // Efeito para atualização periódica
  useEffect(() => {
    updateMetrics() // Primeira atualização

    const interval = setInterval(updateMetrics, 2000) // Atualizar a cada 2 segundos

    return () => clearInterval(interval)
  }, [updateMetrics])

  // Formatar bytes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // Formatar tempo de uptime
  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  // Obter cor baseada no valor
  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-600'
    if (value >= thresholds.warning) return 'text-yellow-600'
    return 'text-green-600'
  }

  // Obter status geral do sistema
  const getSystemStatus = () => {
    const criticalIssues = alerts.filter(a => a.type === 'error' && !a.resolved).length
    const warnings = alerts.filter(a => a.type === 'warning' && !a.resolved).length
    
    if (criticalIssues > 0) return { status: 'critical', color: 'red', text: 'Crítico' }
    if (warnings > 0) return { status: 'warning', color: 'yellow', text: 'Atenção' }
    return { status: 'healthy', color: 'green', text: 'Saudável' }
  }

  const systemStatus = getSystemStatus()

  return (
    <div className="space-y-6">
      {/* Header com Status Geral */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-3 h-3 rounded-full",
              systemStatus.color === 'green' && "bg-green-500",
              systemStatus.color === 'yellow' && "bg-yellow-500",
              systemStatus.color === 'red' && "bg-red-500"
            )}>
              <div className={cn(
                "w-3 h-3 rounded-full animate-pulse",
                systemStatus.color === 'green' && "bg-green-400",
                systemStatus.color === 'yellow' && "bg-yellow-400",
                systemStatus.color === 'red' && "bg-red-400"
              )} />
            </div>
            <h2 className="text-xl font-semibold">Monitor do Sistema</h2>
            <Badge variant={systemStatus.color === 'green' ? 'default' : 'destructive'}>
              {systemStatus.text}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Última atualização: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? (
              <>
                <Eye className="h-4 w-4 mr-1" />
                Monitorando
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-1" />
                Pausado
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={updateMetrics}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="network">Rede</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* CPU */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">CPU</span>
                </div>
                <span className={cn("text-sm font-mono", getStatusColor(metrics.cpu.usage, { warning: 70, critical: 85 }))}>
                  {metrics.cpu.usage.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.cpu.usage} className="mb-2" />
              <div className="text-xs text-muted-foreground">
                {metrics.cpu.cores} cores • {metrics.cpu.temperature.toFixed(1)}°C
              </div>
            </Card>

            {/* Memória */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MemoryStick className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Memória</span>
                </div>
                <span className={cn("text-sm font-mono", getStatusColor(metrics.memory.usage, { warning: 75, critical: 90 }))}>
                  {metrics.memory.usage.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.memory.usage} className="mb-2" />
              <div className="text-xs text-muted-foreground">
                {formatBytes(metrics.memory.used * 1024 * 1024)} / {formatBytes(metrics.memory.total * 1024 * 1024)}
              </div>
            </Card>

            {/* Disco */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Disco</span>
                </div>
                <span className={cn("text-sm font-mono", getStatusColor(metrics.disk.usage, { warning: 80, critical: 95 }))}>
                  {metrics.disk.usage.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.disk.usage} className="mb-2" />
              <div className="text-xs text-muted-foreground">
                {formatBytes(metrics.disk.used * 1024)} / {formatBytes(metrics.disk.total * 1024)}
              </div>
            </Card>

            {/* Banco de Dados */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Database</span>
                </div>
                <span className={cn("text-sm font-mono", getStatusColor(metrics.database.responseTime, { warning: 200, critical: 500 }))}>
                  {metrics.database.responseTime.toFixed(0)}ms
                </span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>{metrics.database.connections} conexões</div>
                <div>{metrics.database.queries.toFixed(0)} queries/s</div>
              </div>
            </Card>
          </div>

          {/* Métricas da Aplicação */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Aplicação
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.application.users}</div>
                <div className="text-sm text-muted-foreground">Usuários Online</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{metrics.application.requests.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">Requests/min</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{metrics.application.errors}</div>
                <div className="text-sm text-muted-foreground">Erros</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{formatUptime(metrics.application.uptime)}</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráfico de CPU (simulado) */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">CPU Usage</h3>
              <div className="h-32 flex items-end justify-between gap-1">
                {Array.from({ length: 20 }, (_, i) => (
                  <div
                    key={i}
                    className="bg-blue-500 rounded-t"
                    style={{
                      height: `${Math.max(10, Math.random() * 100)}%`,
                      width: '4%'
                    }}
                  />
                ))}
              </div>
            </Card>

            {/* Gráfico de Memória (simulado) */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Memory Usage</h3>
              <div className="h-32 flex items-end justify-between gap-1">
                {Array.from({ length: 20 }, (_, i) => (
                  <div
                    key={i}
                    className="bg-green-500 rounded-t"
                    style={{
                      height: `${Math.max(10, Math.random() * 100)}%`,
                      width: '4%'
                    }}
                  />
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Upload</span>
              </div>
              <div className="text-2xl font-bold">{metrics.network.upload.toFixed(1)} KB/s</div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-4 w-4 text-green-600" />
                <span className="font-medium">Download</span>
              </div>
              <div className="text-2xl font-bold">{metrics.network.download.toFixed(1)} KB/s</div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Latência</span>
              </div>
              <div className={cn("text-2xl font-bold", getStatusColor(metrics.network.latency, { warning: 100, critical: 300 }))}>
                {metrics.network.latency.toFixed(0)}ms
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Alertas do Sistema</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAlerts([])}
              disabled={alerts.length === 0}
            >
              Limpar Todos
            </Button>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {alerts.length === 0 ? (
                <Card className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhum alerta ativo</p>
                </Card>
              ) : (
                alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <Alert className={cn(
                      alert.type === 'error' && 'border-red-200 bg-red-50',
                      alert.type === 'warning' && 'border-yellow-200 bg-yellow-50',
                      alert.type === 'info' && 'border-blue-200 bg-blue-50'
                    )}>
                      {alert.type === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                      {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                      {alert.type === 'info' && <CheckCircle className="h-4 w-4 text-blue-600" />}
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{alert.title}</div>
                            <div className="text-sm">{alert.message}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {alert.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
