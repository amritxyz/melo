import * as React from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  User as UserIcon,
  MapPin,
  Calendar,
  Phone,
  MessageSquare,
  Star,
  ShoppingBag,
  CheckCircle2,
  Tag,
  X,
  Pencil,
  Share2,
  Check,
  LayoutGrid,
  List,
} from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { ConditionBadge, StatusBadge } from '#/components/ui/Badge'
import { RatingStars } from '#/components/ui/RatingStars'
import { Navbar } from '#/components/layout/Navbar'
import { UserAvatar } from '#/components/avatars'
import { ProductGrid } from '#/components/listings/ProductGrid'
import { useAuth } from '#/hooks/useAuth'
import {
  useUserProfile,
  useUserReviews,
  useSubmitReview,
} from '#/hooks/useUser'
import { useListings } from '#/hooks/useListings'
import { useStartConversation } from '#/hooks/useChat'
import {
  formatCurrency,
  formatName,
  formatLocation,
  formatTitleCase,
} from '#/lib/utils'

export const Route = createFileRoute('/users/$userId/')({
  component: PublicUserProfilePage,
})

function PublicUserProfilePage() {
  const { userId } = Route.useParams()
  const navigate = useNavigate()
  const { user: currentUser, isAuthenticated } = useAuth()

  const [activeTab, setActiveTab] = React.useState<
    'active' | 'sold' | 'reviews'
  >('active')
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [copied, setCopied] = React.useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = React.useState(false)
  const [ratingVal, setRatingVal] = React.useState(5)
  const [commentVal, setCommentVal] = React.useState('')
  const [reviewError, setReviewError] = React.useState<string | null>(null)

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useUserProfile(userId)
  const { data: reviewsData, isLoading: reviewsLoading } =
    useUserReviews(userId)

  // Seller's active listings
  const { data: activeListingsData, isLoading: activeLoading } = useListings({
    seller_id: userId,
    status: 'active',
    limit: 50,
  })

  // Seller's sold listings
  const { data: soldListingsData, isLoading: soldLoading } = useListings({
    seller_id: userId,
    status: 'sold',
    limit: 50,
  })

  const submitReviewMutation = useSubmitReview(userId)
  const startConvMutation = useStartConversation()

  const isSelf = currentUser?.id === userId
  const reviews = reviewsData?.reviews || []
  const activeListings = activeListingsData?.listings || []
  const soldListings = soldListingsData?.listings || []

  const positiveRate =
    reviews.length > 0
      ? Math.round(
          (reviews.filter((r) => r.rating >= 4).length / reviews.length) * 100,
        )
      : null

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleMessageSeller = async () => {
    if (!isAuthenticated) {
      navigate({ to: '/login' })
      return
    }

    if (isSelf) return

    // Pick first active listing or navigate to messages
    const listingId = activeListings[0]?.id
    if (!listingId) {
      navigate({ to: '/messages' })
      return
    }

    try {
      const conv = await startConvMutation.mutateAsync(listingId)
      navigate({ to: '/messages', search: { conversationId: conv.id } })
    } catch (err) {
      navigate({ to: '/messages' })
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setReviewError(null)

    if (!isAuthenticated) {
      navigate({ to: '/login' })
      return
    }

    if (commentVal.trim() === '') {
      setReviewError('Please provide a comment for your review.')
      return
    }

    try {
      await submitReviewMutation.mutateAsync({
        rating: ratingVal,
        comment: commentVal.trim(),
      })
      setIsReviewModalOpen(false)
      setCommentVal('')
      setActiveTab('reviews')
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review.')
    }
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500">Loading seller profile...</p>
      </div>
    )
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 px-4">
        <div className="max-w-md mx-auto text-center bg-white dark:bg-zinc-900 p-6 rounded-none border border-zinc-200 dark:border-zinc-800">
          <UserIcon className="w-8 h-8 text-zinc-400 mx-auto mb-3 stroke-[1.5]" />
          <h2 className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 mb-1">
            User Not Found
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
            The profile you are looking for does not exist or has been removed.
          </p>
          <Link to="/">
            <Button className="w-full font-mono text-xs">
              Explore Marketplace
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Breadcrumb / Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
            <Link
              to="/"
              className="hover:text-zinc-900 dark:hover:text-zinc-100 shrink-0"
            >
              marketplace
            </Link>
            <span className="shrink-0">/</span>
            <span className="text-zinc-500 shrink-0">seller</span>
            <span className="shrink-0">/</span>
            <span className="text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] sm:max-w-none">
              @{profile.username}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-1.5 font-mono text-xs flex-1 sm:flex-initial"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </Button>

            {!isSelf ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate({ to: '/login' })
                    } else {
                      setIsReviewModalOpen(true)
                    }
                  }}
                  className="gap-1.5 font-mono text-xs flex-1 sm:flex-initial"
                >
                  <Star className="w-3.5 h-3.5" />
                  <span>Review</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleMessageSeller}
                  isLoading={startConvMutation.isPending}
                  className="gap-1.5 font-mono text-xs w-full sm:w-auto"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Message Seller</span>
                </Button>
              </>
            ) : (
              <Link to="/profile" className="flex-1 sm:flex-initial">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto gap-1.5 font-mono text-xs"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none p-5 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <UserAvatar
              avatarUrl={profile.avatar_url}
              username={profile.username}
              size="xl"
              shape="square"
              className="border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shrink-0"
            />

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-50">
                  {formatName(profile.username)}
                </h1>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-none text-[10px] font-mono bg-transparent text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                  <CheckCircle2 className="w-3 h-3 text-zinc-500" />
                  seller
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <RatingStars
                  rating={profile.rating}
                  totalCount={profile.review_count}
                  size="sm"
                />
                {positiveRate !== null && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-none text-[10px] font-mono bg-transparent text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                    {positiveRate}% Positive Feedback
                  </span>
                )}
              </div>

              {/* Bio */}
              <div className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed pt-1">
                {profile.bio ? (
                  <p className="whitespace-pre-line font-sans">{profile.bio}</p>
                ) : (
                  <p className="text-zinc-400 dark:text-zinc-500 italic font-sans">
                    This seller has not added a bio yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Meta Information Bar */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
            {profile.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>{formatLocation(profile.location)}</span>
              </div>
            )}
            {profile.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <span>{profile.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>Joined {memberSince}</span>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-2.5 py-1 text-xs font-mono rounded-none border transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'active'
                  ? 'bg-zinc-900 text-zinc-50 border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100'
                  : 'text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Active Listings [{activeListings.length}]</span>
            </button>

            <button
              onClick={() => setActiveTab('sold')}
              className={`px-2.5 py-1 text-xs font-mono rounded-none border transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'sold'
                  ? 'bg-zinc-900 text-zinc-50 border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100'
                  : 'text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sold [{soldListings.length}]</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-2.5 py-1 text-xs font-mono rounded-none border transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'bg-zinc-900 text-zinc-50 border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100'
                  : 'text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Reviews [{reviews.length}]</span>
            </button>
          </div>

          {activeTab !== 'reviews' && (
            <div className="hidden sm:flex items-center border border-zinc-300 dark:border-zinc-700 rounded-none overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
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
                onClick={() => setViewMode('list')}
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

        {/* Tab 1: Active Listings */}
        {activeTab === 'active' && (
          <ProductGrid
            listings={activeListings}
            isLoading={activeLoading}
            viewMode={viewMode}
            emptyMessage="No active listings currently available from this seller."
          />
        )}

        {/* Tab 2: Sold Items */}
        {activeTab === 'sold' && (
          <ProductGrid
            listings={soldListings}
            isLoading={soldLoading}
            viewMode={viewMode}
            emptyMessage="No sold items recorded for this seller."
          />
        )}

        {/* Tab 3: Reviews */}
        {activeTab === 'reviews' && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h2 className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  Seller Feedback
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Verified ratings and reviews from previous transactions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-50">
                  {profile.rating > 0 ? profile.rating.toFixed(1) : '—'}
                </span>
                <RatingStars
                  rating={profile.rating}
                  showScore={false}
                  size="sm"
                />
              </div>
            </div>

            {reviewsLoading ? (
              <div className="py-8 text-center text-xs font-mono text-zinc-500">
                Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-none p-6 space-y-2">
                <Star className="w-6 h-6 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300">
                  No reviews recorded yet
                </p>
                <p className="text-xs text-zinc-500">
                  Be the first buyer to review {profile.username}.
                </p>
                {!isSelf && (
                  <div className="pt-2">
                    <Button
                      size="sm"
                      className="font-mono text-xs"
                      onClick={() => {
                        if (!isAuthenticated) {
                          navigate({ to: '/login' })
                        } else {
                          setIsReviewModalOpen(true)
                        }
                      }}
                    >
                      Write a Review
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="py-3.5 first:pt-0 last:pb-0 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          avatarUrl={rev.reviewer?.avatar_url}
                          username={rev.reviewer?.username}
                          size="xs"
                          shape="square"
                        />
                        <span className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                          {formatName(
                            rev.reviewer?.username || 'Verified Buyer',
                          )}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-zinc-400">
                        {new Date(rev.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <RatingStars
                      rating={rev.rating}
                      showScore={false}
                      size="sm"
                    />
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 font-sans">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Write Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50">
          <div className="bg-white dark:bg-zinc-900 rounded-none border border-zinc-300 dark:border-zinc-700 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  Review @{profile.username}
                </h3>
                <p className="text-xs text-zinc-500">
                  Share your buying experience with this seller.
                </p>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reviewError && (
              <div className="p-2.5 rounded-none bg-destructive/10 border border-destructive/30 text-xs text-destructive font-mono">
                {reviewError}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Rating
                </label>
                <div className="flex items-center gap-3">
                  <RatingStars
                    rating={ratingVal}
                    interactive
                    onChange={(r) => setRatingVal(r)}
                    size="md"
                    showScore={false}
                  />
                  <span className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                    {ratingVal} / 5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-700 dark:text-zinc-300 mb-1">
                  Feedback Comment
                </label>
                <textarea
                  rows={4}
                  value={commentVal}
                  onChange={(e) => setCommentVal(e.target.value)}
                  placeholder="Item condition, responsiveness, transaction notes..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-none border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-500 font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReviewModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={submitReviewMutation.isPending}
                >
                  Submit Review
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
