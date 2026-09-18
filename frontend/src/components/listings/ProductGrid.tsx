import { Search, RotateCcw } from 'lucide-react'
import { ProductCard } from './ProductCard'
import type { Listing, Category } from '#/types/listing'

interface ProductGridProps {
  listings: Listing[]
  isLoading?: boolean
  emptyMessage?: string
  viewMode?: 'grid' | 'list'
  onResetFilters?: () => void
  categories?: Category[]
  onSelectCategory?: (id: string) => void
}

export function ProductGrid({
  listings,
  isLoading = false,
  emptyMessage = 'No listings found.',
  viewMode = 'grid',
  onResetFilters,
  categories,
  onSelectCategory,
}: ProductGridProps) {
  if (isLoading) {
    if (viewMode === 'list') {
      return (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row bg-white dark:bg-zinc-900 rounded-none border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-pulse"
            >
              <div className="w-full sm:w-44 h-32 bg-zinc-100 dark:bg-zinc-800 shrink-0" />
              <div className="p-3.5 flex-1 space-y-2.5">
                <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-none w-1/3" />
                <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-none w-3/4" />
                <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-none w-1/2" />
                <div className="pt-2 flex justify-between">
                  <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-none w-1/5" />
                  <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-none w-1/6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col bg-white dark:bg-zinc-900 rounded-none border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-pulse"
          >
            <div className="h-28 bg-zinc-100 dark:bg-zinc-800" />
            <div className="p-3 space-y-2">
              <div className="h-3.5 bg-zinc-100 dark:bg-zinc-800 rounded-none w-1/3" />
              <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-none w-3/4" />
              <div className="pt-1 flex justify-between">
                <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-none w-1/4" />
                <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-none w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="py-12 px-6 text-center rounded-none border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-4">
        <div className="w-10 h-10 mx-auto rounded-none border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-400">
          <Search className="w-5 h-5 stroke-[1.5]" />
        </div>

        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-sm font-bold font-mono uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
            No listings found
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans">
            {emptyMessage ||
              'We could not find any active items matching your search or filters. Try adjusting keywords or clearing filters.'}
          </p>
        </div>

        {onResetFilters && (
          <div className="pt-1">
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-zinc-300 dark:border-zinc-700 rounded-none bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-zinc-800 dark:text-zinc-200"
            >
              <RotateCcw className="w-3 h-3 text-zinc-500" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}

        {categories && categories.length > 0 && onSelectCategory && (
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 max-w-md mx-auto">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-2">
              Browse Popular Categories
            </span>
            <div className="flex flex-wrap justify-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className="px-2 py-1 text-xs font-mono border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-none hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer text-zinc-700 dark:text-zinc-300"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={
        viewMode === 'list'
          ? 'space-y-3'
          : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4'
      }
    >
      {listings.map((listing) => (
        <ProductCard key={listing.id} listing={listing} viewMode={viewMode} />
      ))}
    </div>
  )
}
