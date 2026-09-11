import type React from 'react'

export type AvatarId =
  | 'melo-neo'
  | 'melo-astro'
  | 'melo-beats'
  | 'melo-sprout'
  | 'melo-bot'
  | 'melo-ninja'
  | 'melo-sleuth'
  | 'melo-gamer'
  | 'melo-mystic'
  | 'melo-chill'
  | 'melo-pilot'
  | 'melo-spark'

export interface AvatarMetadata {
  id: AvatarId
  name: string
  theme: string
  description: string
  badge: string
  bgGradient: string
  component: React.ComponentType<{ className?: string }>
}
