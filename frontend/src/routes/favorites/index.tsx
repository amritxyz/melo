import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import * as React from 'react'
import { LayoutGrid, List, Bookmark, ArrowRight } from 'lucide-react'
import { ProductGrid } from '#/components/listings/ProductGrid'
import { Button } from '#/components/ui/Button'
import { Navbar } from '#/components/layout/Navbar'
import { useAuth } from '#/hooks/useAuth'
import { useFavorites } from '#/hooks/useFavorites'
import type { Listing } from '#/types/listing'

export const Route = createFileRoute('/favorites/')({
  component: FavoritesPage,
})

function FavoritesPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()

  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('marketplace_view_mode')
      if (saved === 'grid' || saved === 'list') {
        setViewMode(saved)
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  const setAndSaveViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode)
    try {
      localStorage.setItem('marketplace_view_mode', mode)
    } catch {
      // Ignore localStorage errors
    }
  }

  const { data, isLoading: isFavoritesLoading } = useFavorites(1, 100)

  // Redirect if definitely not logged in
  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate({ to: '/login' })
    }
  }, [user, isAuthLoading, navigate])

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="p-8 text-xs font-mono text-zinc-500">
          Loading wishlist...
        </div>
      </div>
    )
  }

  const favorites = data?.favorites || []
  const listings: Listing[] = favorites
    .map((fav) => fav.listing)
    .filter((l): l is Listing => !!l)

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      <Navbar />

      {/* Header Bar */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-sm font-bold font-mono uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              Saved Items (Wishlist)
            </h1>
            <p className="text-[11px] font-mono text-zinc-500">
              Tracked listings saved to your account for quick access.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <span className="text-xs font-mono text-zinc-500">
              [{listings.length} {listings.length === 1 ? 'item' : 'items'}]
            </span>

            {listings.length > 0 && (
              <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-none overflow-hidden">
                <button
                  type="button"
                  onClick={() => setAndSaveViewMode('grid')}
                  title="Grid view"
                  className={`p-1.5 transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setAndSaveViewMode('list')}
                  title="List view"
                  className={`p-1.5 transition-colors cursor-pointer border-l border-zinc-300 dark:border-zinc-700 ${
                    viewMode === 'list'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-4">
        {isFavoritesLoading ? (
          <ProductGrid listings={[]} isLoading={true} viewMode={viewMode} />
        ) : listings.length === 0 ? (
          <div className="py-16 text-center border border-zinc-200 dark:border-zinc-800 rounded-none bg-zinc-50/50 dark:bg-zinc-900/30 p-8 space-y-4 max-w-md mx-auto my-8">
            <div className="w-10 h-10 mx-auto rounded-none border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-400">
              <Bookmark className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Your Saved List is Empty
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Bookmark items you're interested in while browsing to monitor
                availability and pricing.
              </p>
            </div>
            <div className="pt-2">
              <Link to="/">
                <Button size="sm" className="gap-1.5 font-mono text-xs">
                  <span>Browse Marketplace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <ProductGrid listings={listings} viewMode={viewMode} />
        )}
      </main>
    </div>
  )
}
