import * as React from 'react'
import { Link } from '@tanstack/react-router'
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  Tag,
  Heart,
  Plus,
  X,
  ChevronUp,
  RotateCcw,
  PackageCheck,
  Tv,
  Car,
  Home as HomeIcon,
  Shirt,
  GraduationCap,
} from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { ProductGrid } from '#/components/listings/ProductGrid'
import { useCategories, useListings } from '#/hooks/useListings'
import { useUserProfile } from '#/hooks/useUser'
import { useFavoriteIds } from '#/hooks/useFavorites'
import type { User } from '#/types/auth'

interface MarketplaceHomeProps {
  user: User
}

type SortOption = 'newest' | 'price_asc' | 'price_desc'

export function MarketplaceHome({ user }: MarketplaceHomeProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<string>('')
  const [selectedCondition, setSelectedCondition] =
    React.useState<string>('all')
  const [sortBy, setSortBy] = React.useState<SortOption>('newest')
  const [page, setPage] = React.useState<number>(1)

  const listingsFeedRef = React.useRef<HTMLDivElement>(null)

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: profile } = useUserProfile(user.id)
  const { data: categories = [] } = useCategories()
  const { favoriteIds } = useFavoriteIds()

  // Main listings query
  const { data, isLoading: listingsLoading } = useListings({
    page,
    limit: 12,
    category_id: selectedCategory || undefined,
    search: debouncedSearch || undefined,
  })

  // Quick deals for top widget box
  const { data: topDealsData } = useListings({
    page: 1,
    limit: 2,
  })

  const rawListings = data?.listings || []
  const total = data?.pagination.total || 0
  const totalPages = Math.ceil(total / 12) || 1

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

  const userLocation = profile?.location || user.location || 'Nepal'
  const savedCount = favoriteIds.length

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setPage(1)
    listingsFeedRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

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

  // Map category names to icons for quadrant cards
  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase()
    if (
      lower.includes('electr') ||
      lower.includes('phone') ||
      lower.includes('laptop')
    ) {
      return <Tv className="w-5 h-5 text-blue-500" />
    }
    if (
      lower.includes('vehic') ||
      lower.includes('bike') ||
      lower.includes('car')
    ) {
      return <Car className="w-5 h-5 text-amber-500" />
    }
    if (lower.includes('home') || lower.includes('furnit')) {
      return <HomeIcon className="w-5 h-5 text-emerald-500" />
    }
    if (lower.includes('fash') || lower.includes('cloth')) {
      return <Shirt className="w-5 h-5 text-purple-500" />
    }
    if (lower.includes('edu') || lower.includes('book')) {
      return <GraduationCap className="w-5 h-5 text-rose-500" />
    }
    return <Tag className="w-5 h-5 text-zinc-500" />
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-100/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* 1. Amazon-style Subnav Bar */}
      <div className="bg-zinc-800 text-zinc-100 text-xs shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          {/* Deliver to indicator */}
          <div className="flex items-center gap-1.5 shrink-0 text-zinc-300 hover:text-white transition-colors cursor-pointer">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Deliver to{' '}
              <strong className="text-white font-semibold">
                {userLocation}
              </strong>
            </span>
          </div>

          {/* Quick department navigation */}
          <div className="flex items-center gap-4 shrink-0 overflow-x-auto py-1">
            <button
              onClick={() => handleCategorySelect('')}
              className={`hover:text-emerald-400 transition-colors cursor-pointer font-medium ${
                selectedCategory === ''
                  ? 'text-emerald-400 font-bold'
                  : 'text-zinc-300'
              }`}
            >
              All Items
            </button>
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`hover:text-emerald-400 transition-colors cursor-pointer font-medium ${
                  selectedCategory === cat.id
                    ? 'text-emerald-400 font-bold'
                    : 'text-zinc-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
            <Link
              to="/sell"
              className="text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Sell</span>
            </Link>
            <Link
              to="/favorites"
              className="text-zinc-300 hover:text-white transition-colors flex items-center gap-1"
            >
              <Heart className="w-3.5 h-3.5 text-red-400" />
              <span>Wishlist ({savedCount})</span>
            </Link>
          </div>

          {/* User greeting */}
          <div className="hidden lg:flex items-center gap-1 text-zinc-400 shrink-0">
            <span>Hello,</span>
            <span className="font-semibold text-zinc-200 truncate max-w-[120px]">
              {user.username}
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* 2. Amazon-style Search and Filter Bar */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Category Dropdown */}
            <div className="relative shrink-0 md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setPage(1)
                }}
                className="w-full h-11 px-3.5 pr-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="">All Departments</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="search"
                placeholder="Search pre-loved electronics, vehicles, furniture, books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative shrink-0 md:w-44">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full h-11 px-3.5 pr-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Quick Condition Filters & Clear Button */}
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-zinc-400 font-medium mr-1">Condition:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'new', label: 'New' },
                { id: 'like_new', label: 'Like New' },
                { id: 'good', label: 'Good' },
                { id: 'fair', label: 'Fair' },
              ].map((cond) => (
                <button
                  key={cond.id}
                  onClick={() => setSelectedCondition(cond.id)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                    selectedCondition === cond.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {cond.label}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset all filters</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. Amazon-style 4-Box Department / Feature Quadrant */}
        {!debouncedSearch &&
          selectedCategory === '' &&
          selectedCondition === 'all' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Box 1: Featured Deals */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                      Today&apos;s Top Deals
                    </h3>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                    Fresh pre-loved items with unbeatable value.
                  </p>

                  {topDealsData?.listings &&
                  topDealsData.listings.length > 0 ? (
                    <div className="space-y-2.5">
                      {topDealsData.listings.slice(0, 2).map((item) => (
                        <Link
                          key={item.id}
                          to="/products/$listingId"
                          params={{ listingId: item.id }}
                          className="group flex items-center gap-3 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors border border-zinc-100 dark:border-zinc-800"
                        >
                          <div className="w-10 h-10 rounded-md bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0 text-zinc-500">
                            <Tag className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                              {item.title}
                            </p>
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              NPR {item.price.toLocaleString()}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-zinc-400">
                      Check back soon for featured deals.
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    listingsFeedRef.current?.scrollIntoView({
                      behavior: 'smooth',
                    })
                  }}
                  className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Browse all deals</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Box 2: Shop by Category */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mb-1">
                    Shop by Category
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                    Find exactly what you need quickly.
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {categories.slice(0, 4).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat.id)}
                        className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors border border-zinc-100 dark:border-zinc-800 cursor-pointer flex flex-col gap-1.5"
                      >
                        <div className="p-1.5 rounded-md bg-white dark:bg-zinc-700/60 w-fit shadow-2xs">
                          {getCategoryIcon(cat.name)}
                        </div>
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                          {cat.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <Link
                  to="/products"
                  className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>View all departments</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Box 3: Sell on Melo */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                      Sell on Melo
                    </h3>
                    <PackageCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                    Turn unused items into cash fast.
                  </p>

                  <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5">
                    <p className="font-medium text-emerald-800 dark:text-emerald-300">
                      ✓ 100% Free local listings
                    </p>
                    <p>✓ Direct user-to-user chat</p>
                    <p>✓ Instant neighborhood reach</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <Link to="/sell" className="w-full">
                    <Button size="sm" className="w-full gap-1.5 font-semibold">
                      <Plus className="w-4 h-4" />
                      <span>Create a Listing</span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Box 4: Your Watchlist */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                      Your Watchlist
                    </h3>
                    <Heart className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                    Keep track of items you want to buy.
                  </p>

                  <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-center">
                    <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                      {savedCount}
                    </span>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {savedCount === 1 ? 'item saved' : 'items saved'} in your
                      wishlist
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <Link to="/favorites" className="w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 font-semibold"
                    >
                      <Heart className="w-3.5 h-3.5 text-red-500" />
                      <span>View Wishlist</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

        {/* 4. Amazon-style Marketplace Listings Feed */}
        <section ref={listingsFeedRef} className="space-y-4 pt-2">
          {/* Feed Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>
                  {selectedCategory
                    ? categories.find((c) => c.id === selectedCategory)?.name ||
                      'Category Listings'
                    : debouncedSearch
                      ? `Results for "${debouncedSearch}"`
                      : 'Marketplace Listings'}
                </span>
                <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {total} {total === 1 ? 'item' : 'items'}
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Browse pre-owned goods from verified local sellers.
              </p>
            </div>

            {/* Active category pill shortcut if selected */}
            {selectedCategory && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1.5">
                  <span>
                    Category:{' '}
                    {categories.find((c) => c.id === selectedCategory)?.name}
                  </span>
                  <button
                    onClick={() => handleCategorySelect('')}
                    className="hover:text-emerald-900 dark:hover:text-emerald-200 cursor-pointer"
                    title="Remove category filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              </div>
            )}
          </div>

          {/* Product Grid */}
          <ProductGrid
            listings={processedListings}
            isLoading={listingsLoading}
            emptyMessage={
              hasActiveFilters
                ? 'No items found matching your current filters. Try changing or resetting your search.'
                : 'No listings posted in the marketplace yet. Be the first to post!'
            }
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-6 pb-2 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => {
                  setPage((p) => Math.max(p - 1, 1))
                  listingsFeedRef.current?.scrollIntoView({
                    behavior: 'smooth',
                  })
                }}
              >
                Previous
              </Button>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => {
                  setPage((p) => p + 1)
                  listingsFeedRef.current?.scrollIntoView({
                    behavior: 'smooth',
                  })
                }}
              >
                Next
              </Button>
            </div>
          )}
        </section>
      </main>

      {/* 5. Amazon-style "Back to Top" bar */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-full py-3.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-8 shadow-inner"
        aria-label="Back to top"
      >
        <ChevronUp className="w-4 h-4" />
        <span>Back to top</span>
      </button>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-8 px-4 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-black text-emerald-600 text-base">melo.</span>
          <p>© 2026 Melo Marketplace. Simple, local second-hand trading.</p>
          <div className="flex gap-4">
            <Link to="/products" className="hover:underline">
              All Products
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
