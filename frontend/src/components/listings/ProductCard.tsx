import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { MapPin, Tag } from 'lucide-react'
import { ConditionBadge, StatusBadge } from '#/components/ui/Badge'
import type { Listing } from '#/types/listing'
import { FavoriteButton } from './FavoriteButton'
import { formatTitleCase, formatLocation } from '#/lib/utils'

interface ProductCardProps {
  listing: Listing
  viewMode?: 'grid' | 'list'
}

export function ProductCard({ listing, viewMode = 'grid' }: ProductCardProps) {
  const [imgFailed, setImgFailed] = React.useState(false)
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
  const primaryImage =
    !imgFailed && listing.images && listing.images.length > 0
      ? listing.images.find((img) => img.is_primary)?.url ||
        listing.images[0].url
      : null

  if (viewMode === 'list') {
    return (
      <div
        className={`group flex flex-col sm:flex-row bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xs transition-colors hover:border-zinc-400 dark:hover:border-zinc-600 overflow-hidden relative ${
          isSold ? 'opacity-80' : ''
        }`}
      >
        {/* Left Thumbnail */}
        <Link
          to="/products/$listingId"
          params={{ listingId: listing.id }}
          className="relative w-full sm:w-44 h-36 sm:h-auto bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-center sm:border-r border-b sm:border-b-0 border-zinc-200 dark:border-zinc-800 shrink-0 overflow-hidden block"
        >
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={listing.title}
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-150"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center text-zinc-400 dark:text-zinc-500">
              <Tag className="w-8 h-8 stroke-[1.5] mb-1 text-zinc-300 dark:text-zinc-600" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                {listing.category?.name || 'Item'}
              </span>
            </div>
          )}

          <div className="absolute top-2 left-2 flex items-center gap-1 z-10 pointer-events-none">
            <ConditionBadge condition={listing.condition} size="sm" />
            {isSold && <StatusBadge status={listing.status} size="sm" />}
          </div>
        </Link>

        {/* Content & Actions */}
        <div className="p-3.5 flex-1 flex flex-col justify-between gap-3 min-w-0">
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <Link
                to="/products/$listingId"
                params={{ listingId: listing.id }}
                className="block group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
              >
                <h3 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 hover:underline line-clamp-1">
                  {formatTitleCase(listing.title)}
                </h3>
              </Link>
              <div
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                <FavoriteButton listingId={listing.id} variant="badge" />
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 font-sans">
              {listing.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-zinc-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                <span>{formatLocation(listing.location)}</span>
              </span>
              <span>·</span>
              <span>Category: {listing.category?.name || 'General'}</span>
              <span>·</span>
              <span>Listed {formattedDate}</span>
              {listing.seller && (
                <>
                  <span>·</span>
                  <span>Seller: {listing.seller.username}</span>
                </>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span
                className={`font-mono font-bold text-base sm:text-lg ${
                  isSold
                    ? 'text-zinc-400 line-through'
                    : 'text-zinc-900 dark:text-zinc-100'
                }`}
              >
                {formattedPrice}
              </span>
              {!isSold && (
                <span className="text-[11px] font-mono text-zinc-500">
                  {(listing.quantity ?? 1) > 1
                    ? `${listing.quantity} in stock`
                    : '1 available'}
                </span>
              )}
            </div>

            <Link
              to="/products/$listingId"
              params={{ listingId: listing.id }}
              className="text-xs font-mono text-zinc-700 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:underline"
            >
              View details →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`group flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xs transition-colors hover:border-zinc-400 dark:hover:border-zinc-600 relative ${
        isSold ? 'opacity-80' : ''
      }`}
    >
      {/* Visual / Image Container */}
      <Link
        to="/products/$listingId"
        params={{ listingId: listing.id }}
        className="relative h-28 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-center border-b border-zinc-200 dark:border-zinc-800 overflow-hidden block"
      >
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={listing.title}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-150"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center text-zinc-400 dark:text-zinc-500">
            <Tag className="w-6 h-6 stroke-[1.5] mb-1 text-zinc-300 dark:text-zinc-600" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              {listing.category?.name || 'Item'}
            </span>
          </div>
        )}

        {/* Condition / Status Badge */}
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-10 pointer-events-none">
          <ConditionBadge condition={listing.condition} size="sm" />
          {isSold && <StatusBadge status={listing.status} size="sm" />}
        </div>

        {/* Favorite Action */}
        <div
          className="absolute top-1.5 right-1.5 z-10"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <FavoriteButton listingId={listing.id} variant="badge" />
        </div>
      </Link>

      {/* Content */}
      <Link
        to="/products/$listingId"
        params={{ listingId: listing.id }}
        className="p-3 flex flex-col flex-1 justify-between gap-2 block focus:outline-none"
      >
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
            {!isSold && (listing.quantity ?? 1) > 1 && (
              <span className="text-[10px] font-mono text-zinc-500">
                {listing.quantity} in stock
              </span>
            )}
          </div>

          <h3 className="font-medium text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1 group-hover:underline">
            {formatTitleCase(listing.title)}
          </h3>

          <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
            {listing.description}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1 min-w-0">
            <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
            <span className="truncate max-w-[110px]">
              {formatLocation(listing.location)}
            </span>
          </div>

          <span>{formattedDate}</span>
        </div>
      </Link>
    </div>
  )
}
