'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useSpring, useSpringValue } from '@react-spring/web'

export interface MicroInteractionConfig {
  haptic?: boolean
  sound?: boolean
  visual?: boolean
  duration?: number
  intensity?: 'light' | 'medium' | 'strong'
}

export function useMicroInteractions(config: MicroInteractionConfig = {}) {
  const {
    haptic = true,
    sound = false,
    visual = true,
    duration = 200,
    intensity = 'medium'
  } = config

  // Estados para feedback visual
  const [isActive, setIsActive] = useState(false)
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])
  
  // Valores de animação
  const scale = useSpringValue(1)
  const opacity = useSpringValue(1)
  const y = useSpringValue(0)

  // Referências para elementos de áudio
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  // Inicializar contexto de áudio
  useEffect(() => {
    if (sound && typeof window !== 'undefined') {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        gainNodeRef.current = audioContextRef.current.createGain()
        gainNodeRef.current.connect(audioContextRef.current.destination)
        gainNodeRef.current.gain.value = 0.1
      } catch (error) {
        console.warn('Áudio não suportado:', error)
      }
    }
  }, [sound])

  // Função para vibração háptica
  const triggerHaptic = useCallback((pattern: number | number[] = 100) => {
    if (!haptic || typeof navigator === 'undefined' || !navigator.vibrate) return
    
    const patterns = {
      light: 50,
      medium: 100,
      strong: 200
    }
    
    const vibrationPattern = typeof pattern === 'number' ? pattern : patterns[intensity]
    navigator.vibrate(vibrationPattern)
  }, [haptic, intensity])

  // Função para feedback sonoro
  const triggerSound = useCallback((frequency: number = 800, duration: number = 100) => {
    if (!sound || !audioContextRef.current || !gainNodeRef.current) return
    
    try {
      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(gainNodeRef.current)
      
      oscillator.frequency.value = frequency
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.1, audioContextRef.current.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration / 1000)
      
      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + duration / 1000)
    } catch (error) {
      console.warn('Erro ao reproduzir som:', error)
    }
  }, [sound])

  // Função para adicionar ripple
  const addRipple = useCallback((x: number, y: number) => {
    const newRipple = { id: Date.now(), x, y }
    setRipples(prev => [...prev, newRipple])
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 600)
  }, [])

  // Micro-interação de clique
  const handleClick = useCallback((event?: React.MouseEvent) => {
    setIsActive(true)
    
    // Feedback háptico
    triggerHaptic()
    
    // Feedback sonoro
    triggerSound(1000, 50)
    
    // Feedback visual - ripple
    if (visual && event) {
      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      addRipple(x, y)
    }
    
    // Animação de escala
    scale.start(0.95, {
      config: { tension: 300, friction: 10 },
      onResolve: () => {
        scale.start(1, { config: { tension: 300, friction: 10 } })
      }
    })
    
    setTimeout(() => setIsActive(false), duration)
  }, [visual, duration, scale, triggerHaptic, triggerSound, addRipple])

  // Micro-interação de hover
  const handleHover = useCallback((isHovering: boolean) => {
    if (!visual) return
    
    if (isHovering) {
      scale.start(1.02, { config: { tension: 300, friction: 25 } })
      y.start(-2, { config: { tension: 300, friction: 25 } })
    } else {
      scale.start(1, { config: { tension: 300, friction: 25 } })
      y.start(0, { config: { tension: 300, friction: 25 } })
    }
  }, [visual, scale, y])

  // Micro-interação de foco
  const handleFocus = useCallback((isFocused: boolean) => {
    if (!visual) return
    
    opacity.start(isFocused ? 0.8 : 1, {
      config: { tension: 300, friction: 25 }
    })
  }, [visual, opacity])

  // Micro-interação de sucesso
  const triggerSuccess = useCallback(() => {
    triggerHaptic([100, 50, 100])
    triggerSound(800, 100)
    
    // Animação de "bounce" para sucesso
    scale.start(1.1, {
      config: { tension: 400, friction: 8 },
      onResolve: () => {
        scale.start(1, { config: { tension: 400, friction: 8 } })
      }
    })
  }, [scale, triggerHaptic, triggerSound])

  // Micro-interação de erro
  const triggerError = useCallback(() => {
    triggerHaptic([200, 100, 200])
    triggerSound(400, 150)
    
    // Animação de "shake" para erro
    const shakeSequence = [5, -5, 4, -4, 3, -3, 2, -2, 1, -1, 0]
    let index = 0
    
    const shake = () => {
      if (index < shakeSequence.length) {
        y.start(shakeSequence[index], {
          config: { tension: 800, friction: 10 },
          onResolve: () => {
            index++
            shake()
          }
        })
      }
    }
    
    shake()
  }, [y, triggerHaptic, triggerSound])

  // Micro-interação de loading
  const triggerLoading = useCallback(() => {
    const pulse = () => {
      scale.start(1.05, {
        config: { tension: 200, friction: 15 },
        onResolve: () => {
          scale.start(0.95, {
            config: { tension: 200, friction: 15 },
            onResolve: pulse
          })
        }
      })
    }
    
    pulse()
  }, [scale])

  // Parar animação de loading
  const stopLoading = useCallback(() => {
    scale.stop()
    scale.start(1, { config: { tension: 300, friction: 25 } })
  }, [scale])

  // Micro-interação de notificação
  const triggerNotification = useCallback((type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const soundFrequencies = {
      info: 600,
      success: 800,
      warning: 700,
      error: 400
    }
    
    const hapticPatterns = {
      info: 100,
      success: [100, 50, 100],
      warning: [150, 100, 150],
      error: [200, 100, 200]
    }
    
    triggerHaptic(hapticPatterns[type])
    triggerSound(soundFrequencies[type], 120)
    
    // Animação de slide-in
    y.start(-10, {
      config: { tension: 400, friction: 20 },
      onResolve: () => {
        y.start(0, { config: { tension: 400, friction: 20 } })
      }
    })
  }, [y, triggerHaptic, triggerSound])

  // Props para aplicar aos elementos
  const interactionProps = {
    onClick: handleClick,
    onMouseEnter: () => handleHover(true),
    onMouseLeave: () => handleHover(false),
    onFocus: () => handleFocus(true),
    onBlur: () => handleFocus(false),
    style: {
      transform: `scale(${scale.get()}) translateY(${y.get()}px)`,
      opacity: opacity.get(),
      transition: 'none' // Deixar o react-spring gerenciar as transições
    }
  }

  // Componente de ripple para usar em botões
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
    // Estados
    isActive,
    ripples,
    
    // Valores de animação
    scale,
    opacity,
    y,
    
    // Funções de trigger
    triggerSuccess,
    triggerError,
    triggerLoading,
    stopLoading,
    triggerNotification,
    triggerHaptic,
    triggerSound,
    addRipple,
    
    // Handlers
    handleClick,
    handleHover,
    handleFocus,
    
    // Props para aplicar
    interactionProps,
    
    // Componente
    RippleEffect
  }
}

// Hook para animações de entrada baseadas em scroll
export function useScrollReveal(threshold = 0.1, triggerOnce = true) {
  const [isVisible, setIsVisible] = useState(false)
  const [ref, setRef] = useState<Element | null>(null)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce) {
            observer.unobserve(ref)
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      { threshold }
    )

    observer.observe(ref)

    return () => observer.disconnect()
  }, [ref, threshold, triggerOnce])

  const springProps = useSpring({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0px)' : 'translateY(20px)',
    config: { tension: 280, friction: 60 }
  })

  return { ref: setRef, springProps, isVisible }
}

// Hook para animações de contagem
export function useCountAnimation(
  target: number,
  duration = 2000,
  trigger = true
) {
  const [count, setCount] = useState(0)

  const springValue = useSpringValue(0, {
    config: { tension: 100, friction: 50 }
  })

  useEffect(() => {
    if (trigger) {
      springValue.start(target, {
        config: { duration },
        onChange: (value) => {
          setCount(Math.floor(value.get()))
        }
      })
    }
  }, [target, duration, trigger, springValue])

  return count
}

export default useMicroInteractions 