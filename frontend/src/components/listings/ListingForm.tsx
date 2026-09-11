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
  { value: 'new', label: 'New (never opened or used)' },
  { value: 'like_new', label: 'Like New (minimal use, perfect condition)' },
  { value: 'good', label: 'Good (minor cosmetic wear, fully functional)' },
  { value: 'fair', label: 'Fair (visible wear, works properly)' },
  { value: 'poor', label: 'Poor (heavy wear or needs attention)' },
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
    <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
      {activeError && (
        <div
          role="alert"
          className="p-2.5 rounded-xs bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900 text-red-700 dark:text-red-300"
        >
          {activeError}
        </div>
      )}

      {/* Title */}
      <Input
        label="Listing Title"
        required
        placeholder="e.g. ThinkPad T480 (i5, 16GB RAM, 256GB SSD)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        helperText="Specific title with brand and model."
      />

      {/* Category and Condition */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Category"
          required
          disabled={loadingCategories}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={categoryOptions}
          placeholder={loadingCategories ? 'Loading...' : 'Select Category'}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Price (NPR)"
          type="number"
          min="1"
          step="any"
          required
          placeholder="e.g. 24000"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <Input
          label="Location"
          required
          placeholder="e.g. Lalitpur, Kathmandu, Pokhara"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="listing-description"
          className="text-xs font-mono text-zinc-700 dark:text-zinc-300"
        >
          Description
        </label>
        <textarea
          id="listing-description"
          required
          rows={5}
          className="flex w-full rounded-xs border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-400 font-sans"
          placeholder="Provide accurate details regarding wear, battery health, included accessories..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <p className="text-[11px] text-zinc-500">Minimum 10 characters.</p>
      </div>

      <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
        <Button type="submit" size="md" variant="primary" isLoading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
