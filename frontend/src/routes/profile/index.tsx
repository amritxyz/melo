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
import { UserAvatar, AvatarPicker } from '#/components/avatars'
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
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 px-4">
        <div className="max-w-md mx-auto text-center bg-white dark:bg-zinc-900 p-6 rounded-xs border border-zinc-200 dark:border-zinc-800">
          <UserIcon className="w-8 h-8 text-zinc-400 mx-auto mb-3 stroke-[1.5]" />
          <h2 className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 mb-1">
            Sign In Required
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
            Please log in to manage your public bio, seller details, and
            ratings.
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

  const memberSinceYear = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recently'

  const reviews = reviewsData?.reviews || []

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <Link
              to="/products"
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              marketplace
            </Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-zinc-100">profile</span>
            <span>/</span>
            <span className="text-zinc-500">@{profile?.username}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/users/$userId" params={{ userId: user.id }}>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 font-mono text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Public View</span>
              </Button>
            </Link>
            <Button
              onClick={handleOpenEdit}
              variant="outline"
              size="sm"
              className="gap-1.5 font-mono text-xs"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Button>
          </div>
        </div>

        {/* Profile Details Box */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xs p-5 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div
              className="cursor-pointer group relative shrink-0"
              onClick={handleOpenEdit}
              title="Click to edit profile"
            >
              <UserAvatar
                avatarUrl={profile?.avatar_url}
                username={profile?.username}
                size="xl"
                shape="square"
                className="border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800"
              />
              <div className="absolute inset-0 bg-zinc-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-mono rounded-xs">
                edit
              </div>
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-50">
                  {profile?.username}
                </h1>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  active member
                </span>
              </div>

              <div className="flex items-center gap-2">
                <RatingStars
                  rating={profile?.rating || 0}
                  totalCount={profile?.review_count || 0}
                  size="sm"
                />
              </div>

              {/* Bio */}
              <div className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed pt-1">
                {profile?.bio ? (
                  <p className="whitespace-pre-line">{profile.bio}</p>
                ) : (
                  <p className="text-zinc-400 dark:text-zinc-500 italic">
                    No bio provided. Click "Edit Profile" to add information
                    about yourself and your trades.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Meta Information Bar */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
            {profile?.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>{profile.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-zinc-400" />
              <span>{profile?.email}</span>
            </div>
            {profile?.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <span>{profile.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>Joined {memberSinceYear}</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xs p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                Rating
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-lg font-mono font-bold text-zinc-900 dark:text-zinc-50">
                  {profile?.rating ? profile.rating.toFixed(1) : '5.0'}
                </span>
                <span className="text-xs font-mono text-zinc-500">
                  / 5.0 ({profile?.review_count || 0})
                </span>
              </div>
            </div>
            <Star className="w-4 h-4 text-zinc-400 fill-zinc-300 dark:fill-zinc-700" />
          </div>

          <Link to="/profile/listings">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xs p-3.5 flex items-center justify-between hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer group">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                  Active Listings
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-lg font-mono font-bold text-zinc-900 dark:text-zinc-50">
                    {profile?.active_listings || 0}
                  </span>
                  <span className="text-xs font-mono text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                    Manage →
                  </span>
                </div>
              </div>
              <ShoppingBag className="w-4 h-4 text-zinc-400" />
            </div>
          </Link>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xs p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                Completed Sales
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-lg font-mono font-bold text-zinc-900 dark:text-zinc-50">
                  {profile?.sold_listings || 0}
                </span>
                <span className="text-xs font-mono text-zinc-500">
                  items sold
                </span>
              </div>
            </div>
            <CheckCircle2 className="w-4 h-4 text-zinc-400" />
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">
                Buyer Reviews
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Feedback submitted by buyers from completed transactions.
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          {reviewsLoading ? (
            <div className="py-6 text-center text-xs font-mono text-zinc-500">
              Loading reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xs">
              <Star className="w-6 h-6 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                No reviews recorded yet
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Buyer ratings will appear here after sales are finalized.
              </p>
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
                        {rev.reviewer?.username || 'Buyer'}
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
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50">
          <div className="bg-white dark:bg-zinc-900 rounded-xs border border-zinc-300 dark:border-zinc-700 max-w-lg w-full p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  Edit Profile
                </h3>
                <p className="text-xs text-zinc-500">
                  Update your bio, contact information, and avatar.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-xs bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 font-mono">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-700 dark:text-zinc-300 mb-1">
                  Bio / About You
                </label>
                <textarea
                  rows={3}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="Short description of what you buy and sell..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-xs border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-700 dark:text-zinc-300 mb-1">
                    Location
                  </label>
                  <Input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="e.g. Kathmandu"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-700 dark:text-zinc-300 mb-1">
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
                <label className="block text-xs font-mono text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Avatar Persona
                </label>
                <AvatarPicker
                  value={avatarInput}
                  onChange={(val) => setAvatarInput(val)}
                  disabled={isSaving}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isSaving}>
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
