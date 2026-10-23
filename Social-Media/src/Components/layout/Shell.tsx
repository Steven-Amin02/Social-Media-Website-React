import {
  Bell,
  Bookmark,
  Compass,
  Heart,
  Home,
  LogOut,
  Settings,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router'
import { useAuth } from '../../features/auth/auth-state'
import { useNotifications } from '../../features/notifications/notification-state'
import { Suggestions } from '../profiles/Suggestions'
import { Avatar } from '../ui'
import { Navbar } from './Navbar'

const navigation = [
  { to: '/', label: 'Home feed', icon: Home, end: true },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/saved', label: 'Saved posts', icon: Bookmark },
  { to: '/profile', label: 'My profile', icon: UserRound },
]

export function Shell() {
  const { user, logout } = useAuth()
  const { unread } = useNotifications()
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <div className="app-grid">
        <aside className="left-sidebar">
          <Link to="/profile" className="sidebar-profile">
            <Avatar user={user} />
            <div>
              <strong>{user?.name}</strong>
              <span>@{user?.username || 'member'}</span>
            </div>
          </Link>
          <div className="sidebar-divider" />
          <span className="nav-label">YOUR COMMUNITY</span>
          <nav aria-label="Main navigation">
            {navigation.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'selected' : ''}`
                }
                key={to}
              >
                <Icon size={21} strokeWidth={1.8} />
                <span>{label}</span>
                {to === '/notifications' && unread > 0 && (
                  <span className="count-badge">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
                {to === '/saved' && !!user?.bookmarksCount && (
                  <span className="nav-count">{user.bookmarksCount}</span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-divider" />
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'selected' : ''}`
            }
          >
            <Settings size={21} strokeWidth={1.8} />
            Settings
          </NavLink>
          <button className="nav-item logout" onClick={logout}>
            <LogOut size={20} strokeWidth={1.8} />
            Log out
          </button>
          <div className="sidebar-bottom">
            <span className="sidebar-spark">
              <Sparkles size={18} />
            </span>
            <strong>
              Good people.
              <br />
              Great conversations.
            </strong>
            <p>Make a little room for connection.</p>
            <span className="sidebar-copyright">
              © {new Date().getFullYear()} Route Social
            </span>
          </div>
        </aside>
        <main id="main-content" className="main-content" key={user?._id}>
          <Outlet />
        </main>
        <aside className="right-sidebar">
          <Suggestions compact />
          <div className="card community-note">
            <span className="community-heart">
              <Heart size={23} strokeWidth={1.5} />
            </span>
            <span className="eyebrow">A LITTLE REMINDER</span>
            <h3>
              Behind every post,
              <br />
              there’s a person.
            </h3>
            <p>
              A thoughtful comment, a kind word, a new connection. Small things
              make a big difference.
            </p>
            <div className="community-note-footer">
              <span />
              Keep it kind. Keep it you.
            </div>
          </div>
          <footer className="sidebar-footer">
            <span>Connect. Share. Belong.</span>
            <span>
              Built with a little heart <Heart size={11} />
            </span>
          </footer>
        </aside>
      </div>
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {navigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            to={to}
            key={to}
            end={end}
            aria-label={label}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <Icon size={21} />
            <span>
              {to === '/'
                ? 'Home'
                : to === '/profile'
                  ? 'Profile'
                  : to === '/saved'
                    ? 'Saved'
                    : to === '/notifications'
                      ? 'Alerts'
                      : 'Explore'}
            </span>
            {to === '/notifications' && unread > 0 && <i />}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
