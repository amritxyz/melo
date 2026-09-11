import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import * as React from 'react'
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
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold font-mono uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              Saved Items (Wishlist)
            </h1>
            <p className="text-[11px] font-mono text-zinc-500">
              List of tracked listings saved to your account.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            [{listings.length} {listings.length === 1 ? 'item' : 'items'}]
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-4">
        {isFavoritesLoading ? (
          <ProductGrid listings={[]} isLoading={true} />
        ) : listings.length === 0 ? (
          <div className="text-center py-12 border border-zinc-200 dark:border-zinc-800 rounded-xs bg-zinc-50/50 dark:bg-zinc-900/30 p-6 space-y-3">
            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
              Your wishlist is currently empty.
            </p>
            <Link to="/products">
              <Button variant="outline" size="sm">
                ← Browse Marketplace
              </Button>
            </Link>
          </div>
        ) : (
          <ProductGrid listings={listings} />
        )}
      </main>
    </div>
  )
}
