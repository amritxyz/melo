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
  Store,
} from 'lucide-react'

import { Button } from '#/components/ui/Button'
import { Badge, ConditionBadge, StatusBadge } from '#/components/ui/Badge'
import { RatingStars } from '#/components/ui/RatingStars'
import { Card } from '#/components/ui/Card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '#/components/ui/Tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/Table'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '#/components/ui/Carousel'
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
  const { data: similarListings = [] } = useSimilarListings(listingId, 8)
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

      {/* Top Context & Action Bar */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 py-2 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 text-zinc-500 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
            <Link to="/" className="hover:underline shrink-0">
              marketplace
            </Link>
            <span className="shrink-0">/</span>
            {listing.category && (
              <>
                <Link
                  to="/"
                  search={{ category: listing.category_id }}
                  className="text-zinc-700 dark:text-zinc-300 hover:underline shrink-0"
                >
                  {listing.category.name.toLowerCase()}
                </Link>
                <span className="shrink-0">/</span>
              </>
            )}
            <span className="text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] sm:max-w-none">
              {formatTitleCase(listing.title)}
            </span>
          </div>

          {/* Action Cluster (Requirement 8) */}
          <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-end">
            <Link
              to="/"
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline shrink-0 text-[11px] mr-1 hidden sm:inline"
            >
              ← Results
            </Link>

            <button
              type="button"
              onClick={handleShare}
              className="h-7 px-2.5 rounded-none border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1 text-[11px] font-mono cursor-pointer transition-colors"
              title="Copy listing link"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3 h-3 text-zinc-900 dark:text-zinc-100" />
                  <span className="text-zinc-900 dark:text-zinc-100 font-semibold">
                    Copied
                  </span>
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
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-24 md:pb-8 w-full flex-1 space-y-8">
        {/* Sold Notice */}
        {isSold && (
          <div className="border border-destructive/30 bg-destructive/10 p-2 rounded-none text-xs font-mono text-destructive flex items-center justify-between">
            <span>[SOLD] This item has been marked as sold.</span>
            <StatusBadge status="sold" size="sm" />
          </div>
        )}

        {/* Two-Column Section: Gallery & Details (Left) + Sticky Buy Box & Seller (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Image Gallery & Detail Tabs (7 cols) */}
          <div className="md:col-span-7 space-y-5">
            {/* Gallery Container (Requirement 1) */}
            <div className="space-y-2">
              <div className="h-64 sm:h-72 md:h-80 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none flex items-center justify-center relative overflow-hidden">
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

                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-10 pointer-events-none">
                  <ConditionBadge condition={listing.condition} size="sm" />
                  {isSold ? (
                    <StatusBadge status={listing.status} size="sm" />
                  ) : (
                    (listing.quantity ?? 1) > 1 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-none text-[10px] font-mono font-medium border border-zinc-400 dark:border-zinc-600 bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 backdrop-blur-xs">
                        {listing.quantity} available
                      </span>
                    )
                  )}
                </div>

                {!isOwner && (
                  <div className="absolute top-1.5 right-1.5 z-10">
                    <FavoriteButton listingId={listing.id} variant="badge" />
                  </div>
                )}
              </div>

              {/* Thumbnails strip (only if multiple photos, Requirement 1) */}
              {validImages.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  {validImages.map((img, idx) => (
                    <button
                      key={img.id || img.url || idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`h-11 w-11 rounded-none border overflow-hidden shrink-0 cursor-pointer transition-colors ${
                        safeImageIndex === idx
                          ? 'border-zinc-900 dark:border-zinc-100 ring-1 ring-zinc-900 dark:ring-zinc-100'
                          : 'border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100'
                      }`}
                      title={`View image ${idx + 1}`}
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

            {/* Detail Sections as Tabs (Requirements 4 & 5) */}
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-none overflow-hidden">
              <Tabs defaultValue="description" className="w-full">
                <TabsList>
                  <TabsTrigger value="description">
                    Seller Description
                  </TabsTrigger>
                  <TabsTrigger value="specifics">Item Specifics</TabsTrigger>
                  <TabsTrigger value="safety">
                    Safety & Handover Guide
                  </TabsTrigger>
                </TabsList>

                {/* Seller Description Tab */}
                <TabsContent value="description" className="p-3.5 pt-2.5">
                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line font-sans">
                    {listing.description}
                  </p>
                </TabsContent>

                {/* Item Specifics Table Tab (Requirement 5) */}
                <TabsContent value="specifics" className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3">Specification</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-semibold text-zinc-500">
                          Condition
                        </TableCell>
                        <TableCell className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <ConditionBadge
                              condition={listing.condition}
                              size="sm"
                            />
                            <span className="capitalize font-semibold text-zinc-900 dark:text-zinc-100">
                              {listing.condition.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500 block">
                            {conditionNotes[listing.condition] ||
                              'Standard pre-owned condition.'}
                          </span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold text-zinc-500">
                          Category
                        </TableCell>
                        <TableCell className="text-zinc-900 dark:text-zinc-100">
                          {listing.category?.name || 'General'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold text-zinc-500">
                          Availability
                        </TableCell>
                        <TableCell className="text-zinc-900 dark:text-zinc-100 font-semibold">
                          {isSold
                            ? '0 (Sold)'
                            : `${listing.quantity ?? 1} in stock`}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold text-zinc-500">
                          Location
                        </TableCell>
                        <TableCell className="text-zinc-900 dark:text-zinc-100">
                          {formatLocation(listing.location)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold text-zinc-500">
                          Listed On
                        </TableCell>
                        <TableCell className="text-zinc-900 dark:text-zinc-100">
                          {formattedDate}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold text-zinc-500">
                          Listing ID
                        </TableCell>
                        <TableCell className="font-mono text-[11px] text-zinc-500">
                          #{listing.id.slice(0, 8)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TabsContent>

                {/* Buyer Safety Guide Tab */}
                <TabsContent
                  value="safety"
                  className="p-3.5 pt-2.5 space-y-3 text-xs font-mono"
                >
                  <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 font-semibold text-[10px] uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300 shrink-0" />
                    <span>Buyer Safety & Handover Guide</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                    <div className="p-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-1">
                      <span className="text-zinc-900 dark:text-zinc-100 font-bold block">
                        ✓ Inspect First
                      </span>
                      <span className="font-sans">
                        Always examine and test items thoroughly in person prior
                        to transferring funds.
                      </span>
                    </div>
                    <div className="p-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-1">
                      <span className="text-zinc-900 dark:text-zinc-100 font-bold block">
                        ✓ Safe Meetup
                      </span>
                      <span className="font-sans">
                        Select public, high-visibility locations like shopping
                        malls or chowks.
                      </span>
                    </div>
                    <div className="p-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-1">
                      <span className="text-zinc-900 dark:text-zinc-100 font-bold block">
                        ✓ Direct Chat
                      </span>
                      <span className="font-sans">
                        Finalize meetup details and questions only inside Melo
                        messages.
                      </span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Column: Sticky Buy Box & Seller Info Mini-Card (5 cols, Requirements 2 & 3) */}
          <div className="md:col-span-5 md:sticky md:top-4 self-start space-y-3">
            {/* Buy Box Panel */}
            <Card className="p-3 space-y-2.5 rounded-none">
              {/* Category Eyebrow & Title */}
              <div>
                {listing.category && (
                  <Link
                    to="/"
                    search={{ category: listing.category_id }}
                    className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:underline inline-block mb-1"
                  >
                    {listing.category.name}
                  </Link>
                )}
                <h1 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-50 leading-snug">
                  {formatTitleCase(listing.title)}
                </h1>
              </div>

              {/* Price & Quantity Box */}
              <div className="border-y border-zinc-200 dark:border-zinc-800 py-2 flex items-baseline justify-between gap-2">
                <div>
                  <span
                    className={`font-mono font-bold text-sm sm:text-base block ${
                      isSold ? 'text-zinc-400 line-through' : 'text-primary'
                    }`}
                  >
                    {formattedPrice}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-zinc-500 block">
                    {isSold
                      ? '0 available (Sold)'
                      : (listing.quantity ?? 1) > 1
                        ? `${listing.quantity} available`
                        : '1 available'}
                  </span>
                </div>
              </div>

              {/* Condition with inline explanatory subtext (Requirement 7) */}
              <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 p-2 text-[10px] font-mono space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="uppercase tracking-wider text-zinc-400 dark:text-zinc-500 shrink-0">
                      Condition
                    </span>
                    <ConditionBadge condition={listing.condition} size="sm" />
                  </div>
                  <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 shrink-0 truncate max-w-[160px]">
                    <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span className="truncate">
                      {formatLocation(listing.location)}
                    </span>
                  </div>
                </div>
                {conditionNotes[listing.condition] && (
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                    {conditionNotes[listing.condition]}
                  </p>
                )}
              </div>

              {/* Buy / Message / Action Buttons */}
              <div className="space-y-1.5 pt-0.5">
                {!isOwner ? (
                  <>
                    {!isSold ? (
                      <Button
                        size="sm"
                        className="w-full gap-1.5 text-xs font-medium h-9 sm:h-7 rounded-none"
                        isLoading={startConvMutation.isPending}
                        onClick={handleMessageSeller}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Contact Seller</span>
                      </Button>
                    ) : (
                      <div className="py-2 px-2 text-center bg-zinc-100 dark:bg-zinc-800/60 text-xs font-mono text-zinc-500">
                        This item is marked as sold
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 h-9 sm:h-7 rounded-none"
                        onClick={() => setShowMeetupModal(true)}
                      >
                        <Navigation className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Meetup Spot</span>
                      </Button>

                      <FavoriteButton
                        listingId={listing.id}
                        variant="button"
                        size="sm"
                        className="w-full h-9 sm:h-7 rounded-none"
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
                      <span className="text-[10px] font-mono text-zinc-500">
                        Owner Controls
                      </span>
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
                            <p className="font-bold text-[11px]">
                              Mark as sold?
                            </p>
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
                            className="h-8 sm:h-7 text-[10px] font-mono px-2 rounded-none"
                            onClick={() => setShowSoldConfirm(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            className="h-8 sm:h-7 text-[10px] font-mono px-2 rounded-none"
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
                      <div className="p-2 border border-destructive/30 bg-destructive/10 text-xs font-mono space-y-1.5">
                        <div className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-[11px]">
                              Permanently delete?
                            </p>
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
                            className="h-8 sm:h-7 text-[10px] font-mono px-2 rounded-none"
                            onClick={() => setShowDeleteConfirm(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            className="h-8 sm:h-7 text-[10px] font-mono px-2 rounded-none"
                            isLoading={deleteMutation.isPending}
                            onClick={handleConfirmDelete}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    )}

                    {!showSoldConfirm && !showDeleteConfirm && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-0.5">
                        {!isSold && (
                          <Link
                            to="/products/$listingId/edit"
                            params={{ listingId: listing.id }}
                            className="block"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full gap-1 text-[11px] font-mono h-9 sm:h-7 px-1.5 rounded-none"
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
                            className="w-full gap-1 text-[11px] font-mono h-9 sm:h-7 px-1.5 rounded-none"
                            onClick={() => setShowSoldConfirm(true)}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Sold</span>
                          </Button>
                        )}

                        <Button
                          variant="danger"
                          size="sm"
                          className="w-full gap-1 text-[11px] font-mono h-9 sm:h-7 px-1.5 rounded-none"
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
            </Card>

            {/* Seller Info as distinct mini-card (Requirement 3) */}
            <Card className="p-2.5 space-y-2 bg-zinc-50/50 dark:bg-zinc-900/40 rounded-none">
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
                    size="xs"
                    shape="square"
                    className="w-6 h-6 rounded-none border border-zinc-300 dark:border-zinc-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-mono font-medium text-xs text-zinc-900 dark:text-zinc-100 group-hover:underline block truncate">
                      {formatName(listing.seller?.username || 'Seller')}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <RatingStars
                        rating={sellerProfile?.rating || 0}
                        totalCount={sellerProfile?.review_count || 0}
                        size="xs"
                      />
                    </div>
                  </div>
                </Link>

                <Badge
                  variant="secondary"
                  size="sm"
                  className="shrink-0 text-[10px]"
                >
                  {sellerProfile?.rating && sellerProfile.rating > 0
                    ? `${sellerProfile.rating.toFixed(1)} ★`
                    : 'New (0)'}
                </Badge>
              </div>

              {/* Two-Button Row (Requirement 3) */}
              <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-zinc-200/70 dark:border-zinc-800/70">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-1 font-mono text-[11px] h-7 rounded-none"
                  isLoading={startConvMutation.isPending}
                  onClick={handleMessageSeller}
                  disabled={isOwner}
                >
                  <MessageSquare className="w-3 h-3 text-zinc-500" />
                  <span>Message Seller</span>
                </Button>

                <Link
                  to="/users/$userId"
                  params={{ userId: listing.seller_id }}
                  className="w-full block"
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full gap-1 font-mono text-[11px] h-7 rounded-none text-zinc-700 dark:text-zinc-300"
                  >
                    <Store className="w-3 h-3 text-zinc-400" />
                    <span>View Storefront</span>
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Similar Products Horizontal Scroll Carousel (Requirement 6) */}
        {similarListings.length > 0 && (
          <section className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <Carousel className="w-full">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    Similar Products
                  </h2>
                  <span className="text-[10px] font-mono text-zinc-500">
                    ({similarListings.length}{' '}
                    {similarListings.length === 1 ? 'item' : 'items'})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <CarouselPrevious />
                  <CarouselNext />
                </div>
              </div>

              <CarouselContent>
                {similarListings.map((simItem) => (
                  <CarouselItem
                    key={simItem.id}
                    className="basis-44 sm:basis-52 md:basis-60"
                  >
                    <ProductCard listing={simItem} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </section>
        )}

        {/* Meetup Modal */}
        <MeetupModal
          isOpen={showMeetupModal}
          onClose={() => setShowMeetupModal(false)}
          sellerLocation={
            listing.location ||
            listing.seller?.location ||
            'Traffic Chowk, Butwal'
          }
          initialBuyerLocation={currentUser?.location || 'Devinagar, Butwal'}
          sellerName={listing.seller?.username || 'Seller'}
        />
      </main>

      {/* Mobile Sticky Buy Box Bar (Requirement 4) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border p-2.5 px-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">
            {isSold ? 'Status' : 'Price'}
          </span>
          <span
            className={`font-mono font-bold text-sm sm:text-base block truncate ${
              isSold ? 'text-zinc-400 line-through' : 'text-primary'
            }`}
          >
            {formattedPrice}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isOwner ? (
            <>
              {!isSold ? (
                <Button
                  size="sm"
                  className="gap-1.5 text-xs font-medium h-9 px-4 rounded-none min-w-[130px]"
                  isLoading={startConvMutation.isPending}
                  onClick={handleMessageSeller}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Contact Seller</span>
                </Button>
              ) : (
                <span className="px-3 py-1.5 text-xs font-mono text-zinc-500 border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
                  Sold Out
                </span>
              )}
            </>
          ) : (
            <>
              {!isSold ? (
                <Link
                  to="/products/$listingId/edit"
                  params={{ listingId: listing.id }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs font-mono h-9 px-3 rounded-none"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit Listing</span>
                  </Button>
                </Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-mono text-zinc-500 border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
                  Sold
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
