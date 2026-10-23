import type { ApiResponse } from '../types'

export const SESSION_KEY = 'route-social.token'
const baseUrl = (
  import.meta.env.VITE_API_BASE_URL || 'https://route-posts.routemisr.com'
).replace(/\/$/, '')
export const SESSION_EXPIRED = 'route-social:session-expired'

export class ApiError extends Error {
  status: number
  details: string[]
  constructor(message: string, status = 0, details: string[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

function errorDetails(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(errorDetails)
  if (value && typeof value === 'object')
    return Object.values(value).flatMap(errorDetails)
  return []
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  public?: boolean
  token?: string
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { body, public: isPublic, token: explicitToken, ...init } = options
  const token = isPublic
    ? null
    : (explicitToken ?? sessionStorage.getItem(SESSION_KEY))
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const isForm = body instanceof FormData
  if (body !== undefined && !isForm)
    headers.set('Content-Type', 'application/json')
  let response: Response
  try {
    response = await fetch(baseUrl + path, {
      ...init,
      headers,
      body:
        body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    })
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'AbortError'
    )
      throw error
    throw new ApiError(
      'Unable to connect. Check your connection and try again.',
    )
  }
  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload?.success) {
    if (response.status === 401 && token) {
      // A slow response from an old session must not sign out a newly signed-in user.
      if (sessionStorage.getItem(SESSION_KEY) === token) {
        sessionStorage.removeItem(SESSION_KEY)
        window.dispatchEvent(new Event(SESSION_EXPIRED))
      }
    }
    throw new ApiError(
      payload?.message ||
        (response.status === 404
          ? 'This content is no longer available.'
          : `The request could not be completed (${response.status}).`),
      response.status,
      errorDetails(payload?.errors),
    )
  }
  return payload as ApiResponse<T>
}

export function multipart(
  values: Record<string, string | Blob | undefined>,
): FormData {
  const form = new FormData()
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined) form.append(key, value)
  })
  return form
}

export function query(
  values: Record<string, string | number | boolean | undefined>,
) {
  const params = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value))
  })
  return `?${params}`
}
