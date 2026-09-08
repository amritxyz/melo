import * as React from 'react'
import { Button } from '#/components/ui/Button'
import { Input } from '#/components/ui/Input'
import { Select } from '#/components/ui/Select'
import { useCategories } from '#/hooks/useListings'
import type { CreateListingPayload, ListingCondition } from '#/types/listing'

interface ListingFormProps {
  onSubmit: (data: CreateListingPayload) => Promise<void>
  isLoading?: boolean
  errorMessage?: string | null
  initialValues?: Partial<CreateListingPayload>
  submitLabel?: string
}

const conditionOptions: { value: ListingCondition; label: string }[] = [
  { value: 'new', label: 'New (Never opened or used)' },
  { value: 'like_new', label: 'Like New (Minimal use, no flaws)' },
  { value: 'good', label: 'Good (Minor cosmetic wear, fully functional)' },
  { value: 'fair', label: 'Fair (Visible signs of use, works fine)' },
  { value: 'poor', label: 'Poor (Heavily worn or needs minor repair)' },
]

export function ListingForm({
  onSubmit,
  isLoading = false,
  errorMessage = null,
  initialValues = {},
  submitLabel = 'Publish Listing',
}: ListingFormProps) {
  const { data: categories = [], isLoading: loadingCategories } =
    useCategories()

  const [title, setTitle] = React.useState(initialValues.title || '')
  const [categoryId, setCategoryId] = React.useState(
    initialValues.category_id || '',
  )
  const [price, setPrice] = React.useState(
    initialValues.price ? String(initialValues.price) : '',
  )
  const [condition, setCondition] = React.useState<ListingCondition>(
    initialValues.condition || 'good',
  )
  const [location, setLocation] = React.useState(initialValues.location || '')
  const [description, setDescription] = React.useState(
    initialValues.description || '',
  )
  const [formError, setFormError] = React.useState<string | null>(null)

  // Default to first category if none selected
  React.useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id)
    }
  }, [categories, categoryId])

  // Sync state if initialValues change asynchronously
  React.useEffect(() => {
    if (initialValues.title !== undefined) setTitle(initialValues.title)
    if (initialValues.category_id !== undefined)
      setCategoryId(initialValues.category_id)
    if (initialValues.price !== undefined) setPrice(String(initialValues.price))
    if (initialValues.condition !== undefined)
      setCondition(initialValues.condition)
    if (initialValues.location !== undefined)
      setLocation(initialValues.location)
    if (initialValues.description !== undefined)
      setDescription(initialValues.description)
  }, [
    initialValues.title,
    initialValues.category_id,
    initialValues.price,
    initialValues.condition,
    initialValues.location,
    initialValues.description,
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!title.trim()) {
      setFormError('Please provide a listing title.')
      return
    }

    if (!categoryId) {
      setFormError('Please select a category.')
      return
    }

    const numPrice = parseFloat(price)
    if (isNaN(numPrice) || numPrice <= 0) {
      setFormError('Please enter a valid price greater than 0.')
      return
    }

    if (!location.trim()) {
      setFormError('Please provide a location (e.g. city or neighborhood).')
      return
    }

    if (description.trim().length < 10) {
      setFormError('Please write a description of at least 10 characters.')
      return
    }

    await onSubmit({
      title: title.trim(),
      category_id: categoryId,
      price: numPrice,
      condition,
      location: location.trim(),
      description: description.trim(),
    })
  }

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }))

  const activeError = formError || errorMessage

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {activeError && (
        <div
          role="alert"
          className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-sm text-red-600 dark:text-red-400"
        >
          {activeError}
        </div>
      )}

      {/* Title */}
      <Input
        label="Listing Title"
        required
        placeholder="e.g. Sony WH-1000XM4 Wireless Headphones"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        helperText="Mention key features like brand, model, or color."
      />

      {/* Category and Condition */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Category"
          required
          disabled={loadingCategories}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={categoryOptions}
          placeholder={
            loadingCategories ? 'Loading categories...' : 'Select Category'
          }
        />

        <Select
          label="Condition"
          required
          value={condition}
          onChange={(e) => setCondition(e.target.value as ListingCondition)}
          options={conditionOptions}
        />
      </div>

      {/* Price and Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Price (NPR)"
          type="number"
          min="1"
          step="any"
          required
          placeholder="e.g. 15000"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <Input
          label="Location"
          required
          placeholder="e.g. Kathmandu, Pokhara, Butwal"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="listing-description"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Description
        </label>
        <textarea
          id="listing-description"
          required
          rows={5}
          className="flex w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
          placeholder="Describe the condition, usage history, included accessories, or reasons for selling..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <p className="text-xs text-zinc-500">
          Be honest about wear and any defects.
        </p>
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          className="w-full sm:w-auto px-8"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
