'use client'

import { useState, useCallback } from 'react'

export interface MicroInteractionConfig {
  haptic?: boolean
  sound?: boolean
  visual?: boolean
  duration?: number
  intensity?: 'light' | 'medium' | 'strong'
}

export function useMicroInteractions(config: MicroInteractionConfig = {}) {
  const [isActive, setIsActive] = useState(false)
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])

  const triggerHaptic = useCallback((pattern: number | number[]) => {
    if (!config.haptic || typeof navigator === 'undefined' || !navigator.vibrate) return
    navigator.vibrate(pattern)
  }, [config.haptic])

  const triggerSound = useCallback((frequency = 800, duration = 100) => {
    if (!config.sound || typeof window === 'undefined') return
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration / 1000)
    } catch (error) {
      // Silently fail if audio context is not available
    }
  }, [config.sound])

  const addRipple = useCallback((x: number, y: number) => {
    const id = Date.now()
    setRipples(prev => [...prev, { id, x, y }])
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id))
    }, 600)
  }, [])

  const handleClick = useCallback((event: React.MouseEvent) => {
    if (event.currentTarget instanceof Element) {
      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      addRipple(x, y)
    }
    
    triggerHaptic(100)
    triggerSound(800, 100)
    setIsActive(true)
    setTimeout(() => setIsActive(false), 150)
  }, [addRipple, triggerHaptic, triggerSound])

  const handleHover = useCallback((hover: boolean) => {
    if (hover) {
      triggerHaptic(50)
    }
  }, [triggerHaptic])

  const triggerSuccess = useCallback(() => {
    triggerHaptic([100, 50, 100])
    triggerSound(800, 200)
  }, [triggerHaptic, triggerSound])

  const triggerError = useCallback(() => {
    triggerHaptic([200, 100, 200])
    triggerSound(400, 150)
  }, [triggerHaptic, triggerSound])

  const RippleEffect = () => (
    <div className="absolute inset-0 overflow-hidden rounded-inherit pointer-events-none">
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute bg-current opacity-25 rounded-full animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  )

  return {
    isActive,
    ripples,
    triggerSuccess,
    triggerError,
    triggerHaptic,
    triggerSound,
    addRipple,
    handleClick,
    handleHover,
    RippleEffect
  }
}

export default useMicroInteractions 