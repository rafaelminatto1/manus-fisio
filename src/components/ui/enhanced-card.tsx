import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const enhancedCardVariants = cva(
  "rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "hover:shadow-lg hover:-translate-y-1",
        elevated: "shadow-lg hover:shadow-xl hover:-translate-y-2",
        flat: "shadow-none border-2 hover:border-primary/50",
        glass: "bg-white/10 backdrop-blur-md border-white/20 shadow-xl",
        gradient: "bg-gradient-to-br from-card to-card/80 hover:from-card/90 hover:to-card/70",
        medical: "border-medical-200 bg-gradient-to-br from-medical-50 to-white hover:shadow-medical-200/50 hover:shadow-lg",
        interactive: "cursor-pointer hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
      },
      size: {
        sm: "p-3",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
      animation: {
        none: "",
        fade: "animate-fade-in-up",
        slide: "animate-slide-in-right",
        scale: "animate-scale-in",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
)

export interface EnhancedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof enhancedCardVariants> {
  loading?: boolean
  loadingText?: string
  disabled?: boolean
  asChild?: boolean
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant, size, animation, loading, loadingText, disabled, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        enhancedCardVariants({ variant, size, animation, className }),
        disabled && "opacity-50 pointer-events-none",
        loading && "relative overflow-hidden"
      )}
      {...props}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            {loadingText && (
              <p className="text-sm text-muted-foreground">{loadingText}</p>
            )}
          </div>
        </div>
      )}
      
      {/* Card Content */}
      <div className={cn("relative", loading && "opacity-50")}>
        {children}
      </div>
    </div>
  )
)
EnhancedCard.displayName = "EnhancedCard"

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { centered?: boolean }
>(({ className, centered, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6",
      centered && "items-center text-center",
      className
    )}
    {...props}
  />
))
EnhancedCardHeader.displayName = "EnhancedCardHeader"

const EnhancedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { 
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    gradient?: boolean
  }
>(({ className, as: Component = "h3", gradient, children, ...props }, ref) => (
  <Component
    ref={ref}
    className={cn(
      "font-semibold leading-none tracking-tight",
      gradient && "bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent",
      className
    )}
    {...props}
  >
    {children}
  </Component>
))
EnhancedCardTitle.displayName = "EnhancedCardTitle"

const EnhancedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
))
EnhancedCardDescription.displayName = "EnhancedCardDescription"

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
EnhancedCardContent.displayName = "EnhancedCardContent"

const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { centered?: boolean }
>(({ className, centered, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0",
      centered && "justify-center",
      className
    )}
    {...props}
  />
))
EnhancedCardFooter.displayName = "EnhancedCardFooter"

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
} 