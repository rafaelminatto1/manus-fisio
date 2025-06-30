import * as React from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, Search, X } from "lucide-react"

export interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  errorMessage?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  clearable?: boolean
  onClear?: () => void
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ 
    className, 
    type,
    label,
    helperText,
    errorMessage,
    leftIcon,
    rightIcon,
    clearable,
    onClear,
    value,
    placeholder,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(Boolean(value))
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
      setHasValue(Boolean(value))
    }, [value])

    const isPasswordType = type === "password"

    const handleClear = () => {
      if (onClear) {
        onClear()
      }
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}

          <input
            type={isPasswordType && showPassword ? "text" : type}
            className={cn(
              "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ios-input focus-ring-enhanced hover-lift",
              leftIcon && "pl-10",
              (rightIcon || clearable || isPasswordType) && "pr-10",
              errorMessage && "border-destructive focus-visible:ring-destructive",
              className
            )}
            ref={ref || inputRef}
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              setHasValue(Boolean(e.target.value))
              props.onChange?.(e)
            }}
            style={{
              fontSize: '16px',
              WebkitAppearance: 'none',
              touchAction: 'manipulation'
            }}
            {...props}
          />

          {clearable && hasValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors touch-optimized"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {isPasswordType && !clearable && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors touch-optimized"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}

          {rightIcon && !clearable && !isPasswordType && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>

        {(helperText || errorMessage) && (
          <div className="space-y-1">
            {errorMessage && (
              <p className="text-xs text-destructive">{errorMessage}</p>
            )}
            {helperText && !errorMessage && (
              <p className="text-xs text-muted-foreground">{helperText}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

EnhancedInput.displayName = "EnhancedInput"

export { EnhancedInput } 