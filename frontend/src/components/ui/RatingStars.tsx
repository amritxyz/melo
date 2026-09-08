import * as React from 'react'
import { Star } from 'lucide-react'
import { cn } from '#/lib/utils'

interface RatingStarsProps {
  rating: number
  totalCount?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
  showScore?: boolean
  className?: string
}

export function RatingStars({
  rating,
  totalCount,
  size = 'md',
  interactive = false,
  onChange,
  showScore = true,
  className,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null)

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  }

  const effectiveRating = hoverRating !== null ? hoverRating : rating

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.round(effectiveRating)
          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange?.(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={cn(
                'transition-transform',
                interactive
                  ? 'cursor-pointer hover:scale-115 focus:outline-hidden'
                  : 'cursor-default pointer-events-none',
              )}
              aria-label={`${star} star`}
            >
              <Star
                className={cn(
                  starSizes[size],
                  'transition-colors',
                  isFilled
                    ? 'fill-amber-400 text-amber-400 dark:fill-amber-400 dark:text-amber-400'
                    : 'fill-transparent text-zinc-300 dark:text-zinc-700',
                )}
              />
            </button>
          )
        })}
      </div>

      {showScore && (
        <span
          className={cn(
            'font-semibold text-zinc-800 dark:text-zinc-200',
            size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm',
          )}
        >
          {rating > 0 ? rating.toFixed(1) : 'New'}
          {totalCount !== undefined && (
            <span className="font-normal text-zinc-500 dark:text-zinc-400 ml-1 text-xs">
              ({totalCount} {totalCount === 1 ? 'review' : 'reviews'})
            </span>
          )}
        </span>
      )}
    </div>
  )
}
