export interface User {
  id: string
  username: string
  email: string
  phone?: string
  avatar_url?: string
  bio?: string
  location?: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  username: string
  email: string
  phone?: string
  avatar_url?: string
  bio?: string
  location?: string
  created_at: string
  rating: number
  review_count: number
  active_listings: number
  sold_listings: number
}

export interface Review {
  id: string
  seller_id: string
  reviewer_id: string
  reviewer?: {
    id: string
    username: string
    avatar_url?: string
  }
  rating: number
  comment: string
  created_at: string
  updated_at: string
}

export interface UpdateProfilePayload {
  bio?: string
  avatar_url?: string
  location?: string
  phone?: string
}

export interface SubmitReviewPayload {
  rating: number
  comment: string
}

export interface TokenPair {
  access_token: string
  refresh_token: string
}

export interface AuthData {
  user: User
  tokens: TokenPair
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  pagination?: {
    page: number
    limit: number
    total: number
  }
  error?: {
    message: string
  }
}
