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
  Navigation,
  Share2,
  Check,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react'

import { Button } from '#/components/ui/Button'
import { ConditionBadge, StatusBadge } from '#/components/ui/Badge'
import { RatingStars } from '#/components/ui/RatingStars'
import { FavoriteButton } from '#/components/listings/FavoriteButton'
import { ProductCard } from '#/components/listings/ProductCard'
import { MeetupModal } from '#/components/listings/MeetupModal'
import { Navbar } from '#/components/layout/Navbar'
import { UserAvatar } from '#/components/avatars'
import { useAuth } from '#/hooks/useAuth'
import { useStartConversation } from '#/hooks/useChat'
import { useUserProfile } from '#/hooks/useUser'
import {
  useDeleteListing,
  useListing,
  useMarkListingSold,
  useSimilarListings,
} from '#/hooks/useListings'
import { formatTitleCase, formatLocation, formatName } from '#/lib/utils'

const conditionNotes: Record<string, string> = {
  new: 'Brand new, unopened and unused.',
  like_new: 'Nearly new, minimal prior use with no visible flaws.',
  good: 'Fully operational with minor cosmetic marks of normal use.',
  fair: 'Working properly with noticeable wear or cosmetic marks.',
  poor: 'Heavy wear; functional or suitable for spare parts/repair.',
}

export const Route = createFileRoute('/products/$listingId/')({
  component: ProductDetailPage,
})

function ProductDetailPage() {
  const { listingId } = Route.useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const [showSoldConfirm, setShowSoldConfirm] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const [showMeetupModal, setShowMeetupModal] = React.useState(false)
  const [copiedShare, setCopiedShare] = React.useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0)
  const [failedImages, setFailedImages] = React.useState<
    Record<string, boolean>
  >({})

  const { data: listing, isLoading, error } = useListing(listingId)
  const { data: similarListings = [] } = useSimilarListings(listingId, 4)
  const { data: sellerProfile } = useUserProfile(listing?.seller_id)

  const markSoldMutation = useMarkListingSold()
  const deleteMutation = useDeleteListing()
  const startConvMutation = useStartConversation()

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopiedShare(true)
      setTimeout(() => setCopiedShare(false), 2000)
    }
  }

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
  const validImages = (listing.images || []).filter(
    (img) => !failedImages[img.url],
  )
  const safeImageIndex =
    selectedImageIndex < validImages.length ? selectedImageIndex : 0
  const activeImage =
    validImages.length > 0 ? validImages[safeImageIndex] : null

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-zinc-500 overflow-hidden truncate">
            <Link to="/" className="hover:underline shrink-0">
              marketplace
            </Link>
            <span>/</span>
            {listing.category && (
              <>
                <Link
                  to="/"
                  search={{ category: listing.category_id }}
                  className="text-zinc-700 dark:text-zinc-300 hover:underline shrink-0"
                >
                  {listing.category.name.toLowerCase()}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-zinc-900 dark:text-zinc-100 truncate">
              {formatTitleCase(listing.title)}
            </span>
          </div>

          <Link
            to="/"
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline shrink-0 text-[11px]"
          >
            ← Back to results
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full flex-1 space-y-6">
        {/* Sold Notice */}
        {isSold && (
          <div className="border border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/30 p-2 rounded-xs text-xs font-mono text-red-800 dark:text-red-300 flex items-center justify-between">
            <span>[SOLD] This item has been marked as sold.</span>
            <StatusBadge status="sold" size="sm" />
          </div>
        )}

        {/* Top Hero Section: Gallery (Left) + Buy Box & Seller (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Gallery Column (7 cols) */}
          <div className="md:col-span-7 space-y-2">
            <div className="h-64 sm:h-72 md:h-80 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xs flex items-center justify-center relative overflow-hidden">
              {activeImage ? (
                <img
                  src={activeImage.url}
                  alt={listing.title}
                  onError={() => {
                    setFailedImages((prev) => ({
                      ...prev,
                      [activeImage.url]: true,
                    }))
                  }}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="flex flex-col items-center text-zinc-400">
                  <Tag className="w-8 h-8 stroke-[1.5] mb-1 text-zinc-300 dark:text-zinc-700" />
                  <span className="text-[10px] font-mono uppercase text-zinc-400">
                    {listing.category?.name || 'Item'}
                  </span>
                </div>
              )}

              <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                <ConditionBadge condition={listing.condition} size="sm" />
                {isSold ? (
                  <StatusBadge status={listing.status} size="sm" />
                ) : (
                  (listing.quantity ?? 1) > 1 && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-xs text-[10px] font-mono font-medium bg-zinc-900/80 text-white dark:bg-zinc-100/90 dark:text-zinc-900 backdrop-blur-xs">
                      {listing.quantity} available
                    </span>
                  )
                )}
              </div>

              <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleShare}
                  className="h-5 px-1.5 rounded-xs border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-900 flex items-center gap-1 text-[10px] font-mono shadow-xs backdrop-blur-xs cursor-pointer transition-colors"
                  title="Copy listing link"
                >
                  {copiedShare ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3 h-3" />
                      <span>Share</span>
                    </>
                  )}
                </button>

                {!isOwner && (
                  <FavoriteButton listingId={listing.id} variant="badge" />
                )}
              </div>
            </div>

            {/* Thumbnails if multiple images */}
            {validImages.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {validImages.map((img, idx) => (
                  <button
                    key={img.id || img.url || idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`h-11 w-11 rounded-xs border overflow-hidden shrink-0 cursor-pointer transition-colors ${
                      safeImageIndex === idx
                        ? 'border-zinc-900 dark:border-zinc-100 ring-1 ring-zinc-900 dark:ring-zinc-100'
                        : 'border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`Thumbnail ${idx + 1}`}
                      onError={() => {
                        setFailedImages((prev) => ({
                          ...prev,
                          [img.url]: true,
                        }))
                      }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Buy Box / Action Column (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            {/* Title & Category Tag */}
            <div>
              {listing.category && (
                <Link
                  to="/"
                  search={{ category: listing.category_id }}
                  className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:underline inline-block mb-0.5"
                >
                  {listing.category.name}
                </Link>
              )}
              <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-snug">
                {formatTitleCase(listing.title)}
              </h1>
            </div>

            {/* Price Box */}
            <div className="border-y border-zinc-200 dark:border-zinc-800 py-2.5 flex items-baseline justify-between gap-2">
              <div>
                <span
                  className={`font-mono font-bold text-lg sm:text-xl block ${
                    isSold
                      ? 'text-zinc-400 line-through'
                      : 'text-zinc-900 dark:text-zinc-100'
                  }`}
                >
                  {formattedPrice}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono text-zinc-500 block">
                  {isSold
                    ? '0 available (Sold)'
                    : (listing.quantity ?? 1) > 1
                    ? `${listing.quantity} available`
                    : '1 available'}
                </span>
              </div>
            </div>

            {/* Quick Specs (Condition & Location) */}
            <div className="flex items-center justify-between text-xs font-mono py-1.5 px-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 shrink-0">Condition</span>
                <span className="font-semibold capitalize text-zinc-900 dark:text-zinc-100 truncate">
                  {listing.condition.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400 shrink-0 text-[11px]">
                <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="truncate">{formatLocation(listing.location)}</span>
              </div>
            </div>

            {/* Buy / Message / Action Buttons */}
            <div className="space-y-1.5 pt-0.5">
              {!isOwner ? (
                <>
                  {!isSold ? (
                    <Button
                      className="w-full gap-1.5 text-xs font-medium h-8 rounded-none"
                      size="md"
                      isLoading={startConvMutation.isPending}
                      onClick={handleMessageSeller}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Contact Seller</span>
                    </Button>
                  ) : (
                    <div className="py-1.5 px-2 text-center bg-zinc-100 dark:bg-zinc-800/60 text-xs font-mono text-zinc-500">
                      This item is marked as sold
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      className="w-full gap-1 font-mono text-xs text-zinc-700 dark:text-zinc-300 h-8 rounded-none"
                      onClick={() => setShowMeetupModal(true)}
                    >
                      <Navigation className="w-3 h-3 text-zinc-500" />
                      <span>Meetup Spot</span>
                    </Button>

                    <FavoriteButton
                      listingId={listing.id}
                      variant="button"
                      className="w-full h-8 text-xs font-mono rounded-none"
                    />
                  </div>
                </>
              ) : (
                /* Owner Action Box */
                <div className="border border-zinc-300 dark:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-900/50 p-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Your Listing
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">Owner Controls</span>
                  </div>

                  {isSold && (
                    <div className="p-1.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-zinc-500 shrink-0" />
                      <span>Item marked as sold.</span>
                    </div>
                  )}

                  {/* Mark as Sold Confirmation */}
                  {!isSold && showSoldConfirm && (
                    <div className="p-2 border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 text-xs font-mono space-y-1.5">
                      <div className="flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-[11px]">Mark as sold?</p>
                          <p className="text-zinc-600 dark:text-zinc-400 text-[10px]">
                            Cannot be undone.
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-1.5 pt-0.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] font-mono px-2 rounded-none"
                          onClick={() => setShowSoldConfirm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          className="h-7 text-[10px] font-mono px-2 rounded-none"
                          isLoading={markSoldMutation.isPending}
                          onClick={handleConfirmSold}
                        >
                          Confirm
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Delete Confirmation */}
                  {showDeleteConfirm && (
                    <div className="p-2 border border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/30 text-xs font-mono space-y-1.5">
                      <div className="flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-[11px]">Permanently delete?</p>
                          <p className="text-zinc-600 dark:text-zinc-400 text-[10px]">
                            Removes listing completely.
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-1.5 pt-0.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] font-mono px-2 rounded-none"
                          onClick={() => setShowDeleteConfirm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          className="h-7 text-[10px] font-mono px-2 rounded-none"
                          isLoading={deleteMutation.isPending}
                          onClick={handleConfirmDelete}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}

                  {!showSoldConfirm && !showDeleteConfirm && (
                    <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                      {!isSold && (
                        <Link
                          to="/products/$listingId/edit"
                          params={{ listingId: listing.id }}
                          className="block"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-1 text-[11px] font-mono h-7 px-1.5 rounded-none"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit</span>
                          </Button>
                        </Link>
                      )}

                      {!isSold && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-1 text-[11px] font-mono h-7 px-1.5 rounded-none"
                          onClick={() => setShowSoldConfirm(true)}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Sold</span>
                        </Button>
                      )}

                      <Button
                        variant="danger"
                        size="sm"
                        className="w-full gap-1 text-[11px] font-mono h-7 px-1.5 rounded-none"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Compact Seller Information */}
            <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-2.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Link
                  to="/users/$userId"
                  params={{ userId: listing.seller_id }}
                  className="flex items-center gap-2 min-w-0 group"
                >
                  <UserAvatar
                    avatarUrl={
                      sellerProfile?.avatar_url || listing.seller?.avatar_url
                    }
                    username={listing.seller?.username}
                    size="sm"
                    shape="square"
                    className="w-7 h-7 rounded-none border border-zinc-300 dark:border-zinc-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-mono font-semibold text-xs text-zinc-900 dark:text-zinc-100 group-hover:underline block truncate">
                      {formatName(listing.seller?.username || 'Seller')}
                    </span>
                    <RatingStars
                      rating={sellerProfile?.rating || 0}
                      totalCount={sellerProfile?.review_count || 0}
                      size="sm"
                    />
                  </div>
                </Link>

                <Link
                  to="/users/$userId"
                  params={{ userId: listing.seller_id }}
                  className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline shrink-0 flex items-center gap-0.5"
                >
                  <span>Seller items</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {(sellerProfile?.bio || listing.seller?.bio) && (
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 italic line-clamp-1 border-t border-zinc-200/70 dark:border-zinc-800/70 pt-1.5">
                  &quot;{sellerProfile?.bio || listing.seller?.bio}&quot;
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Similar / Recommended Products (eBay pattern) */}
        {similarListings && similarListings.length > 0 && (
          <section className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-100 dark:border-zinc-800/80">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Similar Products
              </h2>
              <span className="text-[10px] font-mono text-zinc-500">
                {similarListings.length} {similarListings.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {similarListings.map((simItem) => (
                <ProductCard key={simItem.id} listing={simItem} />
              ))}
            </div>
          </section>
        )}

        {/* Product Details & Full Description Section (After recommendations, like on eBay) */}
        <section className="pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Item Details & Specifications
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Item Specifics Table (5 cols) */}
            <div className="md:col-span-5 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="text-[10px] font-mono font-semibold uppercase text-zinc-600 dark:text-zinc-400 tracking-wider">
                  Item Specifics
                </h3>
                <span className="text-[10px] font-mono text-zinc-400">Specifications</span>
              </div>
              <div className="text-xs font-mono divide-y divide-zinc-100 dark:divide-zinc-800/80 bg-white dark:bg-zinc-900">
                <div className="flex px-3 py-1.5 justify-between">
                  <span className="text-zinc-500">Available:</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-semibold">
                    {isSold ? '0 (Sold)' : `${listing.quantity ?? 1} in stock`}
                  </span>
                </div>
                <div className="flex px-3 py-1.5 justify-between">
                  <span className="text-zinc-500">Category:</span>
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {listing.category?.name || 'General'}
                  </span>
                </div>
                <div className="flex px-3 py-1.5 justify-between items-start gap-4">
                  <span className="text-zinc-500 shrink-0">Condition:</span>
                  <div className="text-right">
                    <span className="capitalize text-zinc-900 dark:text-zinc-100 font-semibold block">
                      {listing.condition.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-zinc-500 block">
                      {conditionNotes[listing.condition] || 'Standard pre-owned condition.'}
                    </span>
                  </div>
                </div>
                <div className="flex px-3 py-1.5 justify-between">
                  <span className="text-zinc-500">Location:</span>
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {formatLocation(listing.location)}
                  </span>
                </div>
                <div className="flex px-3 py-1.5 justify-between">
                  <span className="text-zinc-500">Listed:</span>
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {formattedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Seller Description (7 cols) */}
            <div className="md:col-span-7 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-[10px] font-mono font-semibold uppercase text-zinc-600 dark:text-zinc-400 tracking-wider">
                  Seller Description
                </h3>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-900">
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line font-sans">
                  {listing.description}
                </p>
              </div>
            </div>
          </div>

          {/* Buyer Safety & Meetup Guide */}
          <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 p-2.5 space-y-1.5 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 font-semibold text-[10px] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Buyer Safety & Handover Guide</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 pt-0.5">
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>
                  <strong>Inspect first:</strong> Always examine and test items before paying.
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>
                  <strong>Safe meetup:</strong> Prefer well-lit public spots like malls or chowks.
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>
                  <strong>Direct chat:</strong> Finalize meetup details only inside Melo messages.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Meetup Modal */}
        <MeetupModal
          isOpen={showMeetupModal}
          onClose={() => setShowMeetupModal(false)}
          sellerLocation={listing.location || listing.seller?.location || 'Traffic Chowk, Butwal'}
          initialBuyerLocation={currentUser?.location || 'Devinagar, Butwal'}
          sellerName={listing.seller?.username || 'Seller'}
        />
      </main>
    </div>
  )
}
