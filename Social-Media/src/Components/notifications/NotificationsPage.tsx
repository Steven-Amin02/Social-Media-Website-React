import { useState } from 'react'
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  Heart,
  MessageCircle,
  Repeat2,
  UserPlus,
} from 'lucide-react'
import { Link } from 'react-router'
import { notificationApi } from '../../shared/api/services'
import { useAction, usePaged } from '../../shared/hooks'
import { asUser } from '../../shared/types'
import type { Notification } from '../../shared/types'
import {
  Avatar,
  Button,
  EmptyState,
  ErrorPanel,
  LoadMore,
  Skeleton,
} from '../ui'
import { timeAgo } from '../../shared/format'
import { PageHeading } from '../feed/FeedPages'
import { useNotifications } from '../../features/notifications/notification-state'
import { notificationTarget } from '../../features/notifications/targets'

const descriptions: Record<string, string> = {
  like_post: 'liked your post',
  comment_post: 'commented on your post',
  share_post: 'shared your post',
  follow: 'started following you',
  follow_user: 'started following you',
  like_comment: 'liked your comment',
  reply_comment: 'replied to your comment',
  mention_post: 'mentioned you in a post',
  mention_comment: 'mentioned you in a comment',
  mention_reply: 'mentioned you in a reply',
  mention_user: 'mentioned you',
}

export function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false)
  return (
    <div className="stack">
      <PageHeading
        eyebrow="DON’T MISS A LITTLE MOMENT"
        title="Your notifications"
        description="The likes, the hellos, and the conversations that bring you closer."
      />
      <div className="tabs notification-tabs">
        <button
          className={!unreadOnly ? 'active' : ''}
          aria-pressed={!unreadOnly}
          onClick={() => setUnreadOnly(false)}
        >
          All notifications
        </button>
        <button
          className={unreadOnly ? 'active' : ''}
          aria-pressed={unreadOnly}
          onClick={() => setUnreadOnly(true)}
        >
          Unread
        </button>
      </div>
      <NotificationList key={String(unreadOnly)} unreadOnly={unreadOnly} />
    </div>
  )
}

function NotificationList({ unreadOnly }: { unreadOnly: boolean }) {
  const list = usePaged<Notification>((page, signal) =>
    notificationApi.list(page, unreadOnly, signal),
  )
  const { refresh, unread } = useNotifications()
  const action = useAction()
  return (
    <section className="card notification-card">
      <div className="notification-list-heading">
        <h2>
          <Bell size={18} /> A little activity
        </h2>
        <Button
          variant="ghost"
          busy={action.pending}
          disabled={!unread}
          onClick={() =>
            void action.run(async () => {
              await notificationApi.readAll()
              list.refetch()
              refresh()
            })
          }
        >
          <CheckCheck size={16} />
          Mark all read
        </Button>
      </div>
      <ErrorPanel message={action.error} />
      {list.items.map((notification) => (
        <NotificationItem
          key={notification._id}
          notification={notification}
          onRead={() => {
            list.setItems((items) =>
              unreadOnly
                ? items.filter((item) => item._id !== notification._id)
                : items.map((item) =>
                    item._id === notification._id
                      ? { ...item, isRead: true }
                      : item,
                  ),
            )
            refresh()
          }}
        />
      ))}
      {list.loading && <Skeleton count={1} />}
      <ErrorPanel message={list.error} retry={list.refetch} />
      {!list.loading && !list.error && !list.items.length && (
        <EmptyState
          title={unreadOnly ? 'All caught up' : 'Your connections start here'}
        >
          {unreadOnly
            ? 'You’ve seen every little moment. Come back for more.'
            : 'When someone connects with you, their activity will appear here.'}
        </EmptyState>
      )}
      <LoadMore
        hasMore={list.hasMore}
        loading={list.loading}
        onClick={list.loadMore}
      />
    </section>
  )
}

function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification
  onRead: () => void
}) {
  const actor = asUser(notification.actor)
  const target = notificationTarget(notification)
  const action = useAction()
  const Icon = notification.type.includes('like')
    ? Heart
    : notification.type.includes('follow')
      ? UserPlus
      : notification.type.includes('share')
        ? Repeat2
        : MessageCircle
  const markRead = () =>
    action.run(async () => {
      await notificationApi.read(notification._id)
      onRead()
    })
  return (
    <div className={`notification-item ${notification.isRead ? '' : 'unread'}`}>
      <div className="notification-avatar">
        <Link to={`/users/${actor._id}`}>
          <Avatar user={actor} />
        </Link>
        <span>
          <Icon size={11} />
        </span>
      </div>
      <div className="grow">
        <p>
          <Link className="person-name" to={`/users/${actor._id}`}>
            {actor.name}
          </Link>{' '}
          {notification.type === 'comment_post' &&
          notification.entityType === 'comment'
            ? 'replied to your comment'
            : descriptions[notification.type] ||
              notification.type.replaceAll('_', ' ')}
          .
        </p>
        <span className="muted small">{timeAgo(notification.createdAt)}</span>
        {target ? (
          <Link
            className="notification-target"
            to={target}
            onClick={() => {
              if (!notification.isRead) void markRead()
            }}
          >
            View{' '}
            {notification.entityType === 'user' ||
            notification.type.includes('follow')
              ? 'profile'
              : 'conversation'}{' '}
            <ExternalLink size={12} />
          </Link>
        ) : (
          <span className="notification-unavailable">
            This content is no longer available.
          </span>
        )}
        <ErrorPanel message={action.error} />
      </div>
      {!notification.isRead && (
        <button
          className="icon-button"
          aria-label={`Mark notification from ${actor.name} as read`}
          disabled={action.pending}
          onClick={() => void markRead()}
        >
          <Check size={16} />
        </button>
      )}
    </div>
  )
}
