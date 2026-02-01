import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// ============================================
// BUTTON VARIANTS
// ============================================

const buttonVariants = cva(
    // Base styles
    "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
    {
        variants: {
            variant: {
                // Primary - Deep Orange
                default: 
                    "bg-primary text-primary-foreground shadow-lg shadow-primary/20 " +
                    "hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 " +
                    "border border-transparent",
                
                // Secondary - Dark Metallic
                secondary: 
                    "bg-secondary text-secondary-foreground " +
                    "hover:bg-secondary/80 " +
                    "border border-border/50",
                
                // Outline - Bordered
                outline: 
                    "border border-border bg-transparent " +
                    "hover:bg-secondary/50 hover:text-foreground " +
                    "text-muted-foreground",
                
                // Ghost - Minimal
                ghost: 
                    "hover:bg-secondary/50 hover:text-foreground " +
                    "text-muted-foreground bg-transparent",
                
                // Destructive - Red
                destructive: 
                    "bg-red-500 text-white shadow-lg shadow-red-500/20 " +
                    "hover:bg-red-400 hover:shadow-xl hover:shadow-red-500/30",
                
                // Success - Green
                success: 
                    "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 " +
                    "hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-500/30",
                
                // Warning - Amber
                warning: 
                    "bg-amber-500 text-white shadow-lg shadow-amber-500/20 " +
                    "hover:bg-amber-400 hover:shadow-xl hover:shadow-amber-500/30",
                
                // Trading Buy
                "trading-buy": 
                    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 " +
                    "hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20",
                
                // Trading Sell
                "trading-sell": 
                    "bg-red-500/10 text-red-400 border border-red-500/50 " +
                    "hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20",
                
                // Link
                link: 
                    "text-primary underline-offset-4 hover:underline " +
                    "bg-transparent shadow-none",
                
                // Neon Glow
                neon: 
                    "bg-primary text-primary-foreground " +
                    "shadow-[0_0_10px_hsl(var(--primary)/0.5),0_0_20px_hsl(var(--primary)/0.3)] " +
                    "hover:shadow-[0_0_20px_hsl(var(--primary)/0.6),0_0_40px_hsl(var(--primary)/0.4)]",
                
                // Glass
                glass: 
                    "bg-card/50 backdrop-blur-md border border-border/50 " +
                    "text-foreground hover:bg-card/70 hover:border-border",
            },
            size: {
                default: "h-10 px-4 py-2",
                xs: "h-6 px-2 text-2xs",
                sm: "h-8 rounded-sm px-3 text-xs",
                lg: "h-12 rounded-sm px-6 text-base",
                xl: "h-14 rounded-sm px-8 text-lg",
                icon: "h-10 w-10",
                "icon-sm": "h-8 w-8",
                "icon-lg": "h-12 w-12",
            },
            rounded: {
                none: "rounded-none",
                sm: "rounded-sm",
                default: "rounded-sm",
                md: "rounded-md",
                lg: "rounded-lg",
                full: "rounded-full",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            rounded: "default",
        },
    }
)

// ============================================
// BUTTON INTERFACE
// ============================================

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
    loading?: boolean
}

// ============================================
// BUTTON COMPONENT
// ============================================

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, rounded, asChild = false, loading = false, children, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, rounded, className }))}
                ref={ref}
                disabled={props.disabled || loading}
                {...props}
            >
                {loading ? (
                    <>
                        <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        <span>Loading...</span>
                    </>
                ) : (
                    children
                )}
            </Comp>
        )
    }
)
Button.displayName = "Button"

// ============================================
// ICON BUTTON COMPONENT
// ============================================

interface IconButtonProps extends Omit<ButtonProps, 'size'> {
    icon: React.ReactNode
    label?: string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ icon, label, className, variant = "ghost", ...props }, ref) => (
        <Button
            ref={ref}
            variant={variant}
            size="icon"
            className={cn("relative", className)}
            {...props}
        >
            {icon}
            {label && (
                <span className="sr-only">{label}</span>
            )}
        </Button>
    )
)
IconButton.displayName = "IconButton"

// ============================================
// EXPORT
// ============================================

export { Button, buttonVariants, IconButton }
