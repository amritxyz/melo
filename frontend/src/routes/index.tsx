import { Link, createFileRoute } from '@tanstack/react-router'
import { Plus, ShoppingBag, ArrowRight } from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { ProductGrid } from '#/components/listings/ProductGrid'
import { useAuth } from '#/hooks/useAuth'
import { useCategories, useListings } from '#/hooks/useListings'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const {
    user,
    isLoading: authLoading,
    isAuthenticated,
    logout,
    isLoggingOut,
  } = useAuth()
  const { data: categories = [] } = useCategories()
  const { data: listingsData, isLoading: listingsLoading } = useListings({
    page: 1,
    limit: 4,
  })

  const recentListings = listingsData?.listings || []

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Navbar */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-black tracking-tight text-emerald-600">
                melo.
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              <Link
                to="/products"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Browse Marketplace
              </Link>
              <Link
                to="/sell"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Sell an Item
              </Link>
              {isAuthenticated && (
                <Link
                  to="/profile/listings"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-semibold"
                >
                  My Listings
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/sell" className="hidden sm:inline-flex">
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" />
                <span>Sell</span>
              </Button>
            </Link>

            {authLoading ? (
              <span className="text-xs text-zinc-400">...</span>
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile/listings"
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {user.username}
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={isLoggingOut}
                  onClick={() => logout()}
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 mb-6">
            <ShoppingBag className="w-3.5 h-3.5" />
            Modern Second-Hand Marketplace
          </span>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
            Buy less. Sell more. <br className="hidden sm:inline" />
            <span className="text-emerald-600">Give things a second life.</span>
          </h1>

          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            Discover great local deals on electronics, vehicles, furniture, and
            more, or turn your unused goods into cash.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/products">
              <Button size="lg" className="gap-2 px-6">
                <span>Explore Listings</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link to="/sell">
              <Button variant="outline" size="lg" className="px-6">
                Start Selling
              </Button>
            </Link>
          </div>

          {/* Category Chips */}
          {categories.length > 0 && (
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to="/products"
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Listings Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Recent Listings
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Freshly posted used products from local sellers.
            </p>
          </div>

          <Link
            to="/products"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 inline-flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ProductGrid
          listings={recentListings}
          isLoading={listingsLoading}
          emptyMessage="No listings posted yet. Post the very first one!"
        />
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-8 px-4 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-black text-emerald-600 text-base">melo.</span>
          <p>© 2026 Melo Marketplace. Simple, local second-hand trading.</p>
          <div className="flex gap-4">
            <Link to="/products" className="hover:underline">
              Products
            </Link>
            <Link to="/sell" className="hover:underline">
              Sell
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
