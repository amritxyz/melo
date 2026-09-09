import * as React from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import {
  User as UserIcon,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Pencil,
  ShoppingBag,
  Star,
  CheckCircle2,
  ExternalLink,
  X,
} from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { Input } from '#/components/ui/Input'
import { RatingStars } from '#/components/ui/RatingStars'
import { Navbar } from '#/components/layout/Navbar'
import { useAuth } from '#/hooks/useAuth'
import {
  useUserProfile,
  useUpdateProfile,
  useUserReviews,
} from '#/hooks/useUser'

export const Route = createFileRoute('/profile/')({
  component: ProfilePage,
})

function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)

  const {
    data: profile,
    isLoading: profileLoading,
    refetch,
  } = useUserProfile(user?.id)
  const { data: reviewsData, isLoading: reviewsLoading } = useUserReviews(
    user?.id,
  )

  const updateProfileMutation = useUpdateProfile()

  // Form states for profile editing
  const [bioInput, setBioInput] = React.useState('')
  const [locationInput, setLocationInput] = React.useState('')
  const [phoneInput, setPhoneInput] = React.useState('')
  const [avatarInput, setAvatarInput] = React.useState('')
  const [formError, setFormError] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    if (profile) {
      setBioInput(profile.bio || '')
      setLocationInput(profile.location || '')
      setPhoneInput(profile.phone || '')
      setAvatarInput(profile.avatar_url || '')
    }
  }, [profile])

  const handleOpenEdit = () => {
    if (profile) {
      setBioInput(profile.bio || '')
      setLocationInput(profile.location || '')
      setPhoneInput(profile.phone || '')
      setAvatarInput(profile.avatar_url || '')
      setFormError(null)
    }
    setIsEditModalOpen(true)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setIsSaving(true)

    try {
      await updateProfileMutation.mutateAsync({
        bio: bioInput.trim() || undefined,
        location: locationInput.trim() || undefined,
        phone: phoneInput.trim() || undefined,
        avatar_url: avatarInput.trim() || undefined,
      })
      await refetch()
      setIsEditModalOpen(false)
    } catch (err: any) {
      setFormError(err.message || 'Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || (isAuthenticated && profileLoading)) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500">Loading your profile...</p>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <UserIcon className="w-12 h-12 text-zinc-400 mx-auto mb-3 stroke-[1.5]" />
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Sign In to View Profile
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Please log in to manage your public bio, seller details, and view
            your ratings.
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

  const memberSinceYear = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recently'

  const reviews = reviewsData?.reviews || []

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      {/* Main Container */}

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Profile Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
          {/* Subtle decorative cover bar */}
          <div className="h-28 bg-linear-to-r from-emerald-500/20 via-teal-500/20 to-indigo-500/20 dark:from-emerald-900/30 dark:via-teal-900/30 dark:to-indigo-900/30 border-b border-zinc-200/50 dark:border-zinc-800/50" />

          <div className="px-6 sm:px-8 pb-8 -mt-12 sm:-mt-14">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              {/* Avatar & Basic Info */}
              <div className="flex items-end gap-5">
                <div className="relative">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-white dark:ring-zinc-900 shadow-md bg-zinc-100 dark:bg-zinc-800"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-3xl sm:text-4xl ring-4 ring-white dark:ring-zinc-900 shadow-md">
                      {profile?.username
                        ? profile.username.charAt(0).toUpperCase()
                        : 'U'}
                    </div>
                  )}
                </div>

                <div className="space-y-1 mb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                      {profile?.username}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                  <RatingStars
                    rating={profile?.rating || 0}
                    totalCount={profile?.review_count || 0}
                    size="sm"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 sm:pt-0">
                <Button
                  onClick={handleOpenEdit}
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Edit Profile</span>
                </Button>
                <Link to="/users/$userId" params={{ userId: user.id }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-zinc-600 dark:text-zinc-400"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Public View</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6 text-sm text-zinc-700 dark:text-zinc-300 max-w-2xl leading-relaxed">
              {profile?.bio ? (
                <p className="whitespace-pre-line">{profile.bio}</p>
              ) : (
                <p className="text-zinc-400 dark:text-zinc-500 italic">
                  No bio added yet. Tell buyers and sellers about what you buy
                  and sell!
                </p>
              )}
            </div>

            {/* Badges / Meta Information */}
            <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-zinc-600 dark:text-zinc-400">
              {profile?.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{profile.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-zinc-400" />
                <span>{profile?.email}</span>
              </div>
              {profile?.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-zinc-400" />
                  <span>{profile.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <span>Member since {memberSinceYear}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Seller Rating
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {profile?.rating ? profile.rating.toFixed(1) : '5.0'}
                </span>
                <span className="text-xs text-zinc-500">
                  / 5.0 ({profile?.review_count || 0} reviews)
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
          </div>

          <Link to="/profile/listings">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between hover:border-emerald-500/50 transition-colors cursor-pointer group">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Active Listings
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 transition-colors">
                    {profile?.active_listings || 0}
                  </span>
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
                    View Inventory →
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
          </Link>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Completed Sales
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {profile?.sold_listings || 0}
                </span>
                <span className="text-xs text-zinc-500">items sold</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Buyer Reviews & Feedback
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Ratings submitted by users who have bought items from you.
              </p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
            </span>
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
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                As buyers purchase items and rate their experience, their
                feedback will appear here.
              </p>
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
                      {rev.reviewer?.avatar_url ? (
                        <img
                          src={rev.reviewer.avatar_url}
                          alt={rev.reviewer.username}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center text-xs font-bold">
                          {rev.reviewer?.username
                            ? rev.reviewer.username.charAt(0).toUpperCase()
                            : 'U'}
                        </div>
                      )}
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {rev.reviewer?.username || 'Buyer'}
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
      </main>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-lg w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Edit Profile
                </h3>
                <p className="text-xs text-zinc-500">
                  Update your bio, contact info, and public marketplace details.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Bio / About You
                </label>
                <textarea
                  rows={3}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="Share a short intro, what you sell, or preferred meeting spots..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Location
                  </label>
                  <Input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="e.g. Kathmandu, Pokhara"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Phone Number
                  </label>
                  <Input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="e.g. +977 98XXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Avatar Image URL
                </label>
                <Input
                  type="url"
                  value={avatarInput}
                  onChange={(e) => setAvatarInput(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Provide an image URL for your profile picture.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
