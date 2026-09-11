import * as React from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Search, Plus, RotateCcw } from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { ProductGrid } from '#/components/listings/ProductGrid'
import { Navbar } from '#/components/layout/Navbar'
import { useCategories, useListings } from '#/hooks/useListings'
import { useAuth } from '#/hooks/useAuth'
import { useUserProfile } from '#/hooks/useUser'

export const Route = createFileRoute('/')({ component: Home })

type SortOption = 'newest' | 'price_asc' | 'price_desc'

function Home() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { data: profile } = useUserProfile(user?.id)
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories()

  const [searchQuery, setSearchQuery] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<string>('')
  const [selectedCondition, setSelectedCondition] =
    React.useState<string>('all')
  const [sortBy, setSortBy] = React.useState<SortOption>('newest')
  const [page, setPage] = React.useState<number>(1)

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data, isLoading: listingsLoading } = useListings({
    page,
    limit: 16,
    category_id: selectedCategory || undefined,
    search: debouncedSearch || undefined,
  })

  const rawListings = data?.listings || []
  const total = data?.pagination.total || 0
  const totalPages = Math.ceil(total / 16) || 1

  // Client-side condition filter and sorting
  const processedListings = React.useMemo(() => {
    let list = [...rawListings]

    if (selectedCondition !== 'all') {
      list = list.filter((item) => item.condition === selectedCondition)
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

  const handleResetFilters = () => {
    setSearchQuery('')
    setDebouncedSearch('')
    setSelectedCategory('')
    setSelectedCondition('all')
    setSortBy('newest')
    setPage(1)
  }

  const hasActiveFilters =
    debouncedSearch !== '' ||
    selectedCategory !== '' ||
    selectedCondition !== 'all' ||
    sortBy !== 'newest'

  const userLocation = profile?.location || user?.location || 'Nepal'

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      <Navbar />

      {/* Status / Announcement Bar */}
      {!authLoading && (
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 py-2 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            {isAuthenticated && user ? (
              <>
                <p className="flex items-center gap-2">
                  <span className="text-zinc-400 font-mono">user:</span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    {user.username}
                  </span>
                  <span className="text-zinc-400">·</span>
                  <span className="text-zinc-500">
                    location: {userLocation}
                  </span>
                </p>
                <div className="flex items-center gap-3">
                  <Link
                    to="/sell"
                    className="font-medium text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post listing</span>
                  </Link>
                  <span>·</span>
                  <Link to="/profile/listings" className="hover:underline">
                    My inventory
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p>
                  <strong className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    melo
                  </strong>{' '}
                  is a minimal marketplace for buying and selling second-hand
                  goods locally.
                </p>
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="font-medium underline hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    Sign in
                  </Link>
                  <span>·</span>
                  <Link
                    to="/signup"
                    className="font-medium underline hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    Create account
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-5">
        {/* Search & Filter Toolbar */}
        <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-3 rounded-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="search"
                placeholder="Search listings (e.g. ThinkPad, gravel bike, desk)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-400"
              />
            </div>

            {/* Department Select */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setPage(1)
              }}
              className="h-8 px-2.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 cursor-pointer"
            >
              <option value="">All Categories</option>
              {!categoriesLoading &&
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-8 px-2.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 cursor-pointer"
            >
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Condition Filter & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs">
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-zinc-500 font-mono text-[11px] mr-1">
                condition:
              </span>
              {[
                { id: 'all', label: 'all' },
                { id: 'new', label: 'new' },
                { id: 'like_new', label: 'like_new' },
                { id: 'good', label: 'good' },
                { id: 'fair', label: 'fair' },
              ].map((cond) => (
                <button
                  key={cond.id}
                  onClick={() => setSelectedCondition(cond.id)}
                  className={`px-2 py-0.5 rounded-xs font-mono text-[11px] border cursor-pointer transition-colors ${
                    selectedCondition === cond.id
                      ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 border-zinc-800 dark:border-zinc-200 font-semibold'
                      : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {cond.label}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-mono text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>reset filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs Strip */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto scrollbar-none flex items-center gap-1 text-xs pb-1">
          <button
            onClick={() => {
              setSelectedCategory('')
              setPage(1)
            }}
            className={`px-3 py-1 font-mono text-xs rounded-xs border transition-colors cursor-pointer shrink-0 ${
              selectedCategory === ''
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-medium'
                : 'bg-transparent text-zinc-600 dark:text-zinc-400 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            All Items
          </button>
          {!categoriesLoading &&
            categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id)
                  setPage(1)
                }}
                className={`px-3 py-1 font-mono text-xs rounded-xs border transition-colors cursor-pointer shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-medium'
                    : 'bg-transparent text-zinc-600 dark:text-zinc-400 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
        </div>

        {/* Section Header with Item Count */}
        <div className="flex items-center justify-between pt-1">
          <h1 className="text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 font-mono">
            {selectedCategory
              ? categories.find((c) => c.id === selectedCategory)?.name ||
                'Category'
              : debouncedSearch
                ? `Search: "${debouncedSearch}"`
                : 'Marketplace Directory'}
          </h1>
          <span className="text-xs font-mono text-zinc-500">
            [{total} {total === 1 ? 'item' : 'items'}]
          </span>
        </div>

        {/* Product Grid */}
        <ProductGrid
          listings={processedListings}
          isLoading={listingsLoading}
          emptyMessage={
            hasActiveFilters
              ? 'No listings match the selected query or filters.'
              : 'No listings currently available in the marketplace.'
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
      </main>

      {/* Flat Open-Source Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 py-6 text-xs text-zinc-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
              melo:
            </span>
            <span> minimal, open-source marketplace.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/products" className="hover:underline">
              Browse
            </Link>
            <Link to="/sell" className="hover:underline">
              Sell
            </Link>
            <Link to="/favorites" className="hover:underline">
              Wishlist
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
