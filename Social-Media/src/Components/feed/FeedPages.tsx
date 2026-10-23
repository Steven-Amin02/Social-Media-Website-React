import { useCallback, useEffect, useState } from 'react'
import {
  ArrowUpRight,
  Bookmark,
  Compass,
  Image,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { useAuth } from '../../features/auth/auth-state'
import { Suggestions } from '../profiles/Suggestions'
import { PostComposer } from '../posts/PostComposer'
import { PostCard } from '../posts/PostCard'
import { postApi } from '../../shared/api/services'
import { usePaged } from '../../shared/hooks'
import type { Page, Post } from '../../shared/types'
import { EmptyState, ErrorPanel, LoadMore, Skeleton } from '../ui'

export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>
        {title}
        <span>.</span>
      </h1>
      <p>{description}</p>
    </div>
  )
}

export function HomePage() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const selected = ['all', 'following', 'me'].includes(params.get('feed') || '')
    ? params.get('feed')!
    : 'all'
  const images = params.get('photos') === '1'
  const [revision, setRevision] = useState(0)
  return (
    <div className="stack">
      <PageHeading
        eyebrow="A GOOD DAY TO CONNECT"
        title="Your daily catch-up"
        description={`Hey ${user?.name.split(' ')[0] || 'there'}, make yourself at home. Here’s what’s happening.`}
      />
      <div className="feed-welcome">
        <div>
          <span>
            <Sparkles size={14} /> THE BEST PART OF YOUR DAY
          </span>
          <h2>
            A little hello can
            <br />
            go a long way.
          </h2>
          <p>Share a moment. Start a conversation.</p>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <span className="welcome-ring" />
          <span className="hello-bubble">
            hello<span>✳</span>
          </span>
          <span className="hello-dot dot-one" />
          <span className="hello-dot dot-two" />
        </div>
      </div>
      <PostComposer onSuccess={() => setRevision((value) => value + 1)} />
      <div className="feed-toolbar">
        <div className="tabs" aria-label="Feed filter">
          {[
            { key: 'all', label: 'All posts' },
            { key: 'following', label: 'Following' },
            { key: 'me', label: 'My posts' },
          ].map((tab) => (
            <button
              key={tab.key}
              className={selected === tab.key ? 'active' : ''}
              aria-pressed={selected === tab.key}
              onClick={() =>
                setParams((current) => {
                  current.set('feed', tab.key)
                  return current
                })
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          className={`image-filter ${images ? 'active' : ''}`}
          aria-pressed={images}
          onClick={() =>
            setParams((current) => {
              if (images) current.delete('photos')
              else current.set('photos', '1')
              return current
            })
          }
        >
          <Image size={15} />
          <span>Photos</span>
        </button>
      </div>
      <PostList
        key={`${selected}-${images}-${revision}`}
        load={(page, signal) => postApi.feed(page, selected, images, signal)}
        emptyTitle={
          selected === 'following'
            ? 'Your people will fill this space'
            : 'A fresh start for your feed'
        }
        emptyDescription={
          selected === 'following' ? (
            <>
              <p>Follow a few people to see what they’re sharing.</p>
              <Link to="/explore" className="text-link">
                Find your community <ArrowUpRight size={14} />
              </Link>
            </>
          ) : (
            'Share something that matters to you, or try a different filter.'
          )
        }
      />
    </div>
  )
}

export function ExplorePage() {
  return (
    <div className="stack">
      <PageHeading
        eyebrow="A WORLD OF POSSIBILITIES"
        title="Explore your community"
        description="New voices, fresh perspectives, and people worth knowing."
      />
      <Suggestions />
      <div className="section-heading explore-heading">
        <h2>
          <Compass size={19} /> Around the community
        </h2>
        <span className="muted small">Latest posts</span>
      </div>
      <PostList
        load={postApi.explore}
        emptyTitle="Something good is on its way"
      />
    </div>
  )
}

export function SavedPage() {
  return (
    <div className="stack">
      <PageHeading
        eyebrow="KEEP THE GOOD STUFF CLOSE"
        title="Your saved posts"
        description="Ideas to revisit. Moments to remember. All in one little place."
      />
      <div className="saved-banner">
        <Bookmark size={20} />
        <p>
          A collection that’s entirely yours. Only you can see your saved posts.
        </p>
      </div>
      <PostList
        load={postApi.saved}
        saved
        emptyTitle="Save a little inspiration"
        emptyDescription="Tap the bookmark on any post to keep it here for later."
      />
    </div>
  )
}

export function PostList({
  load,
  emptyTitle = 'No posts yet',
  emptyDescription,
  saved = false,
}: {
  load: (page: number, signal?: AbortSignal) => Promise<Page<Post>>
  emptyTitle?: string
  emptyDescription?: React.ReactNode
  saved?: boolean
}) {
  const list = usePaged<Post>(
    useCallback((page, signal) => load(page, signal), [load]),
  )
  useEffect(() => {
    window.addEventListener('route-social:posts-changed', list.refetch)
    return () =>
      window.removeEventListener('route-social:posts-changed', list.refetch)
  }, [list.refetch])
  return (
    <div className="stack">
      <div className="list-meta">
        <span>
          {list.total !== undefined
            ? `${list.total.toLocaleString()} ${saved ? 'saved posts' : 'posts'}`
            : 'Your community, in the moment'}
        </span>
        <button
          aria-label="Refresh posts"
          className="icon-button"
          disabled={list.loading}
          onClick={list.refetch}
        >
          <RefreshCw size={14} className={list.loading ? 'spin' : ''} />
        </button>
      </div>
      {list.items.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onUpdate={(updated) =>
            list.setItems((items) =>
              items.map((item) => (item._id === updated._id ? updated : item)),
            )
          }
          onDelete={(id) =>
            list.setItems((items) => items.filter((item) => item._id !== id))
          }
          onUnsave={
            saved
              ? (id) =>
                  list.setItems((items) =>
                    items.filter((item) => item._id !== id),
                  )
              : undefined
          }
        />
      ))}
      {list.loading && <Skeleton count={list.items.length ? 1 : 2} />}
      <ErrorPanel message={list.error} retry={list.refetch} />
      {!list.loading && !list.error && !list.items.length && (
        <div className="card">
          <EmptyState title={emptyTitle}>{emptyDescription}</EmptyState>
        </div>
      )}
      <LoadMore
        hasMore={list.hasMore}
        loading={list.loading}
        onClick={list.loadMore}
      />
      {!list.hasMore && !!list.items.length && !list.error && !list.loading && (
        <div className="end-of-feed">
          <span />
          <Sparkles size={15} /> You’re all caught up
          <span />
        </div>
      )}
    </div>
  )
}

// Used by profile timelines so each profile keeps an independent list lifecycle.
export function UserPosts({ userId }: { userId: string }) {
  const load = useCallback(
    (page: number, signal?: AbortSignal) => postApi.user(userId, page, signal),
    [userId],
  )
  return (
    <PostList
      load={load}
      emptyTitle="The story starts here"
      emptyDescription="Posts and shared moments will appear here."
    />
  )
}
