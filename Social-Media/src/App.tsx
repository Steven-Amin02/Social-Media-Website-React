import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router'
import { AuthProvider } from './Components/auth/AuthContext'
import { useAuth } from './features/auth/auth-state'
import { AuthPage } from './Components/auth/AuthPage'
import { SettingsPage } from './Components/auth/SettingsPage'
import { HomePage, ExplorePage, SavedPage } from './Components/feed/FeedPages'
import { NotificationProvider } from './Components/notifications/NotificationContext'
import { NotificationsPage } from './Components/notifications/NotificationsPage'
import { ProfilePage } from './Components/profiles/ProfilePage'
import { PostDetailPage } from './Components/posts/PostDetailPage'
import { Shell } from './Components/layout/Shell'
import { ErrorBoundary } from './Components/errors/ErrorBoundary'
import { ErrorPage } from './Components/errors/ErrorPage'
import { Brand, Button, ErrorPanel, LoadingScreen } from './Components/ui'
import './App.css'

export function ProtectedRoute() {
  const { user, initializing, initializationError, retry, logout } = useAuth()
  const location = useLocation()
  if (initializing) return <LoadingScreen />
  if (initializationError)
    return (
      <div className="session-error">
        <Brand />
        <ErrorPanel message={initializationError} retry={retry} />
        <Button variant="secondary" onClick={logout}>
          Back to login
        </Button>
      </div>
    )
  if (!user)
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    )
  return (
    <NotificationProvider key={user._id}>
      <Outlet />
    </NotificationProvider>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage register />} />
      <Route path="/error" element={<ErrorPage status={500} />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Shell />}>
          <Route index element={<HomePage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="posts/:postId" element={<PostDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="users/:userId" element={<ProfilePage />} />
          <Route path="saved" element={<SavedPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
