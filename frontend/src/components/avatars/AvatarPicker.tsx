import * as React from 'react'
import { Check, Sparkles, Image as ImageIcon, Shuffle } from 'lucide-react'
import {
  MELO_AVATARS,
  getAvatarDefinition,
  isAvatarId,
  normalizeAvatarId,
} from './registry'
import type { AvatarId } from './types'
import { Input } from '#/components/ui/Input'
import { Button } from '#/components/ui/Button'

export interface AvatarPickerProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const isCustomUrl = Boolean(value && !isAvatarId(value))
  const [tab, setTab] = React.useState<'svg' | 'url'>(
    isCustomUrl ? 'url' : 'svg',
  )
  const [customUrlInput, setCustomUrlInput] = React.useState(
    isCustomUrl ? value : '',
  )

  const currentAvatarId: AvatarId = normalizeAvatarId(value) || 'melo-neo'
  const activeAvatar = getAvatarDefinition(currentAvatarId) || MELO_AVATARS[0]

  const handleSelectSvg = (id: AvatarId) => {
    if (disabled) return
    onChange(id)
  }

  const handleRandomAvatar = () => {
    if (disabled) return
    const otherAvatars = MELO_AVATARS.filter((a) => a.id !== currentAvatarId)
    const index = Math.floor(Math.random() * otherAvatars.length)
    const random = otherAvatars[index] ?? MELO_AVATARS[0]
    onChange(random.id)
  }

  const handleApplyCustomUrl = (url: string) => {
    setCustomUrlInput(url)
    onChange(url.trim())
  }

  const ActiveComponent = activeAvatar.component

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab('svg')}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === 'svg'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            Melo Avatars ({MELO_AVATARS.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === 'url'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Custom Image URL
          </button>
        </div>

        {tab === 'svg' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRandomAvatar}
            disabled={disabled}
            className="text-xs h-7 gap-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <Shuffle className="w-3 h-3" />
            Surprise Me
          </Button>
        )}
      </div>

      {tab === 'svg' ? (
        <div className="space-y-4">
          {/* Active Avatar Highlight Card */}
          <div className="flex items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-md ring-2 ring-emerald-500/40">
              <ActiveComponent className="w-full h-full" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {activeAvatar.name}
                </h4>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {activeAvatar.badge}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                {activeAvatar.description}
              </p>
              <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <Check className="w-3 h-3" /> Selected Avatar
              </div>
            </div>
          </div>

          {/* Avatar Grid */}
          <div>
            <span className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Choose your Persona
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto p-1 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/50">
              {MELO_AVATARS.map((avatar) => {
                const isSelected = currentAvatarId === avatar.id && !isCustomUrl
                const AvatarComp = avatar.component
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => handleSelectSvg(avatar.id)}
                    disabled={disabled}
                    className={`group relative flex flex-col items-center p-1.5 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500 shadow-sm'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 border border-transparent'
                    }`}
                    title={`${avatar.name} - ${avatar.description}`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-2xs group-hover:scale-105 transition-transform duration-150">
                      <AvatarComp className="w-full h-full" />
                    </div>
                    <span className="text-[10px] font-medium text-zinc-700 dark:text-zinc-300 mt-1 truncate max-w-full text-center">
                      {avatar.name.replace('Melo ', '')}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Custom Image URL Mode */
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Image URL
            </label>
            <Input
              type="url"
              value={customUrlInput}
              onChange={(e) => handleApplyCustomUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              disabled={disabled}
            />
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Enter a direct link to any image (JPEG, PNG, WebP) to use as your
              profile picture.
            </span>
          </div>

          {customUrlInput && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <img
                src={customUrlInput}
                alt="Preview"
                className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
                onError={(e) => {
                  ;(e.currentTarget as HTMLElement).style.display = 'none'
                }}
              />
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                  Image URL Preview
                </span>
                Valid image links will show above.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
