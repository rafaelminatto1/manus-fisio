'use client'

import { useEffect, useState } from 'react'

export function useIOSKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  
  useEffect(() => {
    // Detectar iOS
    const userAgent = navigator.userAgent
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent)
    setIsIOS(isIOSDevice)
    
    if (!isIOSDevice) return
    
    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        const heightDiff = window.innerHeight - window.visualViewport.height
        setKeyboardHeight(heightDiff)
        setIsKeyboardOpen(heightDiff > 150)
      }
    }
    
    // Fallback para dispositivos que não suportam visualViewport
    const handleResize = () => {
      const heightDiff = window.screen.height - window.innerHeight
      setKeyboardHeight(heightDiff)
      setIsKeyboardOpen(heightDiff > 300)
    }
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange)
    } else {
      window.addEventListener('resize', handleResize)
    }
    
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange)
      } else {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])
  
  return { 
    isIOS,
    keyboardHeight, 
    isKeyboardOpen 
  }
}
