import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2, Heart, Activity, Zap } from "lucide-react"

// Skeleton Components
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/50",
        className
      )}
      {...props}
    />
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-card p-6 shadow-sm", className)}>
      <div className="space-y-3">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[180px]" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="p-4 border-b">
        <Skeleton className="h-6 w-[200px]" />
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-4">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-card p-6", className)}>
      <div className="space-y-4">
        <Skeleton className="h-6 w-[150px]" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-end space-x-2">
              <Skeleton 
                className="w-8 bg-primary/20" 
                style={{ height: `${Math.random() * 60 + 20}px` }}
              />
              <Skeleton 
                className="w-8 bg-emerald-500/20" 
                style={{ height: `${Math.random() * 60 + 20}px` }}
              />
              <Skeleton 
                className="w-8 bg-amber-500/20" 
                style={{ height: `${Math.random() * 60 + 20}px` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Loading Spinner Variants
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "medical" | "dots" | "pulse"
  className?: string
}

export function LoadingSpinner({ 
  size = "md", 
  variant = "default", 
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  }

  if (variant === "medical") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <Heart className={cn(
          sizeClasses[size],
          "text-medical-500 animate-pulse"
        )} />
      </div>
    )
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex space-x-1", className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full bg-primary",
              size === "sm" && "h-2 w-2",
              size === "md" && "h-3 w-3",
              size === "lg" && "h-4 w-4",
              size === "xl" && "h-6 w-6"
            )}
            style={{
              animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both`
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className={cn(
        sizeClasses[size],
        "text-primary animate-spin"
      )} />
    </div>
  )
}

// Full Page Loading
interface PageLoadingProps {
  title?: string
  description?: string
  variant?: "default" | "medical" | "minimal"
}

export function PageLoading({ 
  title = "Carregando...", 
  description,
  variant = "default" 
}: PageLoadingProps) {
  if (variant === "minimal") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (variant === "medical") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-medical-200 border-t-medical-500 animate-spin" />
          <Heart className="absolute inset-0 m-auto h-6 w-6 text-medical-500" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className="h-6 w-6 text-primary animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
        <div className="flex justify-center space-x-1 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1 w-8 bg-primary/30 rounded-full overflow-hidden"
            >
              <div 
                className="h-full bg-primary rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.5s'
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Loading Button State
interface LoadingButtonProps {
  loading?: boolean
  children: React.ReactNode
  className?: string
  variant?: "default" | "medical"
}

export function LoadingButton({ 
  loading, 
  children, 
  className,
  variant = "default"
}: LoadingButtonProps) {
  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "transition-opacity duration-200",
        loading && "opacity-0"
      )}>
        {children}
      </div>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner 
            size="sm" 
            variant={variant === "medical" ? "medical" : "default"} 
          />
        </div>
      )}
    </div>
  )
}

// Loading Overlay
interface LoadingOverlayProps {
  loading: boolean
  children: React.ReactNode
  loadingText?: string
  variant?: "default" | "blur"
}

export function LoadingOverlay({ 
  loading, 
  children, 
  loadingText = "Carregando...",
  variant = "default"
}: LoadingOverlayProps) {
  return (
    <div className="relative">
      <div className={cn(
        "transition-all duration-300",
        loading && variant === "blur" && "blur-sm",
        loading && "pointer-events-none"
      )}>
        {children}
      </div>
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-lg">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-muted-foreground">{loadingText}</p>
        </div>
      )}
    </div>
  )
}

// Progress Loading
interface ProgressLoadingProps {
  progress: number
  title?: string
  description?: string
  className?: string
}

export function ProgressLoading({ 
  progress, 
  title = "Processando...", 
  description,
  className 
}: ProgressLoadingProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-center space-y-2">
        <h3 className="font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progresso</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
} 