export interface User {
  id: string
  username: string
  email: string
  phone?: string
  created_at: string
  updated_at: string
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
  error?: {
    message: string
  }
}
