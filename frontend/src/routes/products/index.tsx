import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Search, RotateCcw, Filter, X } from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { ProductGrid } from '#/components/listings/ProductGrid'
import { Navbar } from '#/components/layout/Navbar'
import { useCategories, useListings } from '#/hooks/useListings'
import type { ListingCondition } from '#/types/listing'

export const Route = createFileRoute('/products/')({
  component: ProductsPage,
})

type SortOption = 'newest' | 'price_asc' | 'price_desc'

function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('')
  const [selectedCondition, setSelectedCondition] =
    React.useState<string>('all')
  const [sortBy, setSortBy] = React.useState<SortOption>('newest')
  const [searchQuery, setSearchQuery] = React.useState<string>('')
  const [debouncedSearch, setDebouncedSearch] = React.useState<string>('')
  const [page, setPage] = React.useState<number>(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false)

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: categories = [], isLoading: loadingCategories } =
    useCategories()

  const { data, isLoading } = useListings({
    page,
    limit: 16,
    category_id: selectedCategory || undefined,
    search: debouncedSearch || undefined,
  })

  const rawListings = data?.listings || []
  const total = data?.pagination.total || 0
  const totalPages = Math.ceil(total / 16) || 1

  // Client-side condition filter and sorting
  const listings = React.useMemo(() => {
    let list = [...rawListings]

    if (selectedCondition !== 'all') {
      list = list.filter(
        (item) => item.condition === (selectedCondition as ListingCondition),
      )
    }

    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.price - a.price)
    } else {
      list.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    }

    return list
  }, [rawListings, selectedCondition, sortBy])

  const handleReset = () => {
    setSelectedCategory('')
    setSelectedCondition('all')
    setSortBy('newest')
    setSearchQuery('')
    setDebouncedSearch('')
    setPage(1)
  }

  const hasFilters =
    selectedCategory !== '' ||
    selectedCondition !== 'all' ||
    sortBy !== 'newest' ||
    debouncedSearch !== ''

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      <Navbar />

      {/* Header Bar */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-sm font-bold font-mono uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              Browse Marketplace
            </h1>
            <p className="text-[11px] font-mono text-zinc-500">
              Directory of pre-owned products offered by local sellers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            className="md:hidden flex items-center gap-1.5 px-2.5 py-1 text-xs border border-zinc-300 dark:border-zinc-700 rounded-xs bg-white dark:bg-zinc-900 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Sidebar Filters */}
          <aside
            className={`md:col-span-1 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 p-3 rounded-xs space-y-4 text-xs ${
              mobileFiltersOpen ? 'block mb-4' : 'hidden md:block'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <span className="font-mono font-bold uppercase text-[11px] text-zinc-700 dark:text-zinc-300">
                Filters
              </span>
              {hasFilters && (
                <button
                  onClick={handleReset}
                  className="font-mono text-[10px] text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <span className="font-mono text-[11px] font-semibold text-zinc-500 uppercase block mb-1.5">
                Category
              </span>
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setSelectedCategory('')
                    setPage(1)
                  }}
                  className={`w-full text-left px-2 py-1 rounded-xs transition-colors cursor-pointer flex items-center justify-between ${
                    selectedCategory === ''
                      ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 font-semibold'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <span>All Categories</span>
                </button>
                {!loadingCategories &&
                  categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id)
                        setPage(1)
                      }}
                      className={`w-full text-left px-2 py-1 rounded-xs transition-colors cursor-pointer flex items-center justify-between ${
                        selectedCategory === cat.id
                          ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 font-semibold'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Condition Filter */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <span className="font-mono text-[11px] font-semibold text-zinc-500 uppercase block mb-1.5">
                Condition
              </span>
              <div className="space-y-0.5">
                {[
                  { id: 'all', label: 'Any Condition' },
                  { id: 'new', label: 'New' },
                  { id: 'like_new', label: 'Like New' },
                  { id: 'good', label: 'Good' },
                  { id: 'fair', label: 'Fair' },
                  { id: 'poor', label: 'Poor' },
                ].map((cond) => (
                  <button
                    key={cond.id}
                    onClick={() => setSelectedCondition(cond.id)}
                    className={`w-full text-left px-2 py-1 rounded-xs transition-colors cursor-pointer flex items-center justify-between ${
                      selectedCondition === cond.id
                        ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 font-semibold'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <span>{cond.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <span className="font-mono text-[11px] font-semibold text-zinc-500 uppercase block mb-1.5">
                Sort by
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full h-8 px-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xs text-zinc-900 dark:text-zinc-100 cursor-pointer"
              >
                <option value="newest">Newest first</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </aside>

          {/* Results Main Column */}
          <div className="md:col-span-3 space-y-4">
            {/* Search Bar & Stats Header */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="search"
                  placeholder="Filter listings by keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="text-xs font-mono text-zinc-500 shrink-0 self-center">
                [{total} {total === 1 ? 'result' : 'results'}]
              </div>
            </div>

            {/* Active Filters Bar */}
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-zinc-400 font-mono text-[10px]">
                  active:
                </span>
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono">
                    cat:{' '}
                    {categories.find((c) => c.id === selectedCategory)?.name}
                    <button
                      onClick={() => setSelectedCategory('')}
                      className="hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCondition !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono">
                    cond: {selectedCondition}
                    <button
                      onClick={() => setSelectedCondition('all')}
                      className="hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {debouncedSearch && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono">
                    query: &quot;{debouncedSearch}&quot;
                    <button
                      onClick={() => setSearchQuery('')}
                      className="hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Listings Grid */}
            <ProductGrid
              listings={listings}
              isLoading={isLoading}
              emptyMessage={
                hasFilters
                  ? 'No listings found matching current filters.'
                  : 'No listings posted in the marketplace.'
              }
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => {
                    setPage((p) => Math.max(p - 1, 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  ← Previous
                </Button>
                <span className="text-zinc-500">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => {
                    setPage((p) => p + 1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  Next →
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
