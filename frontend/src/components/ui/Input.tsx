import * as React from 'react'
import { cn } from '#/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId =
      id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'flex h-8 w-full rounded-none border bg-card px-2.5 py-1 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            error
              ? 'border-destructive focus:border-destructive'
              : 'border-input',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-destructive font-mono">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-zinc-500">{helperText}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
