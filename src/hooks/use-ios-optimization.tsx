'use client'

import { useState, useEffect, useCallback } from 'react'

interface IOSOptimizationConfig {
  isIOS: boolean
  isRetina: boolean
  deviceType: 'iPhone' | 'iPad' | 'iPod' | 'unknown'
  screenSize: 'small' | 'medium' | 'large'
  connectionType: 'slow' | 'fast' | 'unknown'
  isLowPowerMode: boolean
  memoryLevel: 'low' | 'medium' | 'high'
}

interface LazyLoadConfig {
  rootMargin: string
  threshold: number
  enableOnSlow: boolean
}

export function useIOSOptimization() {
  const [config, setConfig] = useState<IOSOptimizationConfig>({
    isIOS: false,
    isRetina: false,
    deviceType: 'unknown',
    screenSize: 'medium',
    connectionType: 'unknown',
    isLowPowerMode: false,
    memoryLevel: 'medium'
  })

  // ✅ Detectar configurações do dispositivo iOS
  const detectIOSConfig = useCallback(() => {
    const userAgent = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(userAgent)
    
    // Detectar Retina display
    const isRetina = window.devicePixelRatio >= 2
    
    // Detectar tipo de dispositivo
    let deviceType: 'iPhone' | 'iPad' | 'iPod' | 'unknown' = 'unknown'
    if (userAgent.includes('iPhone')) deviceType = 'iPhone'
    else if (userAgent.includes('iPad')) deviceType = 'iPad'
    else if (userAgent.includes('iPod')) deviceType = 'iPod'
    
    // Detectar tamanho da tela
    let screenSize: 'small' | 'medium' | 'large' = 'medium'
    const width = window.screen.width
    if (width <= 375) screenSize = 'small'
    else if (width >= 768) screenSize = 'large'
    
    // Detectar tipo de conexão
    let connectionType: 'slow' | 'fast' | 'unknown' = 'unknown'
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const effectiveType = connection?.effectiveType
      if (effectiveType === '2g' || effectiveType === 'slow-2g') {
        connectionType = 'slow'
      } else if (effectiveType === '4g' || effectiveType === '5g') {
        connectionType = 'fast'
      }
    }
    
    // Detectar modo de baixo consumo (aproximação)
    let isLowPowerMode = false
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        isLowPowerMode = battery.level < 0.2 && !battery.charging
      }).catch(() => {})
    }
    
    // Detectar nível de memória (aproximação)
    let memoryLevel: 'low' | 'medium' | 'high' = 'medium'
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const totalMB = memory.totalJSHeapSize / 1024 / 1024
      if (totalMB < 100) memoryLevel = 'low'
      else if (totalMB > 300) memoryLevel = 'high'
    }
    
    setConfig({
      isIOS,
      isRetina,
      deviceType,
      screenSize,
      connectionType,
      isLowPowerMode,
      memoryLevel
    })
  }, [])

  // ✅ Configuração de lazy loading otimizada para iOS
  const getLazyLoadConfig = useCallback((): LazyLoadConfig => {
    if (config.connectionType === 'slow' || config.isLowPowerMode) {
      return {
        rootMargin: '50px',
        threshold: 0.1,
        enableOnSlow: true
      }
    }
    
    if (config.memoryLevel === 'low') {
      return {
        rootMargin: '100px',
        threshold: 0.2,
        enableOnSlow: true
      }
    }
    
    return {
      rootMargin: '200px',
      threshold: 0.1,
      enableOnSlow: false
    }
  }, [config])

  // ✅ Otimização de imagens para Retina
  const getOptimizedImageSrc = useCallback((baseSrc: string, alt?: string) => {
    if (!config.isRetina) return baseSrc
    
    // Para displays Retina, usar imagens 2x se disponível
    const extension = baseSrc.split('.').pop()
    const baseName = baseSrc.replace(`.${extension}`, '')
    
    return {
      src: baseSrc,
      srcSet: `${baseName}.${extension} 1x, ${baseName}@2x.${extension} 2x`,
      loading: 'lazy' as const,
      decoding: 'async' as const,
      alt: alt || ''
    }
  }, [config.isRetina])

  // ✅ Preload de recursos críticos baseado no dispositivo
  const preloadCriticalResources = useCallback(() => {
    if (config.connectionType === 'slow' || config.isLowPowerMode) {
      // Não fazer preload em conexões lentas ou modo de baixo consumo
      return
    }
    
    const criticalResources = [
      '/icons/icon-192x192.png',
      config.deviceType === 'iPhone' ? '/icons/icon-180x180.png' : '/icons/icon-167x167.png'
    ]
    
    criticalResources.forEach(resource => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = resource
      document.head.appendChild(link)
    })
  }, [config])

  // ✅ Otimização de animações para iOS
  const getAnimationConfig = useCallback(() => {
    if (config.isLowPowerMode || config.memoryLevel === 'low') {
      return {
        duration: 0.2,
        easing: 'ease-out',
        reduceMotion: true
      }
    }
    
    return {
      duration: 0.3,
      easing: 'ease-in-out',
      reduceMotion: false
    }
  }, [config])

  // ✅ Cache inteligente baseado na conexão
  const getCacheStrategy = useCallback(() => {
    if (config.connectionType === 'slow') {
      return 'cache-first'
    }
    
    if (config.connectionType === 'fast') {
      return 'network-first'
    }
    
    return 'stale-while-revalidate'
  }, [config.connectionType])

  // ✅ Configuração de viewport para diferentes dispositivos iOS
  const getViewportConfig = useCallback(() => {
    const base = 'width=device-width, initial-scale=1, viewport-fit=cover'
    
    if (config.deviceType === 'iPad') {
      return `${base}, user-scalable=yes, maximum-scale=5`
    }
    
    return `${base}, user-scalable=no`
  }, [config.deviceType])

  useEffect(() => {
    detectIOSConfig()
    
    // Re-detectar configurações quando a orientação mudar
    const handleOrientationChange = () => {
      setTimeout(detectIOSConfig, 100)
    }
    
    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', handleOrientationChange)
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('resize', handleOrientationChange)
    }
  }, [detectIOSConfig])

  return {
    config,
    getLazyLoadConfig,
    getOptimizedImageSrc,
    preloadCriticalResources,
    getAnimationConfig,
    getCacheStrategy,
    getViewportConfig
  }
} 