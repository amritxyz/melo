import type { User } from './auth'

export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor'
export type ListingStatus = 'active' | 'sold' | 'hidden'

export interface Category {
  id: string
  name: string
  parent_id?: string
  created_at: string
}

export interface ListingImage {
  id: string
  listing_id: string
  url: string
  is_primary: boolean
  created_at: string
}

export interface Listing {
  id: string
  seller_id: string
  seller?: User
  category_id: string
  category?: Category
  title: string
  description: string
  price: number
  condition: ListingCondition
  location: string
  status: ListingStatus
  images?: ListingImage[]
  created_at: string
  updated_at: string
}

export interface CreateListingPayload {
  category_id: string
  title: string
  description: string
  price: number
  condition: ListingCondition
  location: string
  image_urls?: string[]
}

export interface UpdateListingPayload {
  category_id?: string
  title?: string
  description?: string
  price?: number
  condition?: ListingCondition
  location?: string
  status?: ListingStatus
  image_urls?: string[]
}

export interface ListingFilterParams {
  page?: number
  limit?: number
  category_id?: string
  seller_id?: string
  status?: string
  search?: string
  location?: string
  condition?: string
  sort_by?: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
}
