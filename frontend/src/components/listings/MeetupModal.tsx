import * as React from 'react'
import {
  MapPin,
  ShieldCheck,
  Navigation,
  ArrowRight,
  Copy,
  Check,
  X,
} from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { LocationSelect } from '#/components/ui/LocationSelect'
import { useMeetupSuggestion } from '#/hooks/useLocations'
import { formatLocation } from '#/lib/utils'

interface MeetupModalProps {
  isOpen: boolean
  onClose: () => void
  sellerLocation: string
  initialBuyerLocation?: string
  sellerName?: string
}

export function MeetupModal({
  isOpen,
  onClose,
  sellerLocation,
  initialBuyerLocation = 'Traffic Chowk, Butwal',
  sellerName = 'Seller',
}: MeetupModalProps) {
  const [buyerLoc, setBuyerLoc] = React.useState(initialBuyerLocation)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (initialBuyerLocation) {
      setBuyerLoc(initialBuyerLocation)
    }
  }, [initialBuyerLocation])

  const {
    data: suggestion,
    isLoading,
    isError,
  } = useMeetupSuggestion(buyerLoc, sellerLocation)

  if (!isOpen) return null

  const handleCopy = () => {
    if (suggestion?.hub_name) {
      navigator.clipboard.writeText(suggestion.hub_name)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50">
      <div className="bg-white dark:bg-zinc-900 rounded-none border border-zinc-300 dark:border-zinc-700 max-w-md w-full p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">
              Safe Meetup Point Calculator
            </h3>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              Calculates the most equitable and secure transit hub between
              parties.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3.5">
          {/* Location Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-none border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
            <div>
              <span className="block text-[11px] font-mono text-zinc-600 dark:text-zinc-400 mb-1">
                Your Location:
              </span>
              <LocationSelect
                value={buyerLoc}
                onChange={setBuyerLoc}
                label=""
                placeholder="Choose your area"
              />
            </div>
            <div>
              <span className="block text-[11px] font-mono text-zinc-600 dark:text-zinc-400 mb-1">
                {sellerName}'s Area:
              </span>
              <div className="h-9 px-2.5 flex items-center bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-none text-zinc-800 dark:text-zinc-200 font-mono text-xs">
                <MapPin className="w-3.5 h-3.5 text-zinc-400 mr-1.5 shrink-0" />
                <span className="truncate">
                  {formatLocation(sellerLocation) || 'Butwal'}
                </span>
              </div>
            </div>
          </div>

          {/* Computed Suggestion */}
          {isLoading ? (
            <div className="py-6 text-center text-xs font-mono text-zinc-400 animate-pulse">
              Finding optimal meetup location...
            </div>
          ) : isError || !suggestion ? (
            <div className="p-3 text-xs font-mono text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30 rounded-none border border-red-200 dark:border-red-900">
              Could not determine route between the selected locations.
            </div>
          ) : (
            <div className="space-y-3">
              {/* Highlight Result Box */}
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-none space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Recommended Exchange Hub
                  </span>
                  {suggestion.is_designated_safe_hub && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-none text-[10px] font-mono border border-zinc-400 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 bg-transparent">
                      <ShieldCheck className="w-3 h-3 text-zinc-700 dark:text-zinc-300" />
                      Safe Hub
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <div className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{suggestion.hub_name}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[10px] font-mono gap-1"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-zinc-900 dark:text-zinc-100" />
                    ) : (
                      <Copy className="w-3 h-3 text-zinc-400" />
                    )}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>

                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                  {suggestion.explanation}
                </p>
              </div>

              {/* Distance Matrix */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-none bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">
                    Your Travel
                  </span>
                  <span className="text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {suggestion.buyer_distance_km} km
                  </span>
                </div>
                <div className="p-2 rounded-none bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">
                    Seller Travel
                  </span>
                  <span className="text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {suggestion.seller_distance_km} km
                  </span>
                </div>
                <div className="p-2 rounded-none bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">
                    Disparity
                  </span>
                  <span className="text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {suggestion.distance_diff_km} km
                  </span>
                </div>
              </div>

              {/* Path Details */}
              {suggestion.buyer_path.length > 1 && (
                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/30 rounded-none border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                    Your Shortest Transit Path:
                  </span>
                  <div className="flex flex-wrap items-center gap-1 font-mono text-[10px] text-zinc-700 dark:text-zinc-300">
                    {suggestion.buyer_path.map((step, idx) => (
                      <React.Fragment key={step}>
                        <span className="px-1.5 py-0.5 rounded-none border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
                          {step}
                        </span>
                        {idx < suggestion.buyer_path.length - 1 && (
                          <ArrowRight className="w-2.5 h-2.5 text-zinc-400" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <Button
            variant="outline"
            size="sm"
            className="font-mono text-xs"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
