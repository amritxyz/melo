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
    'inline-flex items-center font-mono rounded-xs border transition-colors leading-none'

  const variants = {
    default:
      'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700',
    success:
      'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    warning:
      'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    danger:
      'bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300 border-red-300 dark:border-red-800',
    secondary:
      'bg-zinc-50 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800',
    outline:
      'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-transparent',
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
  const labels: Record<
    ListingCondition,
    { text: string; variant: BadgeProps['variant'] }
  > = {
    new: { text: 'New', variant: 'success' },
    like_new: { text: 'Like New', variant: 'default' },
    good: { text: 'Good', variant: 'secondary' },
    fair: { text: 'Fair', variant: 'warning' },
    poor: { text: 'Poor', variant: 'danger' },
  }

  const { text, variant } = labels[condition]
  return (
    <Badge variant={variant} size={size} className={className}>
      {text}
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
    active: { text: 'Active', variant: 'success' },
    sold: { text: 'Sold', variant: 'danger' },
    hidden: { text: 'Hidden', variant: 'secondary' },
  }

  const { text, variant } = labels[status]
  return (
    <Badge variant={variant} size={size} className={className}>
      {text}
    </Badge>
  )
}
