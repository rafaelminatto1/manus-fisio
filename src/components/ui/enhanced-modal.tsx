import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { EnhancedButton } from "./enhanced-button"

export interface EnhancedModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "full"
  showCloseButton?: boolean
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  className?: string
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg", 
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-7xl"
}

export function EnhancedModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className
}: EnhancedModalProps) {
  const [mounted, setMounted] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      document.body.style.overflow = 'hidden'
    } else {
      setIsVisible(false)
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  React.useEffect(() => {
    if (!closeOnEscape) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, closeOnEscape])

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose()
    }
  }

  if (!mounted || !isOpen) return null

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full bg-background border border-border rounded-xl shadow-2xl transition-all duration-300 max-h-[90vh] overflow-hidden",
          sizeClasses[size],
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-description" : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex-1">
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold text-foreground">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <EnhancedButton
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                className="ml-4 hover:bg-muted"
                aria-label="Fechar modal"
              >
                <X className="h-4 w-4" />
              </EnhancedButton>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

// Modal Content Components
export function EnhancedModalContent({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  )
}

export function EnhancedModalFooter({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={cn("flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30", className)}>
      {children}
    </div>
  )
}

// Confirmation Modal
export interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  loading?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  loading = false
}: ConfirmationModalProps) {
  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
    >
      <EnhancedModalFooter>
        <EnhancedButton
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </EnhancedButton>
        <EnhancedButton
          variant={variant === "destructive" ? "error" : "medical"}
          onClick={onConfirm}
          loading={loading}
          loadingText="Processando..."
        >
          {confirmText}
        </EnhancedButton>
      </EnhancedModalFooter>
    </EnhancedModal>
  )
} 