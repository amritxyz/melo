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
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 px-4">
        <div className="max-w-md mx-auto text-center bg-white dark:bg-zinc-900 p-6 rounded-xs border border-zinc-200 dark:border-zinc-800">
          <Package className="w-8 h-8 text-zinc-400 mx-auto mb-3 stroke-[1.5]" />
          <h2 className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 mb-1">
            Sign In Required
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
            Please log in to manage your listings and inventory.
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/login">
              <Button className="w-full font-mono text-xs">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" className="w-full font-mono text-xs">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Page Title & User Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
              <Link
                to="/products"
                className="hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                marketplace
              </Link>
              <span>/</span>
              <Link
                to="/profile"
                className="hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                profile
              </Link>
              <span>/</span>
              <span className="text-zinc-900 dark:text-zinc-100">listings</span>
            </div>
            <h1 className="text-lg font-bold font-mono tracking-tight">
              Seller Dashboard
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Manage inventory, update listing statuses, and track sales.
            </p>
          </div>

          <Link to="/sell">
            <Button size="sm" className="gap-1.5 font-mono text-xs">
              <Plus className="w-3.5 h-3.5" />
              <span>Create Listing</span>
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                Total Listings
              </span>
              <span className="text-lg font-mono font-bold block text-zinc-900 dark:text-zinc-100 mt-0.5">
                {totalCount}
              </span>
            </div>
            <Package className="w-4 h-4 text-zinc-400" />
          </div>

          <div className="p-3.5 rounded-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                Active Listings
              </span>
              <span className="text-lg font-mono font-bold block text-zinc-900 dark:text-zinc-100 mt-0.5">
                {activeCount}
              </span>
            </div>
            <ShoppingBag className="w-4 h-4 text-zinc-400" />
          </div>

          <div className="p-3.5 rounded-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                Sold Items
              </span>
              <span className="text-lg font-mono font-bold block text-zinc-900 dark:text-zinc-100 mt-0.5">
                {soldCount}
              </span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-zinc-400" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-2">
          {(['all', 'active', 'sold'] as const).map((tab) => {
            const count =
              tab === 'all'
                ? totalCount
                : tab === 'active'
                  ? activeCount
                  : soldCount
            const label =
              tab === 'all' ? 'All' : tab === 'active' ? 'Active' : 'Sold'
            const isSelected = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1 rounded-xs text-xs font-mono transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-zinc-900 text-zinc-50 border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100'
                    : 'text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {label} [{count}]
              </button>
            )
          })}
        </div>

        {/* Listings Management List */}
        {isLoading ? (
          <div className="py-8 text-center text-xs font-mono text-zinc-500">
            Loading your inventory...
          </div>
        ) : listings.length === 0 ? (
          <div className="py-12 text-center rounded-xs border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-2">
            <Package className="w-8 h-8 text-zinc-400 mx-auto stroke-[1.5]" />
            <h3 className="text-xs font-bold font-mono">
              {activeTab === 'sold'
                ? 'No sold items yet'
                : activeTab === 'active'
                  ? 'No active items listed'
                  : 'You have not listed any items yet'}
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Turn your unused items into cash. Post a listing in just a few
              minutes.
            </p>
            <div className="pt-2">
              <Link to="/sell">
                <Button size="sm" className="font-mono text-xs">
                  Post Your First Listing
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
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
                  className={`p-3.5 rounded-xs bg-white dark:bg-zinc-900 border transition-colors ${
                    isItemSold
                      ? 'border-zinc-200 dark:border-zinc-800 opacity-75'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Item Info */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0 flex items-center justify-center">
                        <Tag className="w-5 h-5 text-zinc-400" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <ConditionBadge condition={item.condition} />
                          <StatusBadge status={item.status} />
                          {item.category && (
                            <span className="text-[11px] font-mono text-zinc-500">
                              / {item.category.name}
                            </span>
                          )}
                        </div>

                        <Link
                          to="/products/$listingId"
                          params={{ listingId: item.id }}
                          className="font-mono font-semibold text-xs text-zinc-900 dark:text-zinc-100 hover:underline line-clamp-1"
                        >
                          {item.title}
                        </Link>

                        <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500 mt-1">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {formattedPrice}
                          </span>
                          {item.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-zinc-400" />
                              {item.location}
                            </span>
                          )}
                          <span className="hidden sm:inline-flex items-center gap-1 text-zinc-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center shrink-0">
                      <Link
                        to="/products/$listingId"
                        params={{ listingId: item.id }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 font-mono text-xs h-7 px-2"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View</span>
                        </Button>
                      </Link>

                      {!isItemSold && (
                        <Link
                          to="/products/$listingId/edit"
                          params={{ listingId: item.id }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 font-mono text-xs h-7 px-2"
                          >
                            <Pencil className="w-3 h-3 text-zinc-400" />
                            <span>Edit</span>
                          </Button>
                        </Link>
                      )}

                      {!isItemSold && !isConfirmingSold && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 font-mono text-xs h-7 px-2"
                          onClick={() => {
                            setConfirmSoldId(item.id)
                            setConfirmDeleteId(null)
                          }}
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Mark Sold</span>
                        </Button>
                      )}

                      {!isConfirmingDelete && !isConfirmingSold && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 dark:text-red-400 h-7 px-2"
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
                    <div className="mt-3 p-2.5 rounded-xs bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Mark as sold? This cannot be undone.</span>
                      </div>
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setConfirmSoldId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          className="h-7 text-xs"
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
                    <div className="mt-3 p-2.5 rounded-xs bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs text-red-900 dark:text-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>Permanently delete this listing?</span>
                      </div>
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          className="h-7 text-xs"
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
