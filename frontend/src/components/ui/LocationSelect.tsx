import * as React from 'react'
import { BUTWAL_LOCATIONS } from '#/types/location'
import { formatLocation, cn } from '#/lib/utils'
import { Input } from '#/components/ui/Input'

export interface LocationSelectProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
  required?: boolean
  className?: string
  id?: string
}

export const LocationSelect: React.FC<LocationSelectProps> = ({
  value,
  onChange,
  label = 'Location',
  placeholder = 'Select location...',
  error,
  required,
  className,
  id,
}) => {
  const isKnownButwal = BUTWAL_LOCATIONS.includes(
    value as (typeof BUTWAL_LOCATIONS)[number],
  )
  const [isCustom, setIsCustom] = React.useState(
    !isKnownButwal && Boolean(value),
  )
  const [customText, setCustomText] = React.useState(
    !isKnownButwal ? value : '',
  )

  React.useEffect(() => {
    if (isKnownButwal) {
      setIsCustom(false)
      setCustomText('')
    } else if (value) {
      setIsCustom(true)
      setCustomText(value)
    }
  }, [value, isKnownButwal])

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value
    if (selected === '__custom__') {
      setIsCustom(true)
      const nextVal = customText ? formatLocation(customText) : ''
      onChange(nextVal)
    } else {
      setIsCustom(false)
      onChange(selected)
    }
  }

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setCustomText(raw)
    onChange(formatLocation(raw))
  }

  const selectId =
    id || (label ? label.toLowerCase().replace(/\s+/g, '-') : 'location-select')

  return (
    <div className={cn('w-full flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <select
        id={selectId}
        value={isCustom ? '__custom__' : value}
        onChange={handleSelectChange}
        className={cn(
          'flex h-8 w-full rounded-sm border bg-white dark:bg-zinc-900 px-2.5 py-1 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          error
            ? 'border-red-600 focus:border-red-600'
            : 'border-zinc-300 dark:border-zinc-700',
        )}
      >
        <option value="">{placeholder}</option>
        <optgroup label="Butwal Locations">
          {BUTWAL_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </optgroup>
        <optgroup label="Other / Outside Butwal">
          <option value="__custom__">
            Custom location (Outside Butwal)...
          </option>
        </optgroup>
      </select>

      {isCustom && (
        <div className="mt-1">
          <Input
            placeholder="e.g. Kathmandu, Pokhara, Dharan..."
            value={customText}
            onChange={handleCustomChange}
            onBlur={() => {
              if (customText.trim()) {
                const formatted = formatLocation(customText)
                setCustomText(formatted)
                onChange(formatted)
              }
            }}
          />
          <p className="text-[11px] text-zinc-500 mt-1">
            Locations outside Butwal will be expanded into standard options in
            future updates.
          </p>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
