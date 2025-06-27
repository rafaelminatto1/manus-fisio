'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/cn'
import {
  Activity,
  Zap,
  Clock,
  Database,
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Monitor,
  Cpu,
  HardDrive,
  Globe,
  Eye,
  EyeOff,
  Settings,
  BarChart3,
  Gauge
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PerformanceMetrics {
  fps: number
  memory: {
    used: number
    total: number
    percentage: number
  }
  network: {
    rtt: number
    downlink: number
    effectiveType: string
  }
  vitals: {
    lcp: number // Largest Contentful Paint
    fid: number // First Input Delay
    cls: number // Cumulative Layout Shift
    fcp: number // First Contentful Paint
    ttfb: number // Time to First Byte
  }
  resources: {
    totalSize: number
    imageSize: number
    scriptSize: number
    stylesheetSize: number
    loadTime: number
  }
  errors: Array<{
    message: string
    timestamp: number
    type: 'error' | 'warning'
  }>
}

interface PerformanceMonitorProps {
  isVisible?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  compact?: boolean
  showAlerts?: boolean
  thresholds?: {
    fps: number
    memory: number
    lcp: number
    fid: number
    cls: number
  }
}

const defaultThresholds = {
  fps: 30,
  memory: 80,
  lcp: 2500,
  fid: 100,
  cls: 0.1
}

export function PerformanceMonitor({
  isVisible = false,
  position = 'bottom-right',
  compact = false,
  showAlerts = true,
  thresholds = defaultThresholds
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memory: { used: 0, total: 0, percentage: 0 },
    network: { rtt: 0, downlink: 0, effectiveType: '4g' },
    vitals: { lcp: 0, fid: 0, cls: 0, fcp: 0, ttfb: 0 },
    resources: { totalSize: 0, imageSize: 0, scriptSize: 0, stylesheetSize: 0, loadTime: 0 },
    errors: []
  })
  
  const [isExpanded, setIsExpanded] = useState(!compact)
  const [activeTab, setActiveTab] = useState('overview')
  const [alerts, setAlerts] = useState<Array<{ id: string; message: string; type: 'warning' | 'error' }>>([])
  
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const animationFrameRef = useRef<number>()
  const performanceObserverRef = useRef<PerformanceObserver | null>(null)

  // Monitorar FPS
  const measureFPS = useCallback(() => {
    const now = performance.now()
    frameCountRef.current++
    
    if (now - lastTimeRef.current >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current))
      setMetrics(prev => ({ ...prev, fps }))
      
      frameCountRef.current = 0
      lastTimeRef.current = now
    }
    
    animationFrameRef.current = requestAnimationFrame(measureFPS)
  }, [])

  // Monitorar memória
  const measureMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const used = Math.round(memory.usedJSHeapSize / 1024 / 1024)
      const total = Math.round(memory.totalJSHeapSize / 1024 / 1024)
      const percentage = Math.round((used / total) * 100)
      
      setMetrics(prev => ({
        ...prev,
        memory: { used, total, percentage }
      }))
    }
  }, [])

  // Monitorar rede
  const measureNetwork = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      setMetrics(prev => ({
        ...prev,
        network: {
          rtt: connection.rtt || 0,
          downlink: connection.downlink || 0,
          effectiveType: connection.effectiveType || '4g'
        }
      }))
    }
  }, [])

  // Monitorar Core Web Vitals
  const measureVitals = useCallback(() => {
    if ('PerformanceObserver' in window) {
      // LCP - Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        if (lastEntry) {
          setMetrics(prev => ({
            ...prev,
            vitals: { ...prev.vitals, lcp: Math.round(lastEntry.startTime) }
          }))
        }
      })
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (e) {
        console.warn('LCP observation not supported')
      }

      // FID - First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          setMetrics(prev => ({
            ...prev,
            vitals: { ...prev.vitals, fid: Math.round(entry.processingStart - entry.startTime) }
          }))
        })
      })
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] })
      } catch (e) {
        console.warn('FID observation not supported')
      }

      // CLS - Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        
        setMetrics(prev => ({
          ...prev,
          vitals: { ...prev.vitals, cls: Math.round(clsValue * 1000) / 1000 }
        }))
      })
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (e) {
        console.warn('CLS observation not supported')
      }

      performanceObserverRef.current = lcpObserver
    }
  }, [])

  // Monitorar recursos
  const measureResources = useCallback(() => {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    let totalSize = 0
    let imageSize = 0
    let scriptSize = 0
    let stylesheetSize = 0
    let totalLoadTime = 0
    
    entries.forEach(entry => {
      const size = entry.transferSize || 0
      totalSize += size
      totalLoadTime += entry.duration
      
      if (entry.initiatorType === 'img') {
        imageSize += size
      } else if (entry.initiatorType === 'script') {
        scriptSize += size
      } else if (entry.initiatorType === 'css') {
        stylesheetSize += size
      }
    })
    
    setMetrics(prev => ({
      ...prev,
      resources: {
        totalSize: Math.round(totalSize / 1024),
        imageSize: Math.round(imageSize / 1024),
        scriptSize: Math.round(scriptSize / 1024),
        stylesheetSize: Math.round(stylesheetSize / 1024),
        loadTime: Math.round(totalLoadTime)
      }
    }))
  }, [])

  // Verificar alertas
  const checkAlerts = useCallback(() => {
    const newAlerts: Array<{ id: string; message: string; type: 'warning' | 'error' }> = []
    
    if (metrics.fps < thresholds.fps) {
      newAlerts.push({
        id: 'fps',
        message: `FPS baixo: ${metrics.fps} (< ${thresholds.fps})`,
        type: 'warning'
      })
    }
    
    if (metrics.memory.percentage > thresholds.memory) {
      newAlerts.push({
        id: 'memory',
        message: `Uso de memória alto: ${metrics.memory.percentage}% (> ${thresholds.memory}%)`,
        type: 'warning'
      })
    }
    
    if (metrics.vitals.lcp > thresholds.lcp) {
      newAlerts.push({
        id: 'lcp',
        message: `LCP lento: ${metrics.vitals.lcp}ms (> ${thresholds.lcp}ms)`,
        type: 'error'
      })
    }
    
    if (metrics.vitals.fid > thresholds.fid) {
      newAlerts.push({
        id: 'fid',
        message: `FID alto: ${metrics.vitals.fid}ms (> ${thresholds.fid}ms)`,
        type: 'error'
      })
    }
    
    if (metrics.vitals.cls > thresholds.cls) {
      newAlerts.push({
        id: 'cls',
        message: `CLS alto: ${metrics.vitals.cls} (> ${thresholds.cls})`,
        type: 'error'
      })
    }
    
    setAlerts(newAlerts)
  }, [metrics, thresholds])

  // Inicializar monitoramento
  useEffect(() => {
    if (!isVisible) return
    
    measureVitals()
    measureResources()
    measureFPS()
    
    const interval = setInterval(() => {
      measureMemory()
      measureNetwork()
      measureResources()
      checkAlerts()
    }, 1000)
    
    return () => {
      clearInterval(interval)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (performanceObserverRef.current) {
        performanceObserverRef.current.disconnect()
      }
    }
  }, [isVisible, measureVitals, measureResources, measureFPS, measureMemory, measureNetwork, checkAlerts])

  const getStatusColor = (value: number, threshold: number, reverse = false) => {
    const isGood = reverse ? value > threshold : value < threshold
    return isGood ? 'text-green-500' : 'text-red-500'
  }

  const getStatusIcon = (value: number, threshold: number, reverse = false) => {
    const isGood = reverse ? value > threshold : value < threshold
    return isGood ? CheckCircle : XCircle
  }

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  }

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'fixed z-50 max-w-sm',
        positionClasses[position]
      )}
    >
      <Card className="backdrop-blur-sm bg-background/95 border shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Performance</span>
            {alerts.length > 0 && showAlerts && (
              <Badge variant="destructive" className="text-xs">
                {alerts.length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 m-2">
                  <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                  <TabsTrigger value="vitals" className="text-xs">Vitals</TabsTrigger>
                  <TabsTrigger value="resources" className="text-xs">Resources</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="p-3 space-y-3">
                  {/* FPS */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">FPS</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={cn('text-sm font-mono', getStatusColor(metrics.fps, thresholds.fps, true))}>
                        {metrics.fps}
                      </span>
                      {React.createElement(getStatusIcon(metrics.fps, thresholds.fps, true), {
                        className: cn('h-3 w-3', getStatusColor(metrics.fps, thresholds.fps, true))
                      })}
                    </div>
                  </div>

                  {/* Memory */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Memory</span>
                      </div>
                      <span className={cn('text-sm font-mono', getStatusColor(metrics.memory.percentage, thresholds.memory))}>
                        {metrics.memory.percentage}%
                      </span>
                    </div>
                    <Progress value={metrics.memory.percentage} className="h-1" />
                    <div className="text-xs text-muted-foreground">
                      {metrics.memory.used}MB / {metrics.memory.total}MB
                    </div>
                  </div>

                  {/* Network */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Network</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono">{metrics.network.effectiveType}</div>
                      <div className="text-xs text-muted-foreground">
                        {metrics.network.rtt}ms RTT
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="vitals" className="p-3 space-y-3">
                  {/* LCP */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm">LCP</span>
                    <div className="flex items-center gap-1">
                      <span className={cn('text-sm font-mono', getStatusColor(metrics.vitals.lcp, thresholds.lcp))}>
                        {metrics.vitals.lcp}ms
                      </span>
                      {React.createElement(getStatusIcon(metrics.vitals.lcp, thresholds.lcp), {
                        className: cn('h-3 w-3', getStatusColor(metrics.vitals.lcp, thresholds.lcp))
                      })}
                    </div>
                  </div>

                  {/* FID */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm">FID</span>
                    <div className="flex items-center gap-1">
                      <span className={cn('text-sm font-mono', getStatusColor(metrics.vitals.fid, thresholds.fid))}>
                        {metrics.vitals.fid}ms
                      </span>
                      {React.createElement(getStatusIcon(metrics.vitals.fid, thresholds.fid), {
                        className: cn('h-3 w-3', getStatusColor(metrics.vitals.fid, thresholds.fid))
                      })}
                    </div>
                  </div>

                  {/* CLS */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CLS</span>
                    <div className="flex items-center gap-1">
                      <span className={cn('text-sm font-mono', getStatusColor(metrics.vitals.cls, thresholds.cls))}>
                        {metrics.vitals.cls}
                      </span>
                      {React.createElement(getStatusIcon(metrics.vitals.cls, thresholds.cls), {
                        className: cn('h-3 w-3', getStatusColor(metrics.vitals.cls, thresholds.cls))
                      })}
                    </div>
                  </div>

                  {/* FCP */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm">FCP</span>
                    <span className="text-sm font-mono text-muted-foreground">
                      {metrics.vitals.fcp}ms
                    </span>
                  </div>
                </TabsContent>

                <TabsContent value="resources" className="p-3 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Size</span>
                      <span className="text-sm font-mono">{metrics.resources.totalSize}KB</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Images</span>
                      <span className="text-sm font-mono">{metrics.resources.imageSize}KB</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Scripts</span>
                      <span className="text-sm font-mono">{metrics.resources.scriptSize}KB</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Styles</span>
                      <span className="text-sm font-mono">{metrics.resources.stylesheetSize}KB</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Load Time</span>
                      <span className="text-sm font-mono">{metrics.resources.loadTime}ms</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Alerts */}
              {alerts.length > 0 && showAlerts && (
                <div className="border-t p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Alertas</span>
                  </div>
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        'text-xs p-2 rounded border-l-2',
                        alert.type === 'error' 
                          ? 'bg-red-50 border-red-500 text-red-700'
                          : 'bg-yellow-50 border-yellow-500 text-yellow-700'
                      )}
                    >
                      {alert.message}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
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