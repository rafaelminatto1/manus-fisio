import * as React from "react"
import { cn } from "@/lib/utils"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

export type ToastType = "success" | "error" | "warning" | "info"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  type: ToastType
  duration?: number
  onClose?: (id: string) => void
}

const toastVariants = {
  success: {
    icon: CheckCircle,
    className: "bg-emerald-50 border-emerald-200 text-emerald-800",
    iconClassName: "text-emerald-600"
  },
  error: {
    icon: AlertCircle,
    className: "bg-red-50 border-red-200 text-red-800",
    iconClassName: "text-red-600"
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-amber-50 border-amber-200 text-amber-800",
    iconClassName: "text-amber-600"
  },
  info: {
    icon: Info,
    className: "bg-blue-50 border-blue-200 text-blue-800",
    iconClassName: "text-blue-600"
  }
}

export function Toast({ id, title, description, type, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(true)
  const [progress, setProgress] = React.useState(100)
  
  const variant = toastVariants[type]
  const Icon = variant.icon

  React.useEffect(() => {
    if (duration <= 0) {
      return
    }

    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100))
        return newProgress <= 0 ? 0 : newProgress
      })
    }, 100)

    return () => {
      clearTimeout(timer)
      clearInterval(progressTimer)
    }
  }, [duration])

  const handleClose = React.useCallback(() => {
    setIsVisible(false)
    setTimeout(() => {
      onClose?.(id)
    }, 300)
  }, [id, onClose])

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border p-4 shadow-lg transition-all duration-300 transform",
        variant.className,
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      {/* Progress Bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-current/20 w-full">
          <div 
            className="h-full bg-current/40 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", variant.iconClassName)} />
        
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-medium text-sm">{title}</div>
          )}
          {description && (
            <div className="text-sm opacity-90 mt-1">{description}</div>
          )}
        </div>

        <button
          onClick={handleClose}
          className="flex-shrink-0 rounded-md p-1 hover:bg-current/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// Toast Container
export interface ToastContainerProps {
  toasts: ToastProps[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onRemove} />
      ))}
    </div>
  )
}

// Toast Hook
export function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback((toast: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { ...toast, id }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = React.useCallback((title: string, description?: string) => {
    addToast({ type: "success", title, description })
  }, [addToast])

  const error = React.useCallback((title: string, description?: string) => {
    addToast({ type: "error", title, description })
  }, [addToast])

  const warning = React.useCallback((title: string, description?: string) => {
    addToast({ type: "warning", title, description })
  }, [addToast])

  const info = React.useCallback((title: string, description?: string) => {
    addToast({ type: "info", title, description })
  }, [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
} 