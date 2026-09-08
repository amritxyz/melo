import type { User } from './auth'
import type { Listing } from './listing'

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender?: User
  content: string
  is_read: boolean
  created_at: string
}

export interface Conversation {
  id: string
  listing_id: string
  listing?: Listing
  buyer_id: string
  buyer?: User
  seller_id: string
  seller?: User
  created_at: string
  updated_at: string
  last_message?: Message
  unread_count?: number
}

export interface SendMessagePayload {
  content: string
}
