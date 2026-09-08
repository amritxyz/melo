import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react'
import * as React from 'react'
import { ProductGrid } from '#/components/listings/ProductGrid'
import { Button } from '#/components/ui/Button'
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
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const favorites = data?.favorites || []
  const listings: Listing[] = favorites
    .map((fav) => fav.listing)
    .filter((l): l is Listing => !!l)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Top Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/products"
              className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Back to products"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-500">
                <Heart className="w-4 h-4 fill-red-500" />
              </div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Saved Items
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/products">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ShoppingBag className="w-4 h-4" />
                Explore Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Your Wishlist
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Keep track of items you are considering buying
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {listings.length} {listings.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {isFavoritesLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Your wishlist is empty
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              Explore used electronics, vehicles, fashion, and more. Tap the
              heart on any product to save it here for later.
            </p>
            <div className="mt-6">
              <Link to="/products">
                <Button className="gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Browse Listings
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <ProductGrid listings={listings} />
        )}
      </main>
    </div>
  )
}
