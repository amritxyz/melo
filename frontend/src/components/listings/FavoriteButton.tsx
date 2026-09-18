import { useNavigate } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import type React from 'react'
import { useAuth } from '#/hooks/useAuth'
import { useFavoriteIds, useToggleFavorite } from '#/hooks/useFavorites'
import { cn } from '#/lib/utils'

interface FavoriteButtonProps {
  listingId: string
  variant?: 'badge' | 'button'
  size?: 'sm' | 'md'
  className?: string
}

export function FavoriteButton({
  listingId,
  variant = 'badge',
  size = 'sm',
  className = '',
}: FavoriteButtonProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isFavorited } = useFavoriteIds()
  const toggleMutation = useToggleFavorite()

  const favorited = isFavorited(listingId)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      navigate({ to: '/login' })
      return
    }

    toggleMutation.mutate(listingId)
  }

  if (variant === 'button') {
    const sizeClasses = {
      sm: 'h-7 px-2.5 text-xs',
      md: 'h-8 px-3 text-xs',
    }

    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={toggleMutation.isPending}
        className={cn(
          'flex items-center justify-center gap-1.5 rounded-none border font-mono font-medium transition-colors cursor-pointer',
          sizeClasses[size],
          favorited
            ? 'border-destructive bg-transparent text-destructive'
            : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground',
          className,
        )}
        aria-label={favorited ? 'Remove from wishlist' : 'Save to wishlist'}
      >
        <Heart
          className={`w-3.5 h-3.5 ${
            favorited
              ? 'fill-destructive text-destructive'
              : 'text-muted-foreground stroke-[2]'
          }`}
        />
        <span>{favorited ? 'Wishlisted' : 'Save to Wishlist'}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={toggleMutation.isPending}
      className={`min-w-[28px] min-h-[28px] flex items-center justify-center p-1 rounded-none border transition-colors z-10 cursor-pointer ${
        favorited
          ? 'bg-card/90 border-destructive text-destructive'
          : 'bg-card/90 border-border text-muted-foreground hover:text-foreground hover:border-zinc-500'
      } ${className}`}
      aria-label={favorited ? 'Remove from wishlist' : 'Save to wishlist'}
      title={favorited ? 'Remove from wishlist' : 'Save to wishlist'}
    >
      <Heart
        className={`w-3.5 h-3.5 ${
          favorited ? 'fill-destructive text-destructive' : 'stroke-[2]'
        }`}
      />
    </button>
  )
}
