import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router'
import { useAuth } from '../../features/auth/auth-state'
import { useNotifications } from '../../features/notifications/notification-state'
import { Avatar, Brand } from '../ui'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/explore', label: 'Explore' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/saved', label: 'Saved posts' },
  { to: '/profile', label: 'My profile' },
]

export function Navbar() {
  const { user, logout } = useAuth()
  const { unread } = useNotifications()
  const location = useLocation()
  const navbar = useRef<HTMLElement>(null)
  const account = useRef<HTMLDivElement>(null)
  const userButton = useRef<HTMLButtonElement>(null)
  const mainButton = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState<{
    type: 'user' | 'navigation'
    locationKey: string
  } | null>(null)
  // A route change closes disclosures without an extra render in an effect.
  const active = open?.locationKey === location.key ? open.type : null
  const userOpen = active === 'user'
  const navigationOpen = active === 'navigation'

  function toggle(type: 'user' | 'navigation') {
    setOpen(active === type ? null : { type, locationKey: location.key })
  }

  useEffect(() => {
    if (!active) return
    function dismiss(event: PointerEvent) {
      const target = event.target as Node
      const root = active === 'user' ? account.current : navbar.current
      if (!root?.contains(target)) setOpen(null)
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setOpen(null)
      const trigger =
        active === 'user' ? userButton.current : mainButton.current
      trigger?.focus()
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', escape)
    }
  }, [active])

  return (
    <nav
      ref={navbar}
      className="bg-neutral-primary fixed top-0 start-0 z-20 w-full border-b border-default"
      aria-label="Primary navigation"
    >
      <div className="mx-auto flex min-h-[72px] max-w-screen-xl flex-wrap items-center justify-between gap-y-3 p-4">
        <Brand />
        <div className="flex items-center gap-3 md:order-2 md:gap-0">
          <div
            ref={account}
            className="relative"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setOpen((current) =>
                  current?.type === 'user' ? null : current,
                )
              }
            }}
          >
            <button
              ref={userButton}
              type="button"
              id="user-menu-button"
              className="flex rounded-full bg-neutral-primary text-sm focus:ring-4 focus:ring-neutral-tertiary md:me-0"
              aria-expanded={userOpen}
              aria-controls="user-dropdown"
              onClick={() => toggle('user')}
            >
              <span className="sr-only">Open user menu</span>
              <Avatar user={user} size="sm" />
            </button>
            <div
              id="user-dropdown"
              hidden={!userOpen}
              className="absolute end-0 top-full z-50 mt-3 w-52 rounded-base border border-default-medium bg-neutral-primary-medium shadow-lg"
            >
              <div className="border-b border-default px-4 py-3 text-sm">
                <span className="block truncate font-medium text-heading">
                  {user?.name}
                </span>
                <span className="block truncate text-body">
                  {user?.email || `@${user?.username || 'member'}`}
                </span>
              </div>
              <ul
                className="p-2 text-sm font-medium text-body"
                aria-labelledby="user-menu-button"
              >
                {[
                  { to: '/', label: 'Home feed' },
                  { to: '/profile', label: 'My profile' },
                  { to: '/settings', label: 'Settings' },
                  { to: '/saved', label: 'Saved posts' },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="inline-flex w-full items-center rounded p-2 hover:bg-neutral-tertiary-medium hover:text-heading"
                      onClick={() => setOpen(null)}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    className="inline-flex w-full items-center rounded p-2 text-start hover:bg-neutral-tertiary-medium hover:text-heading"
                    onClick={() => {
                      setOpen(null)
                      logout()
                    }}
                  >
                    Sign out
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <button
            ref={mainButton}
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-base p-2 text-sm text-body hover:bg-neutral-secondary-soft hover:text-heading focus:ring-2 focus:ring-neutral-tertiary focus:outline-none md:hidden"
            aria-controls="navbar-user"
            aria-expanded={navigationOpen}
            onClick={() => toggle('navigation')}
          >
            <span className="sr-only">
              {navigationOpen ? 'Close main menu' : 'Open main menu'}
            </span>
            {navigationOpen ? (
              <X size={24} aria-hidden="true" />
            ) : (
              <Menu size={24} aria-hidden="true" />
            )}
          </button>
        </div>
        <div
          id="navbar-user"
          className={`${navigationOpen ? 'flex' : 'hidden'} w-full items-center justify-between md:order-1 md:flex md:w-auto`}
        >
          <ul className="mt-1 flex w-full flex-col rounded-base border border-default bg-neutral-secondary-soft p-4 text-sm font-medium md:mt-0 md:w-auto md:flex-row md:gap-6 md:border-0 md:bg-neutral-primary md:p-0 lg:gap-8">
            {links.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded px-3 py-2 md:p-0 ${isActive ? 'bg-brand text-white md:bg-transparent md:text-fg-brand' : 'text-heading hover:bg-neutral-tertiary md:hover:bg-transparent md:hover:text-fg-brand'}`
                  }
                  onClick={() => setOpen(null)}
                >
                  {label}
                  {to === '/notifications' && unread > 0 && (
                    <span
                      className="rounded bg-blue-100 px-1.5 text-[10px] text-route-blue"
                      aria-label={`${unread} unread`}
                    >
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}
