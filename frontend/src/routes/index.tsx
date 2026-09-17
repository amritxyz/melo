import * as React from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Plus, Filter, X, LayoutGrid, List, RotateCcw } from 'lucide-react'
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

  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('melo_view_mode')
      if (saved === 'list' || saved === 'grid') {
        setViewMode(saved)
      }
    } catch {
      // ignore storage errors
    }
  }, [])

  const handleSetViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode)
    try {
      localStorage.setItem('melo_view_mode', mode)
    } catch {
      // ignore storage errors
    }
  }

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
            {/* Results Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                  {total} {total === 1 ? 'item' : 'items'}
                </span>
                {searchQuery && (
                  <span className="text-xs font-mono text-zinc-500">
                    matching <span className="text-zinc-900 dark:text-zinc-100 font-semibold">"{searchQuery}"</span>
                  </span>
                )}
                {!searchQuery && !hasActiveFilters && (
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 ml-2">
                    <span className="text-zinc-400 text-[10px]">Popular:</span>
                    {['ThinkPad', 'Bicycle', 'Desk', 'Guitar', 'Monitor'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          navigate({
                            search: (prev) => ({
                              ...prev,
                              q: tag,
                              page: undefined,
                            }),
                          })
                        }
                        className="px-1.5 py-0.5 rounded-xs border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Grid / List View Toggle */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-xs overflow-hidden bg-white dark:bg-zinc-900">
                  <button
                    type="button"
                    onClick={() => handleSetViewMode('grid')}
                    className={`p-1.5 transition-colors cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                        : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                    title="Grid view"
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetViewMode('list')}
                    className={`p-1.5 transition-colors cursor-pointer border-l border-zinc-200 dark:border-zinc-800 ${
                      viewMode === 'list'
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                        : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                    title="List view"
                    aria-label="List view"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
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

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="font-mono text-[10px] text-red-600 dark:text-red-400 hover:underline flex items-center gap-0.5 ml-1 cursor-pointer"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Clear all</span>
                </button>
              </div>
            )}

            {/* Product Grid */}
            <ProductGrid
              listings={listings}
              isLoading={listingsLoading}
              viewMode={viewMode}
              onResetFilters={handleResetFilters}
              categories={categories}
              onSelectCategory={(id) => {
                navigate({
                  search: (prev) => ({
                    ...prev,
                    category: id,
                    page: undefined,
                  }),
                })
              }}
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
