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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-pulse"
          >
            <div className="h-44 bg-zinc-200 dark:bg-zinc-800" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-sm w-1/3" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-sm w-3/4" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-sm w-full" />
              <div className="pt-2 flex justify-between">
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-sm w-1/4" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-sm w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="py-16 text-center rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <ProductCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
