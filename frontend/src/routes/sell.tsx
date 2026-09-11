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
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="p-8 text-xs font-mono text-zinc-500">
          Checking authorization...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
        <Navbar />
        <div className="max-w-md mx-auto py-16 px-4 text-center space-y-3">
          <div className="border border-zinc-300 dark:border-zinc-700 p-6 rounded-xs bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3">
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider">
              Authentication Required
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              You must sign in to an account to post listings on Melo.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <Link to="/login">
                <Button size="sm" variant="primary">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" variant="outline">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 py-2.5 px-4 text-xs font-mono">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-zinc-500 hover:underline">
            ← Marketplace
          </Link>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase">
            New Listing
          </span>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 w-full flex-1 space-y-4">
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 rounded-xs space-y-4">
          <div>
            <h1 className="text-sm font-bold font-mono uppercase text-zinc-900 dark:text-zinc-100">
              Create Listing
            </h1>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              Enter product specifications to publish to the local directory.
            </p>
          </div>

          <ListingForm
            onSubmit={handleCreateListing}
            isLoading={createListingMutation.isPending}
            errorMessage={submitError}
            submitLabel="Publish Listing"
          />
        </div>
      </main>
    </div>
  )
}
