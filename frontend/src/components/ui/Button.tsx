import * as React from 'react'
import { cn } from '#/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-mono font-medium rounded-none transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none cursor-pointer'

    const variants = {
      primary:
        'bg-primary text-primary-foreground hover:bg-primary/90 active:opacity-80 border border-primary',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border',
      outline: 'border border-border bg-card hover:bg-muted text-foreground',
      ghost:
        'hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent',
      danger:
        'border border-destructive text-destructive bg-transparent hover:bg-destructive/10 dark:hover:bg-destructive/20',
    }

    const sizes = {
      sm: 'h-7 px-2.5 text-xs',
      md: 'h-8 px-3 text-xs',
      lg: 'h-9 px-4 text-sm',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-current"
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
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
