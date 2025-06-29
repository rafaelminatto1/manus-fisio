import React from 'react'
import { cn } from '@/lib/cn'

interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min: number
  max: number
  step: number
  className?: string
  disabled?: boolean
}

export function Slider({ 
  value, 
  onValueChange, 
  min, 
  max, 
  step, 
  className,
  disabled = false 
}: SliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    onValueChange([newValue])
  }

  const percentage = (Array.isArray(value) && typeof value[0] === 'number')
    ? ((value[0] - min) / (max - min)) * 100
    : 0

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        disabled={disabled}
        className="absolute inset-0 h-2 w-full cursor-pointer appearance-none bg-transparent opacity-0"
      />
      <div 
        className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-primary bg-background shadow-sm transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        style={{ left: `calc(${percentage}% - 8px)` }}
      />
    </div>
  )
} 