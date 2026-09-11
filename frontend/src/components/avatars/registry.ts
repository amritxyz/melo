import type { AvatarId, AvatarMetadata } from './types'
import {
  MeloNeoAvatar,
  MeloAstroAvatar,
  MeloBeatsAvatar,
  MeloSproutAvatar,
  MeloBotAvatar,
  MeloNinjaAvatar,
  MeloSleuthAvatar,
  MeloGamerAvatar,
  MeloMysticAvatar,
  MeloChillAvatar,
  MeloPilotAvatar,
  MeloSparkAvatar,
} from './svgs'

export const MELO_AVATARS: AvatarMetadata[] = [
  {
    id: 'melo-neo',
    name: 'Melo Neo',
    theme: 'Cyberpunk',
    description: 'VR Visor & Comms with futuristic neon pulse',
    badge: 'Futuristic',
    bgGradient: 'from-purple-900 to-indigo-950',
    component: MeloNeoAvatar,
  },
  {
    id: 'melo-astro',
    name: 'Melo Astro',
    theme: 'Cosmic',
    description: 'Space explorer with starlight bubble helmet',
    badge: 'Explorer',
    bgGradient: 'from-slate-900 to-indigo-950',
    component: MeloAstroAvatar,
  },
  {
    id: 'melo-beats',
    name: 'Melo Beats',
    theme: 'Music / DJ',
    description: 'Studio headphones with rhythmic soundwave style',
    badge: 'Creative',
    bgGradient: 'from-emerald-950 to-teal-900',
    component: MeloBeatsAvatar,
  },
  {
    id: 'melo-sprout',
    name: 'Melo Sprout',
    theme: 'Botanist / Eco',
    description: 'Twin-leaf head sprout and retro wireframe glasses',
    badge: 'Eco',
    bgGradient: 'from-green-900 to-emerald-950',
    component: MeloSproutAvatar,
  },
  {
    id: 'melo-bot',
    name: 'Melo Bot',
    theme: 'Retro Mecha',
    description: 'Warm copper robot with glowing LED pixel eyes',
    badge: 'Tech',
    bgGradient: 'from-sky-950 to-slate-900',
    component: MeloBotAvatar,
  },
  {
    id: 'melo-ninja',
    name: 'Melo Ninja',
    theme: 'Shadow Trader',
    description: 'Shinobi cowl with metallic Melo coin emblem',
    badge: 'Stealth',
    bgGradient: 'from-zinc-900 to-black',
    component: MeloNinjaAvatar,
  },
  {
    id: 'melo-sleuth',
    name: 'Melo Sleuth',
    theme: 'Detective',
    description: 'Vintage fedora hat with gold monocle',
    badge: 'Bargain Sleuth',
    bgGradient: 'from-amber-950 to-stone-900',
    component: MeloSleuthAvatar,
  },
  {
    id: 'melo-gamer',
    name: 'Melo Gamer',
    theme: 'Vaporwave 8-Bit',
    description: 'Retro pixel shades with gaming headset',
    badge: 'Gamer',
    bgGradient: 'from-pink-950 to-purple-950',
    component: MeloGamerAvatar,
  },
  {
    id: 'melo-mystic',
    name: 'Melo Mystic',
    theme: 'Deal Wizard',
    description: 'Celestial starry hat with twinkling sparkles',
    badge: 'Magic',
    bgGradient: 'from-indigo-950 to-violet-950',
    component: MeloMysticAvatar,
  },
  {
    id: 'melo-chill',
    name: 'Melo Chill',
    theme: 'Cozy Winter',
    description: 'Mustard pom-pom beanie with striped knit scarf',
    badge: 'Cozy',
    bgGradient: 'from-orange-950 to-amber-900',
    component: MeloChillAvatar,
  },
  {
    id: 'melo-pilot',
    name: 'Melo Pilot',
    theme: 'Sky Aviator',
    description: 'Brass flight goggles with cozy shearling collar',
    badge: 'Adventurer',
    bgGradient: 'from-sky-900 to-blue-950',
    component: MeloPilotAvatar,
  },
  {
    id: 'melo-spark',
    name: 'Melo Spark',
    theme: 'Star Mascot',
    description: 'Sunburst halo with playful wink & lightning cheek',
    badge: 'Mascot',
    bgGradient: 'from-amber-600 to-orange-700',
    component: MeloSparkAvatar,
  },
]

export const AVATAR_MAP: Record<AvatarId, AvatarMetadata> = MELO_AVATARS.reduce(
  (acc, avatar) => {
    acc[avatar.id] = avatar
    return acc
  },
  {} as Record<AvatarId, AvatarMetadata>,
)

export const VALID_AVATAR_IDS = new Set<string>(MELO_AVATARS.map((a) => a.id))

/**
 * Normalizes an avatar id by removing optional 'avatar:' prefix.
 */
export function normalizeAvatarId(
  id: string | null | undefined,
): AvatarId | null {
  if (!id) return null
  const clean = id.startsWith('avatar:') ? id.replace('avatar:', '') : id
  return VALID_AVATAR_IDS.has(clean) ? (clean as AvatarId) : null
}

/**
 * Checks whether an input string is a valid Melo Avatar ID.
 */
export function isAvatarId(id: string | null | undefined): boolean {
  return normalizeAvatarId(id) !== null
}

/**
 * Retrieves the avatar definition for a given avatar ID.
 */
export function getAvatarDefinition(
  id: string | null | undefined,
): AvatarMetadata | undefined {
  const clean = normalizeAvatarId(id)
  return clean ? AVATAR_MAP[clean] : undefined
}

/**
 * Deterministically picks an avatar based on a seed string (e.g. username or userId).
 */
export function getDeterministicAvatar(seed?: string): AvatarMetadata {
  if (!seed) return MELO_AVATARS[0]
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % MELO_AVATARS.length
  return MELO_AVATARS[index]
}
