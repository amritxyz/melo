import { RotateCcw } from 'lucide-react'
import type { Category } from '#/types/listing'
import { BUTWAL_LOCATIONS } from '#/types/location'

export type SortOption = 'newest' | 'price_asc' | 'price_desc'

export interface FilterSidebarProps {
  categories: Category[]
  loadingCategories?: boolean
  selectedCategory: string
  onSelectCategory: (id: string) => void
  selectedCondition: string
  onSelectCondition: (condition: string) => void
  selectedLocation: string
  onSelectLocation: (location: string) => void
  sortBy: SortOption
  onSelectSortBy: (sort: SortOption) => void
  hasFilters: boolean
  onReset: () => void
  isOpenOnMobile?: boolean
}

const CONDITIONS: { id: string; label: string }[] = [
  { id: 'all', label: 'Any Condition' },
  { id: 'new', label: 'New' },
  { id: 'like_new', label: 'Like New' },
  { id: 'good', label: 'Good' },
  { id: 'fair', label: 'Fair' },
  { id: 'poor', label: 'Poor' },
]

export function FilterSidebar({
  categories,
  loadingCategories = false,
  selectedCategory,
  onSelectCategory,
  selectedCondition,
  onSelectCondition,
  selectedLocation,
  onSelectLocation,
  sortBy,
  onSelectSortBy,
  hasFilters,
  onReset,
  isOpenOnMobile = false,
}: FilterSidebarProps) {
  return (
    <aside
      className={`md:col-span-1 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 p-3 rounded-xs space-y-4 text-xs ${
        isOpenOnMobile ? 'block mb-4' : 'hidden md:block'
      }`}
    >
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <span className="font-mono font-bold uppercase text-[11px] text-zinc-700 dark:text-zinc-300">
          Filters
        </span>
        {hasFilters && (
          <button
            onClick={onReset}
            className="font-mono text-[10px] text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <span className="font-mono text-[11px] font-semibold text-zinc-500 uppercase block mb-1.5">
          Category
        </span>
        <div className="space-y-0.5">
          <button
            onClick={() => onSelectCategory('')}
            className={`w-full text-left px-2 py-1 rounded-xs transition-colors cursor-pointer flex items-center justify-between ${
              selectedCategory === ''
                ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 font-semibold'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <span>All Categories</span>
          </button>
          {!loadingCategories &&
            categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`w-full text-left px-2 py-1 rounded-xs transition-colors cursor-pointer flex items-center justify-between ${
                  selectedCategory === cat.id
                    ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 font-semibold'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
        </div>
      </div>

      {/* Condition Filter */}
      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
        <span className="font-mono text-[11px] font-semibold text-zinc-500 uppercase block mb-1.5">
          Condition
        </span>
        <div className="space-y-0.5">
          {CONDITIONS.map((cond) => (
            <button
              key={cond.id}
              onClick={() => onSelectCondition(cond.id)}
              className={`w-full text-left px-2 py-1 rounded-xs transition-colors cursor-pointer flex items-center justify-between ${
                selectedCondition === cond.id
                  ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 font-semibold'
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <span>{cond.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Location Filter */}
      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
        <span className="font-mono text-[11px] font-semibold text-zinc-500 uppercase block mb-1.5">
          Location (Butwal)
        </span>
        <select
          value={selectedLocation}
          onChange={(e) => onSelectLocation(e.target.value)}
          className="w-full h-8 px-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xs text-zinc-900 dark:text-zinc-100 cursor-pointer"
        >
          <option value="">All Locations</option>
          {BUTWAL_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Sorting */}
      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
        <span className="font-mono text-[11px] font-semibold text-zinc-500 uppercase block mb-1.5">
          Sort by
        </span>
        <select
          value={sortBy}
          onChange={(e) => onSelectSortBy(e.target.value as SortOption)}
          className="w-full h-8 px-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xs text-zinc-900 dark:text-zinc-100 cursor-pointer"
        >
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </aside>
  )
}
