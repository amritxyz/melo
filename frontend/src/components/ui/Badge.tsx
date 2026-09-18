import * as React from 'react'
import { cn } from '#/lib/utils'
import type { ListingCondition, ListingStatus } from '#/types/listing'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    'default' | 'success' | 'warning' | 'secondary' | 'outline' | 'danger'
  size?: 'sm' | 'md'
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    'inline-flex items-center font-mono rounded-none border transition-colors leading-none bg-transparent dark:bg-transparent'

  const variants = {
    default:
      'border-zinc-400 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100',
    success:
      'border-zinc-400 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100',
    warning:
      'border-zinc-400 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100',
    danger:
      'border-red-700/80 dark:border-red-600/80 text-red-700 dark:text-red-400',
    secondary:
      'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300',
    outline:
      'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300',
  }

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-[11px]',
  }

  return (
    <span
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  )
}

export function ConditionBadge({
  condition,
  size,
  className,
}: {
  condition: ListingCondition
  size?: BadgeProps['size']
  className?: string
}) {
  const labels: Record<ListingCondition, string> = {
    new: 'New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
  }

  return (
    <Badge
      variant="default"
      size={size}
      className={cn(
        'bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 border-zinc-400 dark:border-zinc-600',
        className,
      )}
    >
      {labels[condition]}
    </Badge>
  )
}

export function StatusBadge({
  status,
  size,
  className,
}: {
  status: ListingStatus
  size?: BadgeProps['size']
  className?: string
}) {
  const labels: Record<
    ListingStatus,
    { text: string; variant: BadgeProps['variant'] }
  > = {
    active: { text: 'Active', variant: 'default' },
    sold: { text: 'Sold', variant: 'danger' },
    hidden: { text: 'Hidden', variant: 'secondary' },
  }

  const { text, variant } = labels[status]
  return (
    <Badge
      variant={variant}
      size={size}
      className={cn('bg-white/90 dark:bg-zinc-900/90', className)}
    >
      {text}
    </Badge>
  )
}
