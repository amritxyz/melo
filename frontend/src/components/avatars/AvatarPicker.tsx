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
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setTab('svg')}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-xs font-mono transition-colors cursor-pointer border ${
              tab === 'svg'
                ? 'bg-zinc-900 text-zinc-50 border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100'
                : 'text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <span>Avatars ({MELO_AVATARS.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-xs font-mono transition-colors cursor-pointer border ${
              tab === 'url'
                ? 'bg-zinc-900 text-zinc-50 border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100'
                : 'text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Image URL</span>
          </button>
        </div>

        {tab === 'svg' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRandomAvatar}
            disabled={disabled}
            className="text-xs h-7 gap-1 text-zinc-600 dark:text-zinc-400 font-mono"
          >
            <Shuffle className="w-3 h-3" />
            <span>Random</span>
          </Button>
        )}
      </div>

      {tab === 'svg' ? (
        <div className="space-y-3">
          {/* Active Avatar Highlight Box */}
          <div className="flex items-center gap-3 p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xs">
            <div className="w-12 h-12 rounded-xs overflow-hidden shrink-0 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800">
              <ActiveComponent className="w-full h-full" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                  {activeAvatar.name}
                </h4>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                  {activeAvatar.badge}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5 truncate">
                {activeAvatar.description}
              </p>
            </div>
          </div>

          {/* Avatar Grid */}
          <div>
            <span className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5">
              Available Avatars
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1.5 border border-zinc-200 dark:border-zinc-800 rounded-xs bg-zinc-50/50 dark:bg-zinc-950">
              {MELO_AVATARS.map((avatar) => {
                const isSelected = currentAvatarId === avatar.id && !isCustomUrl
                const AvatarComp = avatar.component
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => handleSelectSvg(avatar.id)}
                    disabled={disabled}
                    className={`group relative flex flex-col items-center p-1 rounded-xs transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-900 dark:border-zinc-100'
                        : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                    title={`${avatar.name} - ${avatar.description}`}
                  >
                    <div className="w-10 h-10 rounded-xs overflow-hidden border border-zinc-200 dark:border-zinc-700">
                      <AvatarComp className="w-full h-full" />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 mt-1 truncate max-w-full text-center">
                      {avatar.name.replace('Melo ', '')}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xs flex items-center justify-center">
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
            <label className="block text-xs font-mono text-zinc-700 dark:text-zinc-300 mb-1">
              Image URL
            </label>
            <Input
              type="url"
              value={customUrlInput}
              onChange={(e) => handleApplyCustomUrl(e.target.value)}
              placeholder="https://example.com/avatar.png"
              disabled={disabled}
            />
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Enter a direct link to any image (JPEG, PNG, WebP) to use as your
              profile picture.
            </span>
          </div>

          {customUrlInput && (
            <div className="flex items-center gap-3 p-2.5 rounded-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <img
                src={customUrlInput}
                alt="Preview"
                className="w-10 h-10 rounded-xs object-cover border border-zinc-200 dark:border-zinc-700"
                onError={(e) => {
                  ;(e.currentTarget as HTMLElement).style.display = 'none'
                }}
              />
              <div className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                Image URL preview
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
