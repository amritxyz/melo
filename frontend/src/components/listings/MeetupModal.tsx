import * as React from 'react'
import {
  MapPin,
  ShieldCheck,
  Navigation,
  ArrowRight,
  Copy,
  Check,
  X,
  Sparkles,
} from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { LocationSelect } from '#/components/ui/LocationSelect'
import { useMeetupSuggestion } from '#/hooks/useLocations'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                Safe Meetup Point Finder
                <span className="text-[10px] font-mono font-normal px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300">
                  Dijkstra Algorithm
                </span>
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Calculates the fairest, safest central meeting junction on the Butwal road graph.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Location Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded border border-zinc-200 dark:border-zinc-800 text-xs">
            <div>
              <span className="font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Your Starting Area:
              </span>
              <LocationSelect
                value={buyerLoc}
                onChange={setBuyerLoc}
                label=""
                placeholder="Choose your location"
              />
            </div>
            <div>
              <span className="font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                {sellerName}'s Location:
              </span>
              <div className="h-9 px-3 flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xs text-zinc-800 dark:text-zinc-200 font-mono text-xs">
                <MapPin className="w-3.5 h-3.5 text-zinc-400 mr-1.5 shrink-0" />
                <span className="truncate">{sellerLocation || 'Butwal'}</span>
              </div>
            </div>
          </div>

          {/* Computed Suggestion */}
          {isLoading ? (
            <div className="py-8 text-center text-xs font-mono text-zinc-500 animate-pulse">
              Computing graph shortest paths via Dijkstra...
            </div>
          ) : isError || !suggestion ? (
            <div className="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/30 rounded border border-rose-200 dark:border-rose-900">
              Could not determine a connecting meetup route for the selected locations.
            </div>
          ) : (
            <div className="space-y-3">
              {/* Highlight Card */}
              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Recommended Meetup Hub
                  </div>
                  {suggestion.is_designated_safe_hub && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                      <ShieldCheck className="w-3 h-3" />
                      Designated Safe Hub
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    {suggestion.hub_name}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={handleCopy}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 italic pt-0.5">
                  "{suggestion.explanation}"
                </p>
              </div>

              {/* Distance Matrix */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                    Your Travel
                  </span>
                  <span className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {suggestion.buyer_distance_km} km
                  </span>
                </div>
                <div className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                    Seller Travel
                  </span>
                  <span className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {suggestion.seller_distance_km} km
                  </span>
                </div>
                <div className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                    Travel Difference
                  </span>
                  <span className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {suggestion.distance_diff_km} km
                  </span>
                </div>
              </div>

              {/* Path Details */}
              {suggestion.buyer_path.length > 1 && (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/30 rounded border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
                  <span className="font-semibold text-[11px] text-zinc-700 dark:text-zinc-300 block">
                    Your Shortest Transit Route:
                  </span>
                  <div className="flex flex-wrap items-center gap-1 font-mono text-[11px] text-zinc-600 dark:text-zinc-300">
                    {suggestion.buyer_path.map((step, idx) => (
                      <React.Fragment key={step}>
                        <span className="px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-700/50">
                          {step}
                        </span>
                        {idx < suggestion.buyer_path.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-zinc-400" />
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
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end bg-zinc-50/50 dark:bg-zinc-800/30">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
