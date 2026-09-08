import * as React from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { AlertCircle, ArrowLeft, ShieldAlert } from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { ListingForm } from '#/components/listings/ListingForm'
import { useAuth } from '#/hooks/useAuth'
import { useListing, useUpdateListing } from '#/hooks/useListings'
import type { CreateListingPayload } from '#/types/listing'

export const Route = createFileRoute('/products/$listingId/edit')({
  component: EditListingPage,
})

function EditListingPage() {
  const { listingId } = Route.useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const {
    data: listing,
    isLoading: listingLoading,
    error,
  } = useListing(listingId)
  const updateMutation = useUpdateListing()
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const handleUpdate = async (values: CreateListingPayload) => {
    setSubmitError(null)
    try {
      await updateMutation.mutateAsync({
        id: listingId,
        payload: {
          title: values.title,
          description: values.description,
          price: values.price,
          condition: values.condition,
          location: values.location,
          category_id: values.category_id,
        },
      })
      navigate({
        to: '/products/$listingId',
        params: { listingId },
      })
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message)
      } else {
        setSubmitError('Failed to update listing. Please try again.')
      }
    }
  }

  if (authLoading || listingLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500">Loading listing details...</p>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <ShieldAlert className="w-12 h-12 text-zinc-400 mx-auto mb-3 stroke-[1.5]" />
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Sign In Required
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Please sign in to edit your listings.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/login">
              <Button className="w-full">Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-2">Listing Not Found</h2>
        <p className="text-zinc-500 mb-6">
          The listing you are trying to edit does not exist.
        </p>
        <Link to="/profile/listings">
          <Button variant="outline">Back to My Listings</Button>
        </Link>
      </div>
    )
  }

  if (listing.seller_id !== user.id) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold mb-2">Unauthorized</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
            You do not have permission to edit this listing because you are not
            the owner.
          </p>
          <Link to="/products/$listingId" params={{ listingId }}>
            <Button variant="outline">View Listing</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (listing.status === 'sold') {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold mb-2">Item is Marked as Sold</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
            Sold listings cannot be edited or modified.
          </p>
          <Link to="/profile/listings">
            <Button variant="outline">Back to My Listings</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            to="/products/$listingId"
            params={{ listingId }}
            className="text-xs font-medium text-emerald-600 hover:text-emerald-500 mb-3 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Listing
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Edit Listing
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Update your item details, price, or location.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <ListingForm
            initialValues={{
              title: listing.title,
              category_id: listing.category_id,
              price: listing.price,
              condition: listing.condition,
              location: listing.location,
              description: listing.description,
            }}
            onSubmit={handleUpdate}
            isLoading={updateMutation.isPending}
            errorMessage={submitError}
            submitLabel="Save Changes"
          />
        </div>
      </div>
    </div>
  )
}
