import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { notificationApi } from '../../shared/api/services'
import { NotificationContext } from '../../features/notifications/notification-state'
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [unread, setUnread] = useState(0)
  const [revision, setRevision] = useState(0)
  const refresh = useCallback(() => setRevision((value) => value + 1), [])
  useEffect(() => {
    const controller = new AbortController()
    const update = () => {
      if (document.visibilityState === 'hidden') return
      void notificationApi
        .count(controller.signal)
        .then((response) => {
          if (!controller.signal.aborted) setUnread(response.data.unreadCount)
        })
        .catch(() => {})
    }
    update()
    const interval = window.setInterval(update, 60000)
    window.addEventListener('focus', update)
    document.addEventListener('visibilitychange', update)
    window.addEventListener('route-social:changed', update)
    return () => {
      controller.abort()
      window.clearInterval(interval)
      window.removeEventListener('focus', update)
      document.removeEventListener('visibilitychange', update)
      window.removeEventListener('route-social:changed', update)
    }
  }, [revision])
  return (
    <NotificationContext.Provider value={{ unread, refresh }}>
      {children}
    </NotificationContext.Provider>
  )
}
