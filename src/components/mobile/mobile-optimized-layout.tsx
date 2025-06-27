'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface DeviceInfo {
  isIPhone: boolean
  isIPad: boolean
  hasNotch: boolean
  hasDynamicIsland: boolean
  deviceModel: string
}

export function MobileOptimizedLayout({ children }: { children: React.ReactNode }) {
  const [isIOS, setIsIOS] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isIPhone: false,
    isIPad: false,
    hasNotch: false,
    hasDynamicIsland: false,
    deviceModel: 'unknown'
  })
  
  useEffect(() => {
    const userAgent = navigator.userAgent
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent)
    const isIPhone = /iPhone/.test(userAgent)
    const isIPad = /iPad/.test(userAgent)
    
    // Detectar dispositivos específicos baseado no screen size
    const screenHeight = window.screen.height
    const screenWidth = window.screen.width
    
    let deviceModel = 'unknown'
    let hasNotch = false
    let hasDynamicIsland = false
    
    if (isIPhone) {
      // iPhone 11, 12, 13 mini (375x812)
      if (screenWidth === 375 && screenHeight === 812) {
        deviceModel = 'iPhone 11/12/13 mini'
        hasNotch = true
      }
      // iPhone 12, 13, 14 (390x844)
      else if (screenWidth === 390 && screenHeight === 844) {
        deviceModel = 'iPhone 12/13/14'
        hasNotch = true
      }
      // iPhone 14 Plus, 15 Plus (428x926)
      else if (screenWidth === 428 && screenHeight === 926) {
        deviceModel = 'iPhone 14/15 Plus'
        hasNotch = true
      }
      // iPhone 15 Pro Max, 16 Pro Max (430x932)
      else if (screenWidth === 430 && screenHeight === 932) {
        deviceModel = 'iPhone 15/16 Pro Max'
        hasDynamicIsland = true
      }
      // iPhone 14 Pro, 15 Pro (393x852)
      else if (screenWidth === 393 && screenHeight === 852) {
        deviceModel = 'iPhone 14/15 Pro'
        hasDynamicIsland = true
      }
      else if (screenHeight >= 812) {
        hasNotch = true
      }
    }
    
    // iPad 10 (820x1180)
    if (isIPad && screenWidth === 820 && screenHeight === 1180) {
      deviceModel = 'iPad 10'
    }
    
    setIsIOS(isIOSDevice)
    setDeviceInfo({
      isIPhone,
      isIPad,
      hasNotch,
      hasDynamicIsland,
      deviceModel
    })
  }, [])
  
  return (
    <div 
      className={cn(
        'min-h-screen',
        isIOS && 'ios-safe-layout touch-optimized',
        deviceInfo.hasNotch && 'pt-safe-top',
        deviceInfo.hasDynamicIsland && 'pt-dynamic-island',
        deviceInfo.isIPad && 'ipad-layout'
      )}
      style={{
        paddingTop: deviceInfo.hasDynamicIsland 
          ? 'max(54px, env(safe-area-inset-top))'
          : deviceInfo.hasNotch 
          ? 'max(44px, env(safe-area-inset-top))'
          : undefined,
        paddingBottom: isIOS ? 'max(1rem, env(safe-area-inset-bottom))' : undefined
      }}
    >
      {children}
      
      {/* Debug info - remover em produção */}
      {process.env.NODE_ENV === 'development' && isIOS && (
        <div className='fixed bottom-4 left-4 bg-black/80 text-white text-xs p-2 rounded z-50'>
          <div>Device: {deviceInfo.deviceModel}</div>
          <div>Screen: {window.screen.width}x{window.screen.height}</div>
          <div>Notch: {deviceInfo.hasNotch ? 'Yes' : 'No'}</div>
          <div>Dynamic Island: {deviceInfo.hasDynamicIsland ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  )
}
