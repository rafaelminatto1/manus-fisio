import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const enhancedButtonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md active:shadow-sm",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        medical: "bg-gradient-to-r from-medical-500 to-medical-600 text-white hover:from-medical-600 hover:to-medical-700 shadow-lg hover:shadow-xl active:shadow-md",
        success: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl",
        warning: "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-xl",
        error: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl",
        glass: "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
      animation: {
        none: "",
        bounce: "hover:animate-bounce-gentle",
        pulse: "hover:animate-pulse-slow",
        scale: "hover:scale-105 active:scale-95",
        slide: "hover:translate-x-1",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "scale",
    },
  }
)

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof enhancedButtonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  ripple?: boolean
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    asChild = false, 
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    ripple = true,
    children,
    onClick,
    disabled,
    ...props 
  }, ref) => {
    const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([])
    const buttonRef = React.useRef<HTMLButtonElement>(null)

    const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!ripple || disabled || loading) return
      
      const button = buttonRef.current
      if (!button) return

      const rect = button.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const newRipple = {
        id: Date.now(),
        x,
        y,
      }

      setRipples(prev => [...prev, newRipple])

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
      }, 600)
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      createRipple(event)
      if (onClick && !loading && !disabled) {
        onClick(event)
      }
    }

    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(
          enhancedButtonVariants({ variant, size, animation, className }),
          "touch-optimized ios-button"
        )}
        ref={ref || buttonRef}
        onClick={handleClick}
        disabled={disabled || loading}
        style={{
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'manipulation'
        }}
        {...props}
      >
        {/* Ripple Effect */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none animate-ping"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
          />
        ))}

        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-current/10 backdrop-blur-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}

        {/* Button Content */}
        <div className={cn(
          "flex items-center justify-center gap-2 transition-opacity duration-200",
          loading && "opacity-0"
        )}>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{loading && loadingText ? loadingText : children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </div>

        {/* Shine Effect for Gradient Buttons */}
        {(variant === 'medical' || variant === 'success' || variant === 'warning' || variant === 'error') && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        )}
      </Comp>
    )
  }
)

EnhancedButton.displayName = "EnhancedButton"

export { EnhancedButton, enhancedButtonVariants } 