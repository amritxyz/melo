import * as React from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  MapPin,
  Calendar,
  Tag,
  User as UserIcon,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { ConditionBadge, StatusBadge } from '#/components/ui/Badge'
import { useAuth } from '#/hooks/useAuth'
import {
  useDeleteListing,
  useListing,
  useMarkListingSold,
} from '#/hooks/useListings'

export const Route = createFileRoute('/products/$listingId')({
  component: ProductDetailPage,
})

function ProductDetailPage() {
  const { listingId } = Route.useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const [showSoldConfirm, setShowSoldConfirm] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)

  const { data: listing, isLoading, error } = useListing(listingId)
  const markSoldMutation = useMarkListingSold()
  const deleteMutation = useDeleteListing()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500">Loading product details...</p>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-2">Listing Not Found</h2>
        <p className="text-zinc-500 mb-6">
          This item may have been removed or does not exist.
        </p>
        <Link to="/products">
          <Button variant="outline">Browse All Listings</Button>
        </Link>
      </div>
    )
  }

  const isOwner = currentUser?.id === listing.seller_id
  const isSold = listing.status === 'sold'

  const formattedPrice = new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    maximumFractionDigits: 0,
  }).format(listing.price)

  const formattedDate = new Date(listing.created_at).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  )

  const handleConfirmSold = async () => {
    await markSoldMutation.mutateAsync(listing.id)
    setShowSoldConfirm(false)
  }

  const handleConfirmDelete = async () => {
    await deleteMutation.mutateAsync(listing.id)
    navigate({ to: '/products' })
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-black tracking-tight text-emerald-600">
              melo.
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/products">
              <Button variant="ghost" size="sm">
                ← Browse Listings
              </Button>
            </Link>
            {currentUser && (
              <Link to="/profile/listings">
                <Button variant="outline" size="sm">
                  My Listings
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Prominent Sold Banner */}
        {isSold && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-3 text-sm text-red-800 dark:text-red-300 font-medium">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>
              This item has been marked as <strong>SOLD</strong> and is no
              longer available for purchase.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Visual Container */}
            <div className="h-72 sm:h-96 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center relative overflow-hidden">
              <div className="flex flex-col items-center text-zinc-400">
                <Tag className="w-16 h-16 stroke-[1.5] mb-2 text-zinc-300 dark:text-zinc-700" />
                <span className="text-sm font-medium">
                  {listing.category?.name || 'Item'}
                </span>
              </div>

              <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                <ConditionBadge condition={listing.condition} />
                <StatusBadge status={listing.status} />
              </div>

              {isSold && (
                <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="px-5 py-2 rounded-xl bg-red-600 text-white font-black text-lg tracking-widest uppercase shadow-lg border border-red-500">
                    SOLD OUT
                  </span>
                </div>
              )}
            </div>

            {/* Title & Description */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
              <div>
                <span
                  className={`text-3xl font-black block ${
                    isSold
                      ? 'text-zinc-400 line-through'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {formattedPrice}
                </span>
                <h1 className="text-2xl font-bold mt-2 text-zinc-900 dark:text-zinc-50">
                  {listing.title}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                  <span>{listing.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <span>Posted on {formattedDate}</span>
                </div>
                {listing.category && (
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4 text-zinc-400" />
                    <span>{listing.category.name}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                  Description
                </h2>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar / Actions Column */}
          <div className="space-y-6">
            {/* Seller Info Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
                Seller Information
              </h2>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-semibold block text-zinc-900 dark:text-zinc-100">
                    {listing.seller?.username || 'Seller'}
                  </span>
                  <span className="text-xs text-zinc-500">
                    Verified Marketplace Member
                  </span>
                </div>
              </div>

              {!isOwner && !isSold && (
                <div className="mt-6">
                  <Button className="w-full">Message Seller</Button>
                </div>
              )}
            </div>

            {/* Owner Controls */}
            {isOwner && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-emerald-500/30 dark:border-emerald-500/30 shadow-xs space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Seller Controls
                </h2>
                <p className="text-xs text-zinc-500">
                  You are the owner of this listing.
                </p>

                {/* Sold State Notice */}
                {isSold && (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>This item is marked as sold.</span>
                  </div>
                )}

                {/* Mark as Sold Confirmation Warning */}
                {!isSold && showSoldConfirm && (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-xs">Mark item as sold?</p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                          Warning: Once marked as sold, buyers will see it as
                          unavailable. You cannot change this back.
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSoldConfirm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        isLoading={markSoldMutation.isPending}
                        onClick={handleConfirmSold}
                      >
                        Yes, Mark as Sold
                      </Button>
                    </div>
                  </div>
                )}

                {/* Delete Confirmation Warning */}
                {showDeleteConfirm && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800/80 text-red-900 dark:text-red-200 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-xs">
                          Delete this listing?
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                          This will permanently delete this listing from the
                          marketplace.
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        isLoading={deleteMutation.isPending}
                        onClick={handleConfirmDelete}
                      >
                        Yes, Delete
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {!showSoldConfirm && !showDeleteConfirm && (
                  <div className="space-y-2 pt-2">
                    {!isSold && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5"
                        onClick={() => setShowSoldConfirm(true)}
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Mark as Sold
                      </Button>
                    )}

                    <Button
                      variant="danger"
                      size="sm"
                      className="w-full gap-1.5"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Listing
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
