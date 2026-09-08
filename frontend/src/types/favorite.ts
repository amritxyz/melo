import type { User } from './auth'
import type { Listing } from './listing'

export interface Favorite {
  id: string
  user_id: string
  user?: User
  listing_id: string
  listing?: Listing
  created_at: string
}
