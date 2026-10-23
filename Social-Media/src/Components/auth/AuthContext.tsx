import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { SESSION_EXPIRED, SESSION_KEY } from '../../shared/api/client'
import { authApi } from '../../shared/api/services'
import type { AuthData, User } from '../../shared/types'
import { AuthContext } from '../../features/auth/auth-state'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(SESSION_KEY))
  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(!!token)
  const [initializationError, setInitializationError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const rotatedToken = useRef<string | null>(null)
  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setToken(null)
    setUser(null)
    setInitializing(false)
    setInitializationError('')
  }, [])
  useEffect(() => {
    window.addEventListener(SESSION_EXPIRED, logout)
    return () => window.removeEventListener(SESSION_EXPIRED, logout)
  }, [logout])
  useEffect(() => {
    if (!token) return
    if (rotatedToken.current === token) return
    const controller = new AbortController()
    authApi
      .me(controller.signal, token)
      .then((response) => {
        if (!controller.signal.aborted) setUser(response.data.user)
      })
      .catch((error) => {
        if (!controller.signal.aborted && sessionStorage.getItem(SESSION_KEY))
          setInitializationError(error.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setInitializing(false)
      })
    return () => controller.abort()
  }, [token, retryCount])
  function replaceToken(nextToken: string) {
    // Password changes already authenticate the new token; keep the current page mounted.
    rotatedToken.current = nextToken
    sessionStorage.setItem(SESSION_KEY, nextToken)
    setToken(nextToken)
  }
  function authenticate(data: AuthData) {
    setInitializing(true)
    setInitializationError('')
    setUser(data.user)
    rotatedToken.current = null
    sessionStorage.setItem(SESSION_KEY, data.token)
    setToken(data.token)
  }
  const refreshUser = useCallback(async () => {
    const currentToken = sessionStorage.getItem(SESSION_KEY)
    if (!currentToken) return
    const response = await authApi.me(undefined, currentToken)
    if (sessionStorage.getItem(SESSION_KEY) === currentToken)
      setUser(response.data.user)
  }, [])
  const updateFollowing = useCallback((userId: string, following: boolean) => {
    setUser((current) => {
      if (!current) return current
      const previous = current.following || []
      const wasFollowing = previous.includes(userId)
      const next = following
        ? [...new Set([...previous, userId])]
        : previous.filter((id) => id !== userId)
      return {
        ...current,
        following: next,
        followingCount: Math.max(
          0,
          (current.followingCount ?? previous.length) +
            Number(following) -
            Number(wasFollowing),
        ),
      }
    })
  }, [])
  const updateBookmarksCount = useCallback((count: number) => {
    setUser((current) =>
      current ? { ...current, bookmarksCount: count } : current,
    )
  }, [])
  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        initializing,
        initializationError,
        authenticate,
        logout,
        refreshUser,
        replaceToken,
        updateFollowing,
        updateBookmarksCount,
        retry: () => {
          setInitializing(true)
          setInitializationError('')
          setRetryCount((value) => value + 1)
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
