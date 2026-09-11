import * as React from 'react'
import {
  getAvatarDefinition,
  getDeterministicAvatar,
  isAvatarId,
} from './registry'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type AvatarShape = 'circle' | 'rounded'

export interface UserAvatarProps {
  avatarUrl?: string | null
  username?: string | null
  size?: AvatarSize
  shape?: AvatarShape
  className?: string
  fallbackMode?: 'svg' | 'initials'
  alt?: string
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-2xl',
  '2xl': 'w-24 h-24 sm:w-28 sm:h-28 text-3xl sm:text-4xl',
}

const shapeClasses: Record<AvatarShape, string> = {
  circle: 'rounded-full',
  rounded: 'rounded-2xl',
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  username,
  size = 'md',
  shape = 'circle',
  className = '',
  fallbackMode = 'svg',
  alt,
}) => {
  const [imageError, setImageError] = React.useState(false)

  // Reset image error if avatarUrl changes
  React.useEffect(() => {
    setImageError(false)
  }, [avatarUrl])

  const sizeClass = sizeClasses[size]
  const shapeClass = shapeClasses[shape]
  const containerClass = `relative inline-flex items-center justify-center shrink-0 overflow-hidden select-none aspect-square ${sizeClass} ${shapeClass} ${className}`

  // 1. Check if avatarUrl is a registered Melo SVG avatar ID
  if (avatarUrl && isAvatarId(avatarUrl)) {
    const avatarDef = getAvatarDefinition(avatarUrl)
    if (avatarDef) {
      const AvatarSvg = avatarDef.component
      return (
        <div className={containerClass} title={avatarDef.name}>
          <AvatarSvg className="w-full h-full object-cover" />
        </div>
      )
    }
  }

  // 2. Check if avatarUrl is an external image URL and not errored
  if (avatarUrl && !imageError) {
    return (
      <div className={containerClass}>
        <img
          src={avatarUrl}
          alt={alt || username || 'User avatar'}
          onError={() => setImageError(true)}
          className={`w-full h-full object-cover ${shapeClass}`}
        />
      </div>
    )
  }

  // 3. Fallback: Either deterministic SVG avatar or styled initials
  if (fallbackMode === 'svg') {
    const fallbackAvatar = getDeterministicAvatar(username || undefined)
    const FallbackSvg = fallbackAvatar.component
    return (
      <div className={containerClass} title={username || fallbackAvatar.name}>
        <FallbackSvg className="w-full h-full object-cover" />
      </div>
    )
  }

  const initial = username ? username.trim().charAt(0).toUpperCase() : 'U'
  return (
    <div
      className={`${containerClass} bg-linear-to-br from-emerald-500 to-teal-700 text-white font-bold shadow-2xs`}
      title={username || 'User'}
    >
      {initial}
    </div>
  )
}
