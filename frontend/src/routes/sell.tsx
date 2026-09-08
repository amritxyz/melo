import * as React from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '#/components/ui/Button'
import { ListingForm } from '#/components/listings/ListingForm'
import { Navbar } from '#/components/layout/Navbar'
import { useAuth } from '#/hooks/useAuth'
import { useCreateListing } from '#/hooks/useListings'
import type { CreateListingPayload } from '#/types/listing'

export const Route = createFileRoute('/sell')({
  component: SellPage,
})

function SellPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const createListingMutation = useCreateListing()
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const handleCreateListing = async (payload: CreateListingPayload) => {
    setSubmitError(null)
    try {
      const newListing = await createListingMutation.mutateAsync(payload)
      navigate({
        to: '/products/$listingId',
        params: { listingId: newListing.id },
      })
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message)
      } else {
        setSubmitError('Failed to create listing. Please try again.')
      }
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500">Checking authentication...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Sign In to Sell
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            You must have an account to post a product listing on Melo.
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      <Navbar />
      <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            to="/"
            className="text-xs font-medium text-emerald-600 hover:text-emerald-500 mb-2 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Create a New Listing
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Fill out the details below to publish your used product on the
            marketplace.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <ListingForm
            onSubmit={handleCreateListing}
            isLoading={createListingMutation.isPending}
            errorMessage={submitError}
            submitLabel="Publish Listing"
          />
        </div>
      </div>
    </div>
    </div>
  )
}
