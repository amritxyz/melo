import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { ProductGrid } from '#/components/listings/ProductGrid'
import { Navbar } from '#/components/layout/Navbar'
import { useCategories, useListings } from '#/hooks/useListings'

export const Route = createFileRoute('/products/')({
  component: ProductsPage,
})

function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('')
  const [searchQuery, setSearchQuery] = React.useState<string>('')
  const [debouncedSearch, setDebouncedSearch] = React.useState<string>('')
  const [page, setPage] = React.useState<number>(1)

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: categories = [], isLoading: loadingCategories } =
    useCategories()

  const { data, isLoading } = useListings({
    page,
    limit: 12,
    category_id: selectedCategory || undefined,
    search: debouncedSearch || undefined,
  })

  const listings = data?.listings || []
  const total = data?.pagination.total || 0
  const totalPages = Math.ceil(total / 12) || 1

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Navbar />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Browse Marketplace
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Find pre-loved items from verified sellers in your community.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="search"
              placeholder="Search phones, bikes, furniture..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
          </div>
        </div>
        {/* Categories Bar */}
        <div className="mb-8 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedCategory('')
                setPage(1)
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors shrink-0 ${
                selectedCategory === ''
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              All Items
            </button>

            {!loadingCategories &&
              categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id)
                    setPage(1)
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
          </div>
        </div>

        {/* Listings Header & Status Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name ||
                  'Category'
                : 'Marketplace Listings'}
            </h1>
            <span className="text-xs text-zinc-500">
              {total} {total === 1 ? 'item' : 'items'} found
            </span>
          </div>
        </div>

        {/* Listings Grid */}
        <ProductGrid
          listings={listings}
          isLoading={isLoading}
          emptyMessage={
            debouncedSearch || selectedCategory
              ? 'No listings found matching your search criteria.'
              : 'No listings posted yet. Be the first to sell something!'
          }
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </Button>
            <span className="text-xs text-zinc-500">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
