import * as React from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Search, Plus, Filter, X } from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { ProductGrid } from '#/components/listings/ProductGrid'
import { FilterSidebar } from '#/components/listings/FilterSidebar'
import type { SortOption } from '#/components/listings/FilterSidebar'
import { Navbar } from '#/components/layout/Navbar'
import { useCategories, useListings } from '#/hooks/useListings'
import { useAuth } from '#/hooks/useAuth'
import { useUserProfile } from '#/hooks/useUser'
import { formatName, formatLocation } from '#/lib/utils'

interface ListingSearchParams {
  q?: string
  category?: string
  condition?: string
  location?: string
  sort?: SortOption
  page?: number
}

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): ListingSearchParams => {
    const sort = search.sort as string
    const validSort: SortOption | undefined =
      sort === 'newest' || sort === 'price_asc' || sort === 'price_desc'
        ? sort
        : undefined

    const pageNum = Number(search.page)

    return {
      q: typeof search.q === 'string' && search.q ? search.q : undefined,
      category:
        typeof search.category === 'string' && search.category
          ? search.category
          : undefined,
      condition:
        typeof search.condition === 'string' && search.condition
          ? search.condition
          : undefined,
      location:
        typeof search.location === 'string' && search.location
          ? search.location
          : undefined,
      sort: validSort,
      page: Number.isInteger(pageNum) && pageNum > 0 ? pageNum : undefined,
    }
  },
  component: Home,
})

function Home() {
  const navigate = Route.useNavigate()
  const searchParams = Route.useSearch()

  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { data: profile } = useUserProfile(user?.id)
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories()

  const [mobileFiltersOpen, setMobileFiltersOpen] =
    React.useState<boolean>(false)

  const searchQuery = searchParams.q || ''
  const selectedCategory = searchParams.category || ''
  const selectedCondition = searchParams.condition || 'all'
  const selectedLocation = searchParams.location || ''
  const sortBy: SortOption = searchParams.sort || 'newest'
  const page = searchParams.page || 1

  // Local input state for search box typing
  const [searchInput, setSearchInput] = React.useState(searchQuery)

  // Keep local search input in sync if URL query changes externally (e.g. back/forward button or reset)
  React.useEffect(() => {
    setSearchInput(searchQuery)
  }, [searchQuery])

  // Debounced search effect updating the URL
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim()
      if (trimmed !== searchQuery) {
        navigate({
          search: (prev) => ({
            ...prev,
            q: trimmed || undefined,
            page: undefined,
          }),
          replace: true,
        })
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [searchInput, searchQuery, navigate])

  const { data, isLoading: listingsLoading } = useListings({
    page,
    limit: 16,
    category_id: selectedCategory || undefined,
    search: searchQuery || undefined,
    location: selectedLocation || undefined,
    condition: selectedCondition !== 'all' ? selectedCondition : undefined,
    sort_by: sortBy !== 'newest' ? sortBy : undefined,
  })

  const listings = data?.listings || []
  const total = data?.pagination.total || 0
  const totalPages = Math.ceil(total / 16) || 1

  const handleResetFilters = () => {
    setSearchInput('')
    navigate({
      search: () => ({}),
    })
  }

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== '' ||
    selectedCondition !== 'all' ||
    selectedLocation !== '' ||
    sortBy !== 'newest'

  const userLocation = formatLocation(
    profile?.location || user?.location || 'Butwal, Nepal',
  )

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
                  <span className="text-zinc-400">user:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatName(user.username)}
                  </span>
                  <span className="text-zinc-400">·</span>
                  <span className="text-zinc-500">location:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {userLocation}
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

      {/* Directory Subheader */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-sm font-bold font-mono uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              Marketplace Directory
            </h1>
            <p className="text-[11px] font-mono text-zinc-500">
              Local pre-owned products offered by community sellers in Butwal.
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
          <FilterSidebar
            categories={categories}
            loadingCategories={categoriesLoading}
            selectedCategory={selectedCategory}
            onSelectCategory={(id) => {
              navigate({
                search: (prev) => ({
                  ...prev,
                  category: id || undefined,
                  page: undefined,
                }),
              })
            }}
            selectedCondition={selectedCondition}
            onSelectCondition={(cond) => {
              navigate({
                search: (prev) => ({
                  ...prev,
                  condition: cond === 'all' ? undefined : cond,
                  page: undefined,
                }),
              })
            }}
            selectedLocation={selectedLocation}
            onSelectLocation={(loc) => {
              navigate({
                search: (prev) => ({
                  ...prev,
                  location: loc || undefined,
                  page: undefined,
                }),
              })
            }}
            sortBy={sortBy}
            onSelectSortBy={(sort) => {
              navigate({
                search: (prev) => ({
                  ...prev,
                  sort: sort === 'newest' ? undefined : sort,
                  page: undefined,
                }),
              })
            }}
            hasFilters={hasActiveFilters}
            onReset={handleResetFilters}
            isOpenOnMobile={mobileFiltersOpen}
          />

          {/* Results Main Column */}
          <div className="md:col-span-3 space-y-4">
            {/* Search Bar & Stats Header */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="search"
                  placeholder="Filter listings by keyword (e.g. ThinkPad, gravel bike, desk)..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="text-xs font-mono text-zinc-500 shrink-0 self-center">
                [{total} {total === 1 ? 'result' : 'results'}]
              </div>
            </div>

            {/* Active Filters Bar */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-zinc-400 font-mono text-[10px]">
                  active:
                </span>
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono">
                    cat:{' '}
                    {categories.find((c) => c.id === selectedCategory)?.name}
                    <button
                      onClick={() => {
                        navigate({
                          search: (prev) => ({
                            ...prev,
                            category: undefined,
                            page: undefined,
                          }),
                        })
                      }}
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
                      onClick={() => {
                        navigate({
                          search: (prev) => ({
                            ...prev,
                            condition: undefined,
                            page: undefined,
                          }),
                        })
                      }}
                      className="hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedLocation && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono">
                    loc: {selectedLocation}
                    <button
                      onClick={() => {
                        navigate({
                          search: (prev) => ({
                            ...prev,
                            location: undefined,
                            page: undefined,
                          }),
                        })
                      }}
                      className="hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono">
                    query: &quot;{searchQuery}&quot;
                    <button
                      onClick={() => {
                        setSearchInput('')
                        navigate({
                          search: (prev) => ({
                            ...prev,
                            q: undefined,
                            page: undefined,
                          }),
                        })
                      }}
                      className="hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Product Grid */}
            <ProductGrid
              listings={listings}
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
                    const newPage = Math.max(page - 1, 1)
                    navigate({
                      search: (prev) => ({
                        ...prev,
                        page: newPage > 1 ? newPage : undefined,
                      }),
                    })
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
                    const newPage = page + 1
                    navigate({
                      search: (prev) => ({
                        ...prev,
                        page: newPage,
                      }),
                    })
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
            <Link to="/" className="hover:underline">
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
