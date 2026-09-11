import * as React from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { Input } from '#/components/ui/Input'
import { Select } from '#/components/ui/Select'
import { LocationSelect } from '#/components/ui/LocationSelect'
import { formatTitleCase, formatLocation } from '#/lib/utils'
import { useCategories } from '#/hooks/useListings'
import { uploadImageApi } from '#/lib/api'
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
  const [images, setImages] = React.useState<string[]>(
    initialValues.image_urls || [],
  )
  const [isUploading, setIsUploading] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

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
    if (initialValues.image_urls !== undefined)
      setImages(initialValues.image_urls)
  }, [
    initialValues.title,
    initialValues.category_id,
    initialValues.price,
    initialValues.condition,
    initialValues.location,
    initialValues.description,
    initialValues.image_urls,
  ])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > 5) {
      setFormError('You can upload a maximum of 5 images per listing.')
      return
    }

    setIsUploading(true)
    setFormError(null)

    try {
      const newUrls: string[] = []
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(
            `File "${file.name}" exceeds maximum allowed size of 5MB.`,
          )
        }
        const res = await uploadImageApi(file)
        newUrls.push(res.url)
      }
      setImages((prev) => [...prev, ...newUrls])
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message)
      } else {
        setFormError('Failed to upload image. Please try again.')
      }
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

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
      title: formatTitleCase(title),
      category_id: categoryId,
      price: numPrice,
      condition,
      location: formatLocation(location),
      description: description.trim(),
      image_urls: images,
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

        <LocationSelect
          label="Location"
          required
          placeholder="Select Butwal location or custom..."
          value={location}
          onChange={setLocation}
        />
      </div>

      {/* Image Upload Section */}
      <div className="space-y-2">
        <label className="text-xs font-mono text-zinc-700 dark:text-zinc-300 block">
          Product Images (Optional, max 5)
        </label>

        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
          />

          {images.length < 5 && (
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="h-20 w-20 flex flex-col items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xs bg-zinc-50 dark:bg-zinc-900/50 hover:border-zinc-500 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer text-center p-2"
            >
              {isUploading ? (
                <span className="text-[10px] font-mono animate-pulse">
                  Uploading...
                </span>
              ) : (
                <>
                  <Plus className="w-4 h-4 mb-1" />
                  <span className="text-[10px] font-mono leading-tight">
                    Add Photo
                  </span>
                </>
              )}
            </button>
          )}

          {/* Previews */}
          {images.map((url, idx) => (
            <div
              key={url + idx}
              className="relative h-20 w-20 border border-zinc-200 dark:border-zinc-800 rounded-xs overflow-hidden bg-zinc-100 dark:bg-zinc-800 group"
            >
              <img
                src={url}
                alt={`Product upload ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {idx === 0 && (
                <span className="absolute bottom-0 inset-x-0 bg-zinc-900/80 text-white text-[9px] font-mono text-center py-0.5">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1 right-1 p-0.5 bg-black/70 text-white rounded-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-600"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-zinc-500">
          Supported: JPEG, PNG, WebP (max 5MB each). First image is the cover
          photo.
        </p>
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
        <Button
          type="submit"
          size="md"
          variant="primary"
          isLoading={isLoading || isUploading}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
