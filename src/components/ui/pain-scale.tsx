'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface PainScaleProps {
  value?: number
  onChange?: (value: number) => void
  className?: string
  showEmojis?: boolean
  showNumbers?: boolean
  size?: 'sm' | 'md' | 'lg'
  orientation?: 'horizontal' | 'vertical'
  disabled?: boolean
  showLabels?: boolean
}

const painEmojis = [
  '😊', // 0-1: Sem dor / Muito feliz
  '🙂', // 2: Dor muito leve
  '😐', // 3-4: Dor leve
  '😟', // 5: Dor moderada
  '😣', // 6-7: Dor forte
  '😖', // 8: Dor muito forte
  '😫', // 9-10: Dor insuportável
]

const painColors = [
  'bg-green-500', // 0-1
  'bg-green-400', // 2
  'bg-yellow-400', // 3-4
  'bg-orange-400', // 5
  'bg-orange-500', // 6-7
  'bg-red-500', // 8
  'bg-red-600', // 9-10
]

const painLabels = [
  'Sem dor',
  'Dor muito leve',
  'Dor leve',
  'Dor leve-moderada',
  'Dor moderada',
  'Dor moderada-forte',
  'Dor forte',
  'Dor muito forte',
  'Dor severa',
  'Dor muito severa',
  'Dor insuportável'
]

const getPainLevel = (value: number) => {
  if (value <= 1) return 0
  if (value <= 2) return 1
  if (value <= 4) return 2
  if (value <= 5) return 3
  if (value <= 7) return 4
  if (value <= 8) return 5
  return 6
}

export function PainScale({
  value = 0,
  onChange,
  className,
  showEmojis = true,
  showNumbers = true,
  size = 'md',
  orientation = 'horizontal',
  disabled = false,
  showLabels = true
}: PainScaleProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null)
  
  const currentValue = hoveredValue ?? value
  const painLevel = getPainLevel(currentValue)
  
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  }
  
  const containerClasses = {
    horizontal: 'flex flex-row items-center gap-1',
    vertical: 'flex flex-col items-center gap-1'
  }

  const handleClick = (newValue: number) => {
    if (!disabled && onChange) {
      onChange(newValue)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Emoji e descrição atual */}
      {showEmojis && (
        <div className="text-center">
          <div className="text-4xl mb-2">
            {painEmojis[painLevel]}
          </div>
          {showLabels && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {painLabels[currentValue]}
            </p>
          )}
        </div>
      )}
      
      {/* Escala de 0-10 */}
      <div className={containerClasses[orientation]}>
        {Array.from({ length: 11 }, (_, i) => {
          const isSelected = i === currentValue
          const isInRange = i <= currentValue
          const level = getPainLevel(i)
          
          return (
            <div
              key={i}
              className={cn(
                'relative cursor-pointer transition-all duration-200 rounded-full border-2 flex items-center justify-center',
                sizeClasses[size],
                isSelected 
                  ? `${painColors[level]} border-white shadow-lg scale-110` 
                  : isInRange
                    ? `${painColors[level]} border-gray-300 opacity-70`
                    : 'bg-gray-200 dark:bg-gray-700 border-gray-300 hover:bg-gray-300',
                disabled && 'cursor-not-allowed opacity-50'
              )}
              onClick={() => handleClick(i)}
              onMouseEnter={() => !disabled && setHoveredValue(i)}
              onMouseLeave={() => !disabled && setHoveredValue(null)}
            >
              {showNumbers && (
                <span className={cn(
                  'font-semibold',
                  isSelected || isInRange ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                )}>
                  {i}
                </span>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Labels das extremidades */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Sem dor</span>
        <span>Dor insuportável</span>
      </div>
      
      {/* Valor atual */}
      <div className="text-center">
        <span className="text-lg font-semibold">
          Dor: {currentValue}/10
        </span>
        {currentValue > 0 && (
          <span className={cn(
            'ml-2 px-2 py-1 rounded-full text-xs font-medium text-white',
            painColors[painLevel]
          )}>
            {painLabels[currentValue]}
          </span>
        )}
      </div>
    </div>
  )
}

// Componente compacto para uso em formulários
export function CompactPainScale({
  value = 0,
  onChange,
  className,
  disabled = false
}: Pick<PainScaleProps, 'value' | 'onChange' | 'className' | 'disabled'>) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm font-medium">Dor:</span>
      <div className="flex gap-1">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            type="button"
            className={cn(
              'w-6 h-6 rounded-full text-xs font-medium transition-all',
              i === value
                ? `${painColors[getPainLevel(i)]} text-white shadow-lg`
                : 'bg-gray-200 hover:bg-gray-300 text-gray-600',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            onClick={() => !disabled && onChange?.(i)}
            disabled={disabled}
          >
            {i}
          </button>
        ))}
      </div>
      <span className="text-sm text-gray-500">({value}/10)</span>
    </div>
  )
} 