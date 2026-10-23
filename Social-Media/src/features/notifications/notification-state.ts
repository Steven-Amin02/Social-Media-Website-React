import { createContext, useContext } from 'react'

export const NotificationContext = createContext({
  unread: 0,
  refresh: () => {},
})
export const useNotifications = () => useContext(NotificationContext)
