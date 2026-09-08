import type { ApiResponse, AuthData, TokenPair, User } from '#/types/auth'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './auth'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
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

  const json: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    error: { message: 'Failed to parse JSON response' },
  }))

  if (!response.ok || !json.success) {
    const errorMsg =
      json.error?.message || response.statusText || 'An error occurred'
    throw new ApiError(errorMsg, response.status)
  }

  return json.data as T
}

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
