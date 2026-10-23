import { useEffect } from 'react'
import { ArrowUpRight, Check, UserPlus } from 'lucide-react'
import { Link } from 'react-router'
import { useAuth } from '../../features/auth/auth-state'
import { userApi } from '../../shared/api/services'
import { useAction, usePaged } from '../../shared/hooks'
import type { User } from '../../shared/types'
import { Avatar, Button, EmptyState, ErrorPanel, LoadMore } from '../ui'

export function Suggestions({ compact = false }: { compact?: boolean }) {
  const list = usePaged<User>((page, signal) =>
    userApi.suggestions(page, signal),
  )
  useEffect(() => {
    window.addEventListener('route-social:people-changed', list.refetch)
    return () =>
      window.removeEventListener('route-social:people-changed', list.refetch)
  }, [list.refetch])
  return (
    <section
      className={compact ? 'card suggestions-card' : 'suggestions-section'}
    >
      <div className="section-heading">
        <h2>
          {compact ? 'People to connect with' : 'Find your kind of people'}
        </h2>
        {compact && (
          <Link to="/explore" aria-label="Explore people">
            <ArrowUpRight size={17} />
          </Link>
        )}
      </div>
      <p className="muted small">A familiar face. A fresh perspective.</p>
      <div className={compact ? 'suggestion-list' : 'suggestion-grid'}>
        {(compact ? list.items.slice(0, 4) : list.items).map((user) => (
          <Suggestion key={user._id} user={user} compact={compact} />
        ))}
      </div>
      {list.loading && !list.items.length && (
        <p className="muted small" role="status">
          Finding your next connection…
        </p>
      )}
      <ErrorPanel message={list.error} retry={list.refetch} />
      {!list.loading && !list.error && !list.items.length && (
        <EmptyState title="You’re all caught up" icon="users">
          More people will appear here soon.
        </EmptyState>
      )}
      {compact ? (
        <Link to="/explore" className="suggestion-see-all">
          Discover more people <ArrowUpRight size={14} />
        </Link>
      ) : (
        <LoadMore
          hasMore={list.hasMore}
          loading={list.loading}
          onClick={list.loadMore}
        />
      )}
    </section>
  )
}

function Suggestion({ user, compact }: { user: User; compact: boolean }) {
  const { user: viewer, updateFollowing } = useAuth()
  const action = useAction()
  const following = viewer?.following?.includes(user._id) || false
  return (
    <div className={compact ? 'suggestion' : 'card suggestion-large'}>
      <Link to={`/users/${user._id}`} className="suggestion-person">
        <Avatar user={user} size={compact ? 'md' : 'lg'} />
        <div>
          <strong>{user.name}</strong>
          <span>
            {user.mutualFollowersCount
              ? `${user.mutualFollowersCount} mutual connections`
              : `@${user.username || 'community'}`}
          </span>
          {!compact && <p>{user.followersCount || 0} followers</p>}
        </div>
      </Link>
      <Button
        variant={following ? 'secondary' : compact ? 'ghost' : 'primary'}
        className={compact ? 'follow-icon' : ''}
        aria-label={`${following ? 'Unfollow' : 'Follow'} ${user.name}`}
        busy={action.pending}
        onClick={() =>
          void action.run(async () => {
            const response = await userApi.follow(user._id)
            updateFollowing(user._id, response.data.following)
            window.dispatchEvent(new Event('route-social:changed'))
          })
        }
      >
        {following ? <Check size={16} /> : <UserPlus size={16} />}
        {!compact && (following ? 'Following' : 'Follow')}
      </Button>
      <ErrorPanel message={action.error} />
    </div>
  )
}
