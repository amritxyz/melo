import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { BUTWAL_LOCATIONS, SUPPORTED_LOCATIONS } from '#/types/location'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/**
 * Capitalizes the first letter of a word and lowercases the remainder,
 * preserving hyphenated parts (e.g. "butwal-10" -> "Butwal-10").
 */
export function capitalizeWord(word: string): string {
  const trimmed = word.trim()
  if (!trimmed) return ''

  if (trimmed.includes('-')) {
    return trimmed
      .split('-')
      .map((part) => capitalizeWord(part))
      .join('-')
  }

  if (trimmed.includes("'")) {
    return trimmed
      .split("'")
      .map((part) => capitalizeWord(part))
      .join("'")
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
}

/**
 * Formats a name, username, or text string into Title Case.
 * Example: "ram prasad bhattarai" -> "Ram Prasad Bhattarai"
 */
export function formatTitleCase(str: string | undefined | null): string {
  if (!str) return ''
  const words = str.trim().split(/\s+/)
  if (words.length === 0 || (words.length === 1 && words[0] === '')) return ''

  return words.map((w) => capitalizeWord(w)).join(' ')
}

export const formatName = formatTitleCase

/**
 * Formats a location string into Title Case, checking against canonical Butwal locations.
 * Example: "devinagar" or "devinagar, butwal" -> "Devinagar, Butwal"
 */
export function formatLocation(loc: string | undefined | null): string {
  if (!loc) return ''
  const trimmed = loc.trim()
  if (!trimmed) return ''

  const lower = trimmed.toLowerCase()

  // Match against canonical Butwal locations by full name or area name
  for (const item of SUPPORTED_LOCATIONS) {
    if (
      lower === item.name.toLowerCase() ||
      lower === item.area.toLowerCase() ||
      lower === `${item.area.toLowerCase()}, butwal`
    ) {
      return item.name
    }
  }

  // Check if string exactly matches one of BUTWAL_LOCATIONS (case-insensitive)
  for (const bl of BUTWAL_LOCATIONS) {
    if (lower === bl.toLowerCase()) {
      return bl
    }
  }

  // Format comma-separated segments into Title Case
  const segments = trimmed.split(',')
  return segments
    .map((seg) => {
      const words = seg.trim().split(/\s+/)
      return words.map((w) => capitalizeWord(w)).join(' ')
    })
    .filter(Boolean)
    .join(', ')
}
