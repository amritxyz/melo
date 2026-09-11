import * as React from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  MapPin,
  Tag,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Pencil,
  MessageSquare,
} from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { ConditionBadge, StatusBadge } from '#/components/ui/Badge'
import { RatingStars } from '#/components/ui/RatingStars'
import { FavoriteButton } from '#/components/listings/FavoriteButton'
import { Navbar } from '#/components/layout/Navbar'
import { UserAvatar } from '#/components/avatars'
import { useAuth } from '#/hooks/useAuth'
import { useStartConversation } from '#/hooks/useChat'
import { useUserProfile } from '#/hooks/useUser'
import {
  useDeleteListing,
  useListing,
  useMarkListingSold,
} from '#/hooks/useListings'
import { formatTitleCase, formatLocation, formatName } from '#/lib/utils'

export const Route = createFileRoute('/products/$listingId/')({
  component: ProductDetailPage,
})

function ProductDetailPage() {
  const { listingId } = Route.useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const [showSoldConfirm, setShowSoldConfirm] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)

  const { data: listing, isLoading, error } = useListing(listingId)
  const { data: sellerProfile } = useUserProfile(listing?.seller_id)
  const markSoldMutation = useMarkListingSold()
  const deleteMutation = useDeleteListing()
  const startConvMutation = useStartConversation()

  const handleMessageSeller = async () => {
    if (!currentUser) {
      navigate({ to: '/login' })
      return
    }
    if (!listing) return
    const conv = await startConvMutation.mutateAsync(listing.id)
    navigate({
      to: '/messages',
      search: { conversationId: conv.id },
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="p-8 text-xs font-mono text-zinc-500">
          Loading listing details...
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
          <h2 className="text-base font-bold font-mono">Listing Not Found</h2>
          <p className="text-xs text-zinc-500">
            This item does not exist or has been removed.
          </p>
          <Link to="/">
            <Button variant="outline" size="sm">
              ← Return to marketplace
            </Button>
          </Link>
        </div>
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
      month: 'short',
      day: 'numeric',
    },
  )

  const handleConfirmSold = async () => {
    await markSoldMutation.mutateAsync(listing.id)
    setShowSoldConfirm(false)
  }

  const handleConfirmDelete = async () => {
    await deleteMutation.mutateAsync(listing.id)
    navigate({ to: '/' })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      <Navbar />

      {/* Breadcrumbs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 py-2 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 text-zinc-500">
          <Link to="/" className="hover:underline">
            marketplace
          </Link>
          <span>/</span>
          {listing.category && (
            <>
              <span className="text-zinc-700 dark:text-zinc-300">
                {listing.category.name.toLowerCase()}
              </span>
              <span>/</span>
            </>
          )}
          <span className="text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] sm:max-w-none">
            {formatTitleCase(listing.title)}
          </span>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        {/* Sold Notice */}
        {isSold && (
          <div className="border border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/30 p-2.5 rounded-xs text-xs font-mono text-red-800 dark:text-red-300 flex items-center justify-between">
            <span>[SOLD] This item has been marked as sold.</span>
            <StatusBadge status="sold" size="sm" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Main Info Column */}
          <div className="md:col-span-2 space-y-4">
            {/* Image / Tag Placeholder Box */}
            <div className="h-56 sm:h-64 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xs flex items-center justify-center relative">
              <div className="flex flex-col items-center text-zinc-400">
                <Tag className="w-10 h-10 stroke-[1.5] mb-1 text-zinc-300 dark:text-zinc-700" />
                <span className="text-xs font-mono uppercase text-zinc-400">
                  {listing.category?.name || 'Item'}
                </span>
              </div>

              <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                <ConditionBadge condition={listing.condition} size="sm" />
                {isSold && <StatusBadge status={listing.status} size="sm" />}
              </div>

              {!isOwner && (
                <div className="absolute top-2 right-2 z-10">
                  <FavoriteButton listingId={listing.id} variant="badge" />
                </div>
              )}
            </div>

            {/* Title, Price & Details */}
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xs p-4 space-y-4">
              <div>
                <span
                  className={`font-mono font-bold text-xl sm:text-2xl block ${
                    isSold
                      ? 'text-zinc-400 line-through'
                      : 'text-zinc-900 dark:text-zinc-100'
                  }`}
                >
                  {formattedPrice}
                </span>
                <h1 className="text-base sm:text-lg font-bold mt-1 text-zinc-900 dark:text-zinc-50">
                  {formatTitleCase(listing.title)}
                </h1>
              </div>

              {/* Metadata Table */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xs text-xs font-mono divide-y divide-zinc-200 dark:divide-zinc-800">
                <div className="flex px-3 py-1.5 justify-between">
                  <span className="text-zinc-500">Location:</span>
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {formatLocation(listing.location)}
                  </span>
                </div>
                <div className="flex px-3 py-1.5 justify-between">
                  <span className="text-zinc-500">Category:</span>
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {listing.category?.name || 'General'}
                  </span>
                </div>
                <div className="flex px-3 py-1.5 justify-between">
                  <span className="text-zinc-500">Condition:</span>
                  <span className="capitalize text-zinc-900 dark:text-zinc-100">
                    {listing.condition.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex px-3 py-1.5 justify-between">
                  <span className="text-zinc-500">Listed:</span>
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {formattedDate}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="pt-2">
                <h2 className="text-xs font-mono font-semibold uppercase text-zinc-500 mb-2">
                  Item Description
                </h2>
                <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line font-sans">
                  {listing.description}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-4">
            {/* Seller Box */}
            <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xs p-4 space-y-3">
              <h2 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
                Seller Information
              </h2>

              <Link
                to="/users/$userId"
                params={{ userId: listing.seller_id }}
                className="group block"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserAvatar
                    avatarUrl={
                      sellerProfile?.avatar_url || listing.seller?.avatar_url
                    }
                    username={listing.seller?.username}
                    size="sm"
                    shape="square"
                    className="w-7 h-7 rounded-xs border border-zinc-300 dark:border-zinc-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-mono font-semibold text-xs block text-zinc-900 dark:text-zinc-100 group-hover:underline truncate">
                      {formatName(listing.seller?.username || 'Seller')}
                    </span>
                    <RatingStars
                      rating={sellerProfile?.rating || 0}
                      totalCount={sellerProfile?.review_count || 0}
                      size="sm"
                    />
                  </div>
                </div>
              </Link>

              {(sellerProfile?.bio || listing.seller?.bio) && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 italic line-clamp-2">
                  &quot;{sellerProfile?.bio || listing.seller?.bio}&quot;
                </p>
              )}

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[11px] font-mono flex items-center justify-between text-zinc-500">
                <Link
                  to="/users/$userId"
                  params={{ userId: listing.seller_id }}
                  className="hover:underline text-zinc-700 dark:text-zinc-300"
                >
                  View profile →
                </Link>
                {listing.seller?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {formatLocation(listing.seller.location)}
                  </span>
                )}
              </div>

              {!isOwner && (
                <div className="pt-2 space-y-2">
                  {!isSold && (
                    <Button
                      className="w-full gap-1.5"
                      size="sm"
                      isLoading={startConvMutation.isPending}
                      onClick={handleMessageSeller}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Contact Seller</span>
                    </Button>
                  )}
                  <FavoriteButton
                    listingId={listing.id}
                    variant="button"
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Owner Management Box */}
            {isOwner && (
              <div className="border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xs p-4 space-y-3">
                <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Listing Management
                </h2>
                <p className="text-xs text-zinc-500 font-mono">
                  You are the owner of this post.
                </p>

                {/* Sold State */}
                {isSold && (
                  <div className="p-2 rounded-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs font-mono text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span>Listing marked as sold.</span>
                  </div>
                )}

                {/* Mark as Sold Confirmation */}
                {!isSold && showSoldConfirm && (
                  <div className="p-3 rounded-xs border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 text-xs font-mono space-y-2">
                    <div className="flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Mark item as sold?</p>
                        <p className="text-zinc-600 dark:text-zinc-400 text-[11px] mt-0.5">
                          Item will be marked unavailable. Cannot be undone.
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
                        Confirm Sold
                      </Button>
                    </div>
                  </div>
                )}

                {/* Delete Confirmation */}
                {showDeleteConfirm && (
                  <div className="p-3 rounded-xs border border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/30 text-xs font-mono space-y-2">
                    <div className="flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Permanently delete?</p>
                        <p className="text-zinc-600 dark:text-zinc-400 text-[11px] mt-0.5">
                          This action will remove the listing entirely.
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
                        Delete
                      </Button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {!showSoldConfirm && !showDeleteConfirm && (
                  <div className="space-y-1.5 pt-1">
                    {!isSold && (
                      <Link
                        to="/products/$listingId/edit"
                        params={{ listingId: listing.id }}
                        className="block w-full"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-1"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit Details</span>
                        </Button>
                      </Link>
                    )}

                    {!isSold && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1"
                        onClick={() => setShowSoldConfirm(true)}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Mark as Sold</span>
                      </Button>
                    )}

                    <Button
                      variant="danger"
                      size="sm"
                      className="w-full gap-1"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete Listing</span>
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
