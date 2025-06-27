'use client'

import { useCallback, useRef, useState, useEffect } from 'react'

export interface IOSGestureConfig {
  enableSwipeNavigation?: boolean
  enablePullToRefresh?: boolean
  swipeThreshold?: number
}

export function useIOSGestures(config: IOSGestureConfig = {}) {
  const {
    enableSwipeNavigation = true,
    enablePullToRefresh = false,
    swipeThreshold = 50
  } = config

  const [isScrolling, setIsScrolling] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)

  // Detectar se é dispositivo iOS
  const [isIOS, setIsIOS] = useState(false)
  
  useEffect(() => {
    const userAgent = navigator.userAgent
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent)
    setIsIOS(isIOSDevice)
  }, [])

  const handleSwipeLeft = useCallback(() => {
    if (!isIOS) return
    window.dispatchEvent(new CustomEvent('ios-swipe-left'))
  }, [isIOS])
  
  const handleSwipeRight = useCallback(() => {
    if (!isIOS) return
    window.dispatchEvent(new CustomEvent('ios-swipe-right'))
  }, [isIOS])

  const triggerIOSHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!isIOS || !navigator.vibrate) return
    const patterns = { light: 10, medium: 20, heavy: 30 }
    navigator.vibrate(patterns[type])
  }, [isIOS])

  return {
    isIOS,
    isScrolling,
    swipeDirection,
    handleSwipeLeft,
    handleSwipeRight,
    triggerIOSHaptic
  }
}
