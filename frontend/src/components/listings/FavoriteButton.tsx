import { useNavigate } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import type React from 'react'
import { useAuth } from '#/hooks/useAuth'
import { useFavoriteIds, useToggleFavorite } from '#/hooks/useFavorites'

interface FavoriteButtonProps {
  listingId: string
  variant?: 'badge' | 'button'
  className?: string
}

export function FavoriteButton({
  listingId,
  variant = 'badge',
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
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={toggleMutation.isPending}
        className={`flex items-center justify-center gap-1.5 h-8 px-3 rounded-sm border font-medium text-xs transition-colors cursor-pointer ${
          favorited
            ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100'
            : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
        } ${className}`}
        aria-label={favorited ? 'Remove from wishlist' : 'Save to wishlist'}
      >
        <Heart
          className={`w-3.5 h-3.5 ${
            favorited ? 'fill-red-500 text-red-500' : 'text-zinc-400 stroke-[2]'
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
      className={`p-1 rounded-xs border transition-colors z-10 cursor-pointer ${
        favorited
          ? 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-800 text-red-600'
          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:border-zinc-400'
      } ${className}`}
      aria-label={favorited ? 'Remove from wishlist' : 'Save to wishlist'}
      title={favorited ? 'Remove from wishlist' : 'Save to wishlist'}
    >
      <Heart
        className={`w-3.5 h-3.5 ${
          favorited ? 'fill-red-500 text-red-500' : 'stroke-[2]'
        }`}
      />
    </button>
  )
}
