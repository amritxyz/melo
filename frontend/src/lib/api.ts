import type { ApiResponse, AuthData, TokenPair, User } from '#/types/auth'
import type {
  Category,
  CreateListingPayload,
  Listing,
  ListingFilterParams,
  Pagination,
  UpdateListingPayload,
} from '#/types/listing'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './auth'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface FullApiResponse<T> extends ApiResponse<T> {
  pagination?: Pagination
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const result = await apiFetchFull<T>(endpoint, options)
  return result.data
}

export async function apiFetchFull<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ data: T; pagination?: Pagination }> {
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getAccessToken()
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  })

  let json: FullApiResponse<T> = await response.json().catch(() => ({
    success: false,
    error: { message: 'Failed to parse JSON response' },
  }))

  // Auto-refresh token if access token expired
  if (
    response.status === 401 &&
    !endpoint.includes('/auth/refresh') &&
    !endpoint.includes('/auth/login')
  ) {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        const refreshRes = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        })
        const refreshJson = await refreshRes.json()
        if (refreshRes.ok && refreshJson.success && refreshJson.data?.tokens) {
          setTokens(refreshJson.data.tokens)
          headers.set(
            'Authorization',
            `Bearer ${refreshJson.data.tokens.access_token}`,
          )
          const retryResponse = await fetch(endpoint, {
            ...options,
            headers,
          })
          json = await retryResponse.json().catch(() => ({
            success: false,
            error: { message: 'Failed to parse JSON response' },
          }))
          if (retryResponse.ok && json.success) {
            return {
              data: json.data as T,
              pagination: json.pagination,
            }
          }
        } else {
          clearTokens()
        }
      } catch {
        clearTokens()
      }
    }
  }

  if (!response.ok || !json.success) {
    const errorMsg =
      json.error?.message || response.statusText || 'An error occurred'
    throw new ApiError(errorMsg, response.status)
  }

  return {
    data: json.data as T,
    pagination: json.pagination,
  }
}

// ----------------- Auth API -----------------

export async function signupApi(
  username: string,
  email: string,
  password: string,
): Promise<AuthData> {
  const data = await apiFetch<AuthData>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  })
  setTokens(data.tokens)
  return data
}

export async function loginApi(
  email: string,
  password: string,
): Promise<AuthData> {
  const data = await apiFetch<AuthData>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setTokens(data.tokens)
  return data
}

export async function getMeApi(): Promise<{ user: User }> {
  return apiFetch<{ user: User }>('/api/auth/me', {
    method: 'GET',
  })
}

export async function refreshTokenApi(): Promise<{ tokens: TokenPair }> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new ApiError('No refresh token available', 401)
  }

  const data = await apiFetch<{ tokens: TokenPair }>('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  setTokens(data.tokens)
  return data
}

export async function logoutApi(): Promise<void> {
  const refreshToken = getRefreshToken()
  try {
    if (refreshToken) {
      await apiFetch('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
    }
  } finally {
    clearTokens()
  }
}

// ----------------- Categories API -----------------

export async function getCategoriesApi(): Promise<Category[]> {
  return apiFetch<Category[]>('/api/categories')
}

export async function getCategoryByIDApi(id: string): Promise<Category> {
  return apiFetch<Category>(`/api/categories/${encodeURIComponent(id)}`)
}

// ----------------- Listings API -----------------

export async function getListingsApi(
  params: ListingFilterParams = {},
): Promise<{ listings: Listing[]; pagination: Pagination }> {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set('page', params.page.toString())
  if (params.limit) searchParams.set('limit', params.limit.toString())
  if (params.category_id) searchParams.set('category_id', params.category_id)
  if (params.seller_id) searchParams.set('seller_id', params.seller_id)
  if (params.status) searchParams.set('status', params.status)
  if (params.search) searchParams.set('search', params.search)

  const query = searchParams.toString()
  const endpoint = `/api/listings${query ? `?${query}` : ''}`

  const res = await apiFetchFull<Listing[]>(endpoint)
  return {
    listings: res.data,
    pagination: res.pagination || {
      page: params.page || 1,
      limit: params.limit || 20,
      total: res.data.length,
    },
  }
}

export async function getListingByIDApi(id: string): Promise<Listing> {
  return apiFetch<Listing>(`/api/listings/${encodeURIComponent(id)}`)
}

export async function createListingApi(
  payload: CreateListingPayload,
): Promise<Listing> {
  return apiFetch<Listing>('/api/listings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateListingApi(
  id: string,
  payload: UpdateListingPayload,
): Promise<Listing> {
  return apiFetch<Listing>(`/api/listings/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteListingApi(
  id: string,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(
    `/api/listings/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
    },
  )
}

export async function markListingSoldApi(id: string): Promise<Listing> {
  return apiFetch<Listing>(`/api/listings/${encodeURIComponent(id)}/sold`, {
    method: 'PATCH',
  })
}
