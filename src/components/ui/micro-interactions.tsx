'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion'
import { useSpring, animated, config } from '@react-spring/web'
import { cn } from '@/lib/cn'
import {
  Heart,
  Star,
  ThumbsUp,
  Zap,
  Sparkles,
  Check,
  X,
  Plus,
  Minus,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Loader2,
  Bell,
  Volume2,
  VolumeX,
  Eye,
  EyeOff
} from 'lucide-react'

// 🎯 Hook para animações de entrada
export function useScrollAnimation() {
  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  return { ref, controls }
}

// ✨ Componente de Sparkle animado
export function AnimatedSparkle({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn('inline-block', className)}
      animate={{
        rotate: [0, 180, 360],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <Sparkles className="h-4 w-4 text-yellow-500" />
    </motion.div>
  )
}

// 💖 Botão de Like com animação de coração
export function LikeButton({
  isLiked = false,
  onToggle,
  count = 0,
  size = 'md',
  className,
}: {
  isLiked?: boolean
  onToggle?: (liked: boolean) => void
  count?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const [liked, setLiked] = useState(isLiked)
  const [animateCount, setAnimateCount] = useState(false)

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const handleClick = () => {
    const newLiked = !liked
    setLiked(newLiked)
    setAnimateCount(true)
    onToggle?.(newLiked)
    
    setTimeout(() => setAnimateCount(false), 300)
  }

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full',
        'transition-colors duration-200',
        liked 
          ? 'bg-red-50 text-red-600 hover:bg-red-100' 
          : 'bg-muted text-muted-foreground hover:bg-muted/80',
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={liked ? {
          scale: [1, 1.3, 1],
          rotate: [0, -10, 10, 0],
        } : {}}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Heart 
          className={cn(sizeClasses[size], liked && 'fill-current')} 
        />
      </motion.div>
      
      <motion.span
        className="text-sm font-medium"
        animate={animateCount ? {
          scale: [1, 1.2, 1],
          color: liked ? '#dc2626' : '#6b7280',
        } : {}}
        transition={{ duration: 0.3 }}
      >
        {count}
      </motion.span>
    </motion.button>
  )
}

// ⭐ Rating com estrelas animadas
export function AnimatedRating({
  rating = 0,
  maxRating = 5,
  onRate,
  readonly = false,
  size = 'md',
  className,
}: {
  rating?: number
  maxRating?: number
  onRate?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const [hoverRating, setHoverRating] = useState(0)
  const [animatingStars, setAnimatingStars] = useState<number[]>([])

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const handleClick = (starRating: number) => {
    if (readonly) return
    
    setAnimatingStars([starRating])
    onRate?.(starRating)
    
    setTimeout(() => setAnimatingStars([]), 300)
  }

  const handleMouseEnter = (starRating: number) => {
    if (readonly) return
    setHoverRating(starRating)
  }

  const handleMouseLeave = () => {
    if (readonly) return
    setHoverRating(0)
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starRating = index + 1
        const isActive = starRating <= (hoverRating || rating)
        const isAnimating = animatingStars.includes(starRating)

        return (
          <motion.button
            key={starRating}
            onClick={() => handleClick(starRating)}
            onMouseEnter={() => handleMouseEnter(starRating)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={cn(
              'transition-colors duration-200',
              !readonly && 'hover:scale-110 cursor-pointer',
              readonly && 'cursor-default'
            )}
            animate={isAnimating ? {
              scale: [1, 1.3, 1],
              rotate: [0, -10, 10, 0],
            } : {}}
            whileHover={!readonly ? { scale: 1.1 } : {}}
            whileTap={!readonly ? { scale: 0.95 } : {}}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isActive 
                  ? 'text-yellow-500 fill-current' 
                  : 'text-muted-foreground'
              )}
            />
          </motion.button>
        )
      })}
    </div>
  )
}

// 🎯 Contador animado
export function AnimatedCounter({
  value,
  duration = 1000,
  prefix = '',
  suffix = '',
  className,
}: {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const springProps = useSpring({
    number: isVisible ? value : 0,
    config: config.slow,
    onFrame: (props: { number: number }) => {
      setDisplayValue(Math.floor(props.number))
    },
  })

  useEffect(() => {
    if (inView) {
      setIsVisible(true)
    }
  }, [inView])

  return (
    <span ref={ref} className={className}>
      {prefix}
      <animated.span>
        {springProps.number.to(n => Math.floor(n).toLocaleString())}
      </animated.span>
      {suffix}
    </span>
  )
}

// 🔔 Notificação toast animada
export function AnimatedToast({
  message,
  type = 'info',
  isVisible,
  onClose,
  duration = 3000,
}: {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  isVisible: boolean
  onClose: () => void
  duration?: number
}) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  const typeConfig = {
    success: {
      icon: Check,
      bgColor: 'bg-green-500',
      textColor: 'text-white',
    },
    error: {
      icon: X,
      bgColor: 'bg-red-500',
      textColor: 'text-white',
    },
    warning: {
      icon: Bell,
      bgColor: 'bg-yellow-500',
      textColor: 'text-white',
    },
    info: {
      icon: Bell,
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
    },
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            'fixed top-4 right-4 z-50 max-w-sm rounded-lg shadow-lg',
            'flex items-center gap-3 px-4 py-3',
            config.bgColor,
            config.textColor
          )}
        >
          <Icon className="h-5 w-5 flex-shrink-0" />
          <p className="flex-1 text-sm font-medium">{message}</p>
          <button
            onClick={onClose}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 🎨 Botão com efeito ripple
export function RippleButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  const buttonRef = useRef<HTMLButtonElement>(null)

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return

    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newRipple = { x, y, id: Date.now() }
    setRipples(prev => [...prev, newRipple])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 600)

    onClick?.()
  }

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative overflow-hidden rounded-md font-medium',
        'transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary/20',
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
      
      {/* Ripple Effects */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </motion.button>
  )
}

// 📊 Progress bar animado
export function AnimatedProgress({
  value,
  max = 100,
  showValue = true,
  color = 'primary',
  size = 'md',
  className,
}: {
  value: number
  max?: number
  showValue?: boolean
  color?: 'primary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const percentage = Math.min((value / max) * 100, 100)

  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  }

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  return (
    <div className={cn('space-y-2', className)}>
      {showValue && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      
      <div className={cn('bg-muted rounded-full overflow-hidden', sizeClasses[size])}>
        <motion.div
          className={cn('h-full rounded-full', colorClasses[color])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// 🎭 Componente de reveal animado
export function AnimatedReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className,
}: {
  children: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  duration?: number
  className?: string
}) {
  const { ref, controls } = useScrollAnimation()

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 20 : direction === 'down' ? -20 : 0,
      x: direction === 'left' ? 20 : direction === 'right' ? -20 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration,
        delay,
        ease: [0.17, 0.67, 0.83, 0.67],
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  )
} 