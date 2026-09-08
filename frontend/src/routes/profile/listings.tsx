import * as React from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import {
  Package,
  CheckCircle2,
  Tag,
  Plus,
  Trash2,
  ExternalLink,
  AlertTriangle,
  ShoppingBag,
  MapPin,
  Calendar,
  Pencil,
} from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { ConditionBadge, StatusBadge } from '#/components/ui/Badge'
import { Navbar } from '#/components/layout/Navbar'
import { useAuth } from '#/hooks/useAuth'
import {
  useDeleteListing,
  useListings,
  useMarkListingSold,
} from '#/hooks/useListings'
import type { Listing } from '#/types/listing'

export const Route = createFileRoute('/profile/listings')({
  component: MyListingsPage,
})

function MyListingsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = React.useState<'all' | 'active' | 'sold'>(
    'all',
  )

  const [confirmSoldId, setConfirmSoldId] = React.useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(
    null,
  )

  const markSoldMutation = useMarkListingSold()
  const deleteMutation = useDeleteListing()

  const { data, isLoading } = useListings({
    seller_id: user?.id,
    status: activeTab === 'all' ? undefined : activeTab,
    limit: 50,
  })

  // Also query user's all listings to compute accurate summary counters
  const { data: allData } = useListings({
    seller_id: user?.id,
    limit: 100,
  })

  const allUserListings = allData?.listings || []
  const activeCount = allUserListings.filter(
    (l) => l.status === 'active',
  ).length
  const soldCount = allUserListings.filter((l) => l.status === 'sold').length
  const totalCount = allUserListings.length

  const listings = data?.listings || []

  const handleConfirmSold = async (id: string) => {
    await markSoldMutation.mutateAsync(id)
    setConfirmSoldId(null)
  }

  const handleConfirmDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id)
    setConfirmDeleteId(null)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500">Loading your listings...</p>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <Package className="w-12 h-12 text-zinc-400 mx-auto mb-3 stroke-[1.5]" />
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Sign In to View Dashboard
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Please log in to manage your listings and selling inventory.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/login">
              <Button className="w-full">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" className="w-full">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Page Title & User Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Seller Dashboard
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Manage your personal listings, mark items as sold, and track
              inventory.
            </p>
          </div>

          <Link to="/sell">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              <span>Create Listing</span>
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Total Listings
              </span>
              <Package className="w-4 h-4 text-zinc-400" />
            </div>
            <span className="text-2xl font-bold mt-2 block text-zinc-900 dark:text-zinc-100">
              {totalCount}
            </span>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Active Listings
              </span>
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-2xl font-bold mt-2 block text-emerald-600 dark:text-emerald-400">
              {activeCount}
            </span>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-red-500">
                Sold Items
              </span>
              <CheckCircle2 className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-2xl font-bold mt-2 block text-red-600 dark:text-red-400">
              {soldCount}
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              activeTab === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            All My Items ({totalCount})
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              activeTab === 'active'
                ? 'bg-emerald-600 text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Active ({activeCount})
          </button>

          <button
            onClick={() => setActiveTab('sold')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              activeTab === 'sold'
                ? 'bg-red-600 text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Sold ({soldCount})
          </button>
        </div>

        {/* Listings Management List */}
        {isLoading ? (
          <div className="py-12 text-center text-zinc-500">
            Loading your inventory...
          </div>
        ) : listings.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8">
            <Package className="w-12 h-12 text-zinc-400 mx-auto mb-3 stroke-[1.5]" />
            <h3 className="text-lg font-semibold mb-1">
              {activeTab === 'sold'
                ? 'No sold items yet'
                : activeTab === 'active'
                  ? 'No active items listed'
                  : 'You have not listed any items yet'}
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-6">
              Turn your unused items into cash. Post a listing in just a few
              minutes.
            </p>
            <Link to="/sell">
              <Button>Post Your First Listing</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((item: Listing) => {
              const isItemSold = item.status === 'sold'
              const formattedPrice = new Intl.NumberFormat('en-NP', {
                style: 'currency',
                currency: 'NPR',
                maximumFractionDigits: 0,
              }).format(item.price)

              const isConfirmingSold = confirmSoldId === item.id
              const isConfirmingDelete = confirmDeleteId === item.id

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl bg-white dark:bg-zinc-900 border transition-all ${
                    isItemSold
                      ? 'border-zinc-200 dark:border-zinc-800/80 opacity-90'
                      : 'border-zinc-200 dark:border-zinc-800 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Item Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 shrink-0 flex items-center justify-center">
                        <Tag className="w-6 h-6 text-zinc-400" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <ConditionBadge condition={item.condition} />
                          <StatusBadge status={item.status} />
                          {item.category && (
                            <span className="text-xs text-zinc-500">
                              • {item.category.name}
                            </span>
                          )}
                        </div>

                        <Link
                          to="/products/$listingId"
                          params={{ listingId: item.id }}
                          className="font-bold text-base hover:text-emerald-600 transition-colors line-clamp-1"
                        >
                          {item.title}
                        </Link>

                        <div className="flex items-center gap-4 text-xs text-zinc-500 mt-1">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                            {formattedPrice}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {item.location}
                          </span>
                          <span className="flex items-center gap-1 hidden sm:inline-flex">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                      <Link
                        to="/products/$listingId"
                        params={{ listingId: item.id }}
                      >
                        <Button variant="ghost" size="sm" className="gap-1">
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Button>
                      </Link>

                      {!isItemSold && (
                        <Link
                          to="/products/$listingId/edit"
                          params={{ listingId: item.id }}
                        >
                          <Button variant="outline" size="sm" className="gap-1">
                            <Pencil className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Edit</span>
                          </Button>
                        </Link>
                      )}

                      {!isItemSold && !isConfirmingSold && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => {
                            setConfirmSoldId(item.id)
                            setConfirmDeleteId(null)
                          }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Mark Sold</span>
                        </Button>
                      )}

                      {!isConfirmingDelete && !isConfirmingSold && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                          onClick={() => {
                            setConfirmDeleteId(item.id)
                            setConfirmSoldId(null)
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Inline Warning for Mark as Sold */}
                  {isConfirmingSold && (
                    <div className="mt-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          <strong>Mark as sold?</strong> Buyers will see this
                          item as unavailable. This cannot be undone.
                        </span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmSoldId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          isLoading={markSoldMutation.isPending}
                          onClick={() => handleConfirmSold(item.id)}
                        >
                          Confirm Sold
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Inline Warning for Delete */}
                  {isConfirmingDelete && (
                    <div className="mt-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs text-red-900 dark:text-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>
                          <strong>Permanently delete this listing?</strong> This
                          will remove the item from the marketplace.
                        </span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          isLoading={deleteMutation.isPending}
                          onClick={() => handleConfirmDelete(item.id)}
                        >
                          Confirm Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
