import { createContext, useContext } from 'react'
import type { AuthData, User } from '../../shared/types'

export interface AuthState {
  token: string | null
  user: User | null
  initializing: boolean
  initializationError: string
  authenticate: (data: AuthData) => void
  logout: () => void
  refreshUser: () => Promise<void>
  replaceToken: (token: string) => void
  updateFollowing: (userId: string, following: boolean) => void
  updateBookmarksCount: (count: number) => void
  retry: () => void
}
export const AuthContext = createContext<AuthState | null>(null)
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
