import { Link } from '@tanstack/react-router'
import { MapPin, Calendar, Tag } from 'lucide-react'
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
    <Link
      to="/products/$listingId"
      params={{ listingId: listing.id }}
      className={`group flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-200 ${
        isSold ? 'opacity-90' : ''
      }`}
    >
      {/* Visual Placeholder / Future Image Container */}
      <div className="relative h-44 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex flex-col items-center text-zinc-400 dark:text-zinc-500">
          <Tag className="w-8 h-8 stroke-[1.5] mb-1" />
          <span className="text-xs font-medium">
            {listing.category?.name || 'Item'}
          </span>
        </div>

        {/* Condition / Status Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <ConditionBadge condition={listing.condition} />
          {isSold && <StatusBadge status={listing.status} />}
        </div>

        {/* Favorite Heart Toggle */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <FavoriteButton listingId={listing.id} variant="badge" />
        </div>

        {/* Sold Overlay Banner */}
        {isSold && (
          <div className="absolute inset-0 bg-zinc-950/30 backdrop-blur-[1px] flex items-center justify-center">
            <span className="px-3 py-1 rounded-md bg-red-600/90 text-white font-black text-xs tracking-widest uppercase shadow-md border border-red-500">
              SOLD
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <span
              className={`text-lg font-bold ${
                isSold
                  ? 'text-zinc-400 dark:text-zinc-500 line-through'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {formattedPrice}
            </span>
          </div>

          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
            {listing.title}
          </h3>

          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
            {listing.description}
          </p>
        </div>

        {/* Footer meta */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
            <span className="line-clamp-1">{listing.location}</span>
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
