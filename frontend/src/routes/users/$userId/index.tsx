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
} from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { ConditionBadge, StatusBadge } from '#/components/ui/Badge'
import { RatingStars } from '#/components/ui/RatingStars'
import { Navbar } from '#/components/layout/Navbar'
import { UserAvatar } from '#/components/avatars'
import { useAuth } from '#/hooks/useAuth'
import {
  useUserProfile,
  useUserReviews,
  useSubmitReview,
} from '#/hooks/useUser'
import { useListings } from '#/hooks/useListings'
import { useStartConversation } from '#/hooks/useChat'
import { formatCurrency } from '#/lib/utils'

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
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <UserIcon className="w-12 h-12 text-zinc-400 mx-auto mb-3 stroke-[1.5]" />
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            User Not Found
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            The profile you are looking for does not exist or has been removed.
          </p>
          <Link to="/products">
            <Button className="w-full">Explore Marketplace</Button>
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            ← Back to marketplace
          </Link>
        </div>
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
          {/* Header Banner Gradient */}
          <div className="h-28 bg-linear-to-r from-emerald-600/15 via-teal-600/15 to-blue-600/15 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-blue-950/40 border-b border-zinc-200/50 dark:border-zinc-800/50" />

          <div className="px-6 sm:px-8 pb-8 -mt-12 sm:-mt-14">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex items-end gap-5">
                <UserAvatar
                  avatarUrl={profile.avatar_url}
                  username={profile.username}
                  size="2xl"
                  shape="rounded"
                  className="ring-4 ring-white dark:ring-zinc-900 shadow-md bg-zinc-100 dark:bg-zinc-800"
                />

                <div className="space-y-1 mb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                      {profile.username}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                      <CheckCircle2 className="w-3 h-3" />
                      Seller
                    </span>
                  </div>
                  <RatingStars
                    rating={profile.rating}
                    totalCount={profile.review_count}
                    size="sm"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {!isSelf ? (
                <div className="flex items-center gap-2 pt-2 sm:pt-0">
                  <Button
                    size="sm"
                    onClick={handleMessageSeller}
                    isLoading={startConvMutation.isPending}
                    className="gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Message Seller</span>
                  </Button>
                  <Button
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate({ to: '/login' })
                      } else {
                        setIsReviewModalOpen(true)
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                  >
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>Rate & Review</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-2 sm:pt-0">
                  <Link to="/profile">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Pencil className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="mt-6 text-sm text-zinc-700 dark:text-zinc-300 max-w-2xl leading-relaxed">
              {profile.bio ? (
                <p className="whitespace-pre-line">{profile.bio}</p>
              ) : (
                <p className="text-zinc-400 dark:text-zinc-500 italic">
                  This seller has not added a bio yet.
                </p>
              )}
            </div>

            {/* Meta Details */}
            <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-zinc-600 dark:text-zinc-400">
              {profile.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-zinc-400" />
                  <span>{profile.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <span>Member since {memberSince}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'active'
                ? 'bg-emerald-600 text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Active Listings ({activeListings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sold')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'sold'
                ? 'bg-emerald-600 text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Sold ({soldListings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'bg-emerald-600 text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Reviews ({reviews.length})</span>
          </button>
        </div>

        {/* Tab 1: Active Listings */}
        {activeTab === 'active' && (
          <div>
            {activeLoading ? (
              <div className="py-12 text-center text-sm text-zinc-500">
                Loading listings...
              </div>
            ) : activeListings.length === 0 ? (
              <div className="py-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                <ShoppingBag className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  No active listings right now
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Check back later or browse other marketplace items.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {activeListings.map((item) => (
                  <Link
                    key={item.id}
                    to="/products/$listingId"
                    params={{ listingId: item.id }}
                    className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col"
                  >
                    <div className="h-44 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center relative">
                      <Tag className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
                      <div className="absolute top-3 left-3">
                        <ConditionBadge condition={item.condition} size="sm" />
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1 justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-zinc-500 line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(item.price)}
                        </span>
                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {item.location}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Sold Items */}
        {activeTab === 'sold' && (
          <div>
            {soldLoading ? (
              <div className="py-12 text-center text-sm text-zinc-500">
                Loading sold listings...
              </div>
            ) : soldListings.length === 0 ? (
              <div className="py-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                <CheckCircle2 className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  No sold items yet
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  When items are sold, they will show up in this seller history.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {soldListings.map((item) => (
                  <Link
                    key={item.id}
                    to="/products/$listingId"
                    params={{ listingId: item.id }}
                    className="opacity-75 hover:opacity-100 group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs transition-all flex flex-col"
                  >
                    <div className="h-44 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center relative">
                      <Tag className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
                      <div className="absolute top-3 left-3">
                        <StatusBadge status="sold" size="sm" />
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1 justify-between gap-2">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <span className="font-bold text-zinc-500 line-through">
                          {formatCurrency(item.price)}
                        </span>
                        <span className="text-xs text-zinc-400">Sold</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === 'reviews' && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Seller Feedback
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Verified ratings and reviews from previous transactions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
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
              <div className="py-8 text-center text-sm text-zinc-500">
                Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <Star className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  No reviews yet
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Be the first buyer to leave a review for {profile.username}!
                </p>
                {!isSelf && (
                  <Button
                    size="sm"
                    className="mt-4"
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
                )}
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="py-4 first:pt-0 last:pb-0 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          avatarUrl={rev.reviewer?.avatar_url}
                          username={rev.reviewer?.username}
                          size="sm"
                          shape="circle"
                        />
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {rev.reviewer?.username || 'Verified Buyer'}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-400">
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
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-md w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Review {profile.username}
                </h3>
                <p className="text-xs text-zinc-500">
                  Share your experience with this seller.
                </p>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewError && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                {reviewError}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Your Rating
                </label>
                <div className="flex items-center gap-3">
                  <RatingStars
                    rating={ratingVal}
                    interactive
                    onChange={(r) => setRatingVal(r)}
                    size="lg"
                    showScore={false}
                  />
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {ratingVal} out of 5 stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Your Feedback Comment
                </label>
                <textarea
                  rows={4}
                  value={commentVal}
                  onChange={(e) => setCommentVal(e.target.value)}
                  placeholder="Describe your buying experience, communication, item condition, etc..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsReviewModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
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
