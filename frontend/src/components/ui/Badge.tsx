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
    'inline-flex items-center font-medium rounded-full transition-colors'

  const variants = {
    default:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60',
    success:
      'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 border border-green-200/60 dark:border-green-800/60',
    warning:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60',
    danger:
      'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200/60 dark:border-red-800/60',
    secondary:
      'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700',
    outline:
      'border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
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

export function ConditionBadge({ condition }: { condition: ListingCondition }) {
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
  return <Badge variant={variant}>{text}</Badge>
}

export function StatusBadge({ status }: { status: ListingStatus }) {
  const labels: Record<
    ListingStatus,
    { text: string; variant: BadgeProps['variant'] }
  > = {
    active: { text: 'Active', variant: 'success' },
    sold: { text: 'Sold', variant: 'danger' },
    hidden: { text: 'Hidden', variant: 'secondary' },
  }

  const { text, variant } = labels[status]
  return <Badge variant={variant}>{text}</Badge>
}
