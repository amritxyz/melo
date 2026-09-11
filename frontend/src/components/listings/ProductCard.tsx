import { Link } from '@tanstack/react-router'
import { MapPin, Tag } from 'lucide-react'
import { ConditionBadge, StatusBadge } from '#/components/ui/Badge'
import type { Listing } from '#/types/listing'
import { FavoriteButton } from './FavoriteButton'

interface ProductCardProps {
  listing: Listing
}

export function ProductCard({ listing }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    maximumFractionDigits: 0,
  }).format(listing.price)

  const formattedDate = new Date(listing.created_at).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
    },
  )

  const isSold = listing.status === 'sold'

  return (
    <div
      className={`group flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xs transition-colors hover:border-zinc-400 dark:hover:border-zinc-600 relative ${
        isSold ? 'opacity-80' : ''
      }`}
    >
      {/* Visual / Tag Container */}
      <div className="relative h-28 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-center border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col items-center text-zinc-400 dark:text-zinc-500">
          <Tag className="w-6 h-6 stroke-[1.5] mb-1 text-zinc-300 dark:text-zinc-600" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            {listing.category?.name || 'Item'}
          </span>
        </div>

        {/* Condition / Status Badge */}
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-10">
          <ConditionBadge condition={listing.condition} size="sm" />
          {isSold && <StatusBadge status={listing.status} size="sm" />}
        </div>

        {/* Favorite Action */}
        <div className="absolute top-1.5 right-1.5 z-10">
          <FavoriteButton listingId={listing.id} variant="badge" />
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-2">
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <span
              className={`font-mono font-bold text-xs sm:text-sm ${
                isSold
                  ? 'text-zinc-400 line-through'
                  : 'text-zinc-900 dark:text-zinc-100'
              }`}
            >
              {formattedPrice}
            </span>
          </div>

          <Link
            to="/products/$listingId"
            params={{ listingId: listing.id }}
            className="block"
          >
            <h3 className="font-medium text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1 hover:underline">
              {listing.title}
            </h3>
          </Link>

          <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
            {listing.description}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1 min-w-0">
            <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
            <span className="truncate max-w-[110px]">{listing.location}</span>
          </div>

          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  )
}
