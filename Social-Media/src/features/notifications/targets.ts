import { asUser } from '../../shared/types'
import type { Notification } from '../../shared/types'

export function notificationTarget(notification: Notification) {
  if (notification.type.includes('follow'))
    return `/users/${asUser(notification.actor)._id}`
  if (!notification.entity) return undefined
  if (notification.entityType === 'post')
    return `/posts/${notification.entityId}`
  const post = notification.entity.post
  if (post) return `/posts/${typeof post === 'string' ? post : post._id}`
  return undefined
}
