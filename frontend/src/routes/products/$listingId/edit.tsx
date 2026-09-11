import * as React from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '#/components/ui/Button'
import { ListingForm } from '#/components/listings/ListingForm'
import { Navbar } from '#/components/layout/Navbar'
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
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="p-8 text-xs font-mono text-zinc-500">
          Loading listing details...
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="max-w-md mx-auto py-16 px-4 text-center">
          <div className="border border-zinc-300 dark:border-zinc-700 p-6 rounded-xs bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3 text-xs font-mono">
            <h2 className="text-sm font-bold uppercase">
              Authentication Required
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Please sign in to modify your listing.
            </p>
            <Link to="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="max-w-md mx-auto py-16 px-4 text-center">
          <div className="border border-zinc-300 dark:border-zinc-700 p-6 rounded-xs bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3 text-xs font-mono">
            <h2 className="text-sm font-bold uppercase">Listing Not Found</h2>
            <p className="text-zinc-500">
              The requested listing does not exist.
            </p>
            <Link to="/profile/listings">
              <Button variant="outline" size="sm">
                Back to My Listings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (listing.seller_id !== user.id) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="max-w-md mx-auto py-16 px-4 text-center">
          <div className="border border-zinc-300 dark:border-zinc-700 p-6 rounded-xs bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3 text-xs font-mono">
            <h2 className="text-sm font-bold uppercase text-red-600">
              Access Denied
            </h2>
            <p className="text-zinc-500">
              You are not the owner of this listing.
            </p>
            <Link to="/products/$listingId" params={{ listingId }}>
              <Button variant="outline" size="sm">
                View Listing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (listing.status === 'sold') {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="max-w-md mx-auto py-16 px-4 text-center">
          <div className="border border-zinc-300 dark:border-zinc-700 p-6 rounded-xs bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3 text-xs font-mono">
            <h2 className="text-sm font-bold uppercase">Listing is Sold</h2>
            <p className="text-zinc-500">Sold items cannot be edited.</p>
            <Link to="/profile/listings">
              <Button variant="outline" size="sm">
                Back to My Listings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      <Navbar />

      {/* Breadcrumb Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 py-2.5 px-4 text-xs font-mono">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            to="/products/$listingId"
            params={{ listingId }}
            className="text-zinc-500 hover:underline"
          >
            ← Cancel and return to listing
          </Link>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase">
            Edit Item
          </span>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 w-full flex-1 space-y-4">
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 rounded-xs space-y-4">
          <div>
            <h1 className="text-sm font-bold font-mono uppercase text-zinc-900 dark:text-zinc-100">
              Edit Listing Details
            </h1>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              Update pricing, condition, description, or location.
            </p>
          </div>

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
      </main>
    </div>
  )
}
