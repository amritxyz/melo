import { ProductCard } from './ProductCard'
import type { Listing } from '#/types/listing'

interface ProductGridProps {
  listings: Listing[]
  isLoading?: boolean
  emptyMessage?: string
}

export function ProductGrid({
  listings,
  isLoading = false,
  emptyMessage = 'No listings found.',
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col bg-white dark:bg-zinc-900 rounded-xs border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-pulse"
          >
            <div className="h-28 bg-zinc-100 dark:bg-zinc-800" />
            <div className="p-3 space-y-2">
              <div className="h-3.5 bg-zinc-100 dark:bg-zinc-800 rounded-xs w-1/3" />
              <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-xs w-3/4" />
              <div className="pt-1 flex justify-between">
                <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xs w-1/4" />
                <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xs w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="py-12 text-center rounded-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      {listings.map((listing) => (
        <ProductCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
