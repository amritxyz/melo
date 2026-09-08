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
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border font-medium text-sm transition-all duration-150 active:scale-98 ${
          favorited
            ? 'border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40'
            : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 hover:text-zinc-900 dark:hover:text-zinc-100'
        } ${className}`}
        aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
      >
        <Heart
          className={`w-4 h-4 transition-transform duration-200 ${
            favorited
              ? 'fill-red-500 text-red-500 scale-110'
              : 'text-current stroke-[2]'
          }`}
        />
        <span>{favorited ? 'Saved to Favorites' : 'Save to Favorites'}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={toggleMutation.isPending}
      className={`p-2 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-200 z-20 ${className}`}
      aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
      title={favorited ? 'Remove from favorites' : 'Save to favorites'}
    >
      <Heart
        className={`w-4 h-4 transition-all duration-200 ${
          favorited
            ? 'fill-red-500 text-red-500 scale-110 animate-in zoom-in-75'
            : 'text-zinc-400 hover:text-red-500 stroke-[2]'
        }`}
      />
    </button>
  )
}
