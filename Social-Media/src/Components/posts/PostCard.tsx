import { useState } from 'react'
import {
  Bookmark,
  Globe2,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Repeat2,
  Send,
  Trash2,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../features/auth/auth-state'
import { postApi } from '../../shared/api/services'
import { useAction, usePaged } from '../../shared/hooks'
import { asUser, canEdit, hasLiked } from '../../shared/types'
import type { Post, User } from '../../shared/types'
import {
  Avatar,
  Button,
  ConfirmDialog,
  ContentImage,
  EmptyState,
  ErrorPanel,
  LoadMore,
  Modal,
  RichText,
} from '../ui'
import { timeAgo } from '../../shared/format'
import { PostComposer } from './PostComposer'
import { Comments } from './Comments'

export function PostCard({
  post,
  onUpdate,
  onDelete,
  expanded = false,
  onUnsave,
}: {
  post: Post
  onUpdate: (post: Post) => void
  onDelete: (id: string) => void
  expanded?: boolean
  onUnsave?: (id: string) => void
}) {
  const { user, updateBookmarksCount } = useAuth()
  const navigate = useNavigate()
  const [menu, setMenu] = useState(false)
  const [dialog, setDialog] = useState<
    'edit' | 'delete' | 'share' | 'likes' | null
  >(null)
  const [comments, setComments] = useState(expanded)
  const [shareBody, setShareBody] = useState('')
  const action = useAction()
  const creator = asUser(post.user)
  if (!user) return null
  const liked = hasLiked(post.likes, user._id)
  const openDialog = (value: typeof dialog) => {
    action.setError('')
    setMenu(false)
    setDialog(value)
  }
  return (
    <article className="card post-card">
      <header className="post-header">
        <Link to={`/users/${creator._id}`}>
          <Avatar user={creator} />
        </Link>
        <div className="grow">
          <Link className="person-name" to={`/users/${creator._id}`}>
            {creator.name}
          </Link>
          {post.isShare && <span className="shared-label"> shared a post</span>}
          <div className="post-meta">
            <Link
              to={`/posts/${post._id}`}
              title={new Date(post.createdAt).toLocaleString()}
            >
              {timeAgo(post.createdAt)}
            </Link>
            <span>·</span>
            <Globe2 size={12} />
            <span>Public</span>
          </div>
        </div>
        <button
          className={`icon-button bookmark-button ${post.bookmarked ? 'active' : ''}`}
          aria-label={post.bookmarked ? 'Unsave post' : 'Save post'}
          aria-pressed={!!post.bookmarked}
          disabled={action.pending}
          onClick={() =>
            void action.run(async () => {
              const response = await postApi.bookmark(post._id)
              onUpdate({ ...post, bookmarked: response.data.bookmarked })
              if (!response.data.bookmarked) onUnsave?.(post._id)
              updateBookmarksCount(response.data.bookmarksCount)
            })
          }
        >
          <Bookmark
            size={19}
            fill={post.bookmarked ? 'currentColor' : 'none'}
          />
        </button>
        {canEdit(post.user, user._id) && (
          <div className="post-menu">
            <button
              className="icon-button"
              aria-label="Post options"
              aria-expanded={menu}
              onClick={() => setMenu((value) => !value)}
            >
              <MoreHorizontal size={21} />
            </button>
            {menu && (
              <>
                <button
                  className="menu-dismiss"
                  aria-label="Close post options"
                  onClick={() => setMenu(false)}
                />
                <div className="dropdown">
                  <button onClick={() => openDialog('edit')}>
                    <Pencil size={15} /> Edit post
                  </button>
                  <button
                    className="danger-text"
                    onClick={() => openDialog('delete')}
                  >
                    <Trash2 size={15} /> Delete post
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </header>
      <div className="post-body">
        <RichText text={post.body} mentions={post.mentions} />
      </div>
      {post.image && <ContentImage src={post.image} />}
      {post.isShare && (
        <div className="shared-post">
          {post.sharedPost && typeof post.sharedPost === 'object' ? (
            <>
              <Link
                className="shared-author"
                to={`/users/${asUser(post.sharedPost.user)._id}`}
              >
                <Avatar user={asUser(post.sharedPost.user)} size="sm" />
                <strong>{asUser(post.sharedPost.user).name}</strong>
              </Link>
              <Link
                className="shared-content"
                to={`/posts/${post.sharedPost._id}`}
              >
                <RichText
                  text={post.sharedPost.body}
                  mentions={post.sharedPost.mentions}
                />
                {post.sharedPost.image && (
                  <ContentImage
                    src={post.sharedPost.image}
                    alt="Shared post attachment"
                  />
                )}
              </Link>
            </>
          ) : (
            <p className="muted small">
              The original post is no longer available.
            </p>
          )}
        </div>
      )}
      <div className="post-stats">
        <button onClick={() => openDialog('likes')}>
          <span className="like-dot">
            <Heart size={10} fill="currentColor" />
          </span>
          <span>
            {(post.likesCount ?? post.likes?.length ?? 0).toLocaleString()}{' '}
            <span className="stats-label">likes</span>
          </span>
        </button>
        <div>
          <button onClick={() => setComments((value) => !value)}>
            {post.commentsCount || 0} comments
          </button>
          <span>{post.sharesCount || 0} shares</span>
        </div>
      </div>
      <div className="post-actions">
        <button
          className={liked ? 'active' : ''}
          aria-pressed={liked}
          disabled={action.pending}
          onClick={() =>
            void action.run(async () => {
              const response = await postApi.like(post._id)
              onUpdate({
                ...post,
                ...response.data.post,
                user: creator,
                bookmarked: post.bookmarked,
                likesCount: response.data.likesCount,
              })
            })
          }
        >
          <Heart size={19} fill={liked ? 'currentColor' : 'none'} />
          Like
        </button>
        <button
          className={comments ? 'active' : ''}
          onClick={() => setComments((value) => !value)}
          aria-expanded={comments}
        >
          <MessageCircle size={19} />
          Comment
        </button>
        <button disabled={action.pending} onClick={() => openDialog('share')}>
          <Repeat2 size={19} />
          Share
        </button>
      </div>
      {dialog !== 'delete' && dialog !== 'share' && (
        <ErrorPanel message={action.error} />
      )}
      {comments && (
        <Comments
          post={post}
          onCountChange={(delta) =>
            onUpdate({
              ...post,
              commentsCount: Math.max(0, (post.commentsCount || 0) + delta),
            })
          }
        />
      )}
      {dialog === 'edit' && (
        <Modal title="Edit your post" onClose={() => setDialog(null)}>
          <PostComposer
            post={post}
            onSuccess={() => {
              setDialog(null)
              void action.run(async () => {
                onUpdate((await postApi.get(post._id)).data.post)
              })
            }}
            onCancel={() => setDialog(null)}
          />
        </Modal>
      )}
      {dialog === 'delete' && (
        <ConfirmDialog
          title="Delete this post?"
          pending={action.pending}
          error={action.error}
          onClose={() => setDialog(null)}
          onConfirm={() =>
            void action.run(async () => {
              await postApi.remove(post._id)
              setDialog(null)
              onDelete(post._id)
            })
          }
        />
      )}
      {dialog === 'likes' && (
        <Modal title="People who liked this" onClose={() => setDialog(null)}>
          <Likes postId={post._id} />
        </Modal>
      )}
      {dialog === 'share' && (
        <Modal
          title="Share with your community"
          onClose={() => {
            if (!action.pending) setDialog(null)
          }}
        >
          <form
            className="form-stack"
            onSubmit={(event) => {
              event.preventDefault()
              void action.run(async () => {
                await postApi.share(post._id, shareBody.trim())
                setShareBody('')
                setDialog(null)
                navigate('/profile')
                window.dispatchEvent(new Event('route-social:posts-changed'))
                window.dispatchEvent(new Event('route-social:changed'))
              })
            }}
          >
            <div className="row">
              <Avatar user={user} />
              <div>
                <strong>{user.name}</strong>
                <p className="muted small">Sharing publicly</p>
              </div>
            </div>
            <textarea
              aria-label="Share commentary"
              placeholder="Add a little context… (optional)"
              value={shareBody}
              onChange={(event) => setShareBody(event.target.value)}
              rows={3}
              maxLength={10000}
              disabled={action.pending}
            />
            <div className="share-preview">
              <strong>{creator.name}</strong>
              <RichText text={post.body || 'Photo post'} />
              {post.image && <ContentImage src={post.image} />}
            </div>
            <ErrorPanel message={action.error} />
            <Button type="submit" busy={action.pending}>
              <Send size={16} /> Share post
            </Button>
          </form>
        </Modal>
      )}
    </article>
  )
}

function Likes({ postId }: { postId: string }) {
  const list = usePaged<User>((page, signal) =>
    postApi.likes(postId, page, signal),
  )
  return (
    <div className="stack">
      {list.items.map((user) => (
        <Link to={`/users/${user._id}`} className="person-row" key={user._id}>
          <Avatar user={user} />
          <div>
            <strong>{user.name}</strong>
            <p className="muted small">@{user.username || 'member'}</p>
          </div>
        </Link>
      ))}
      {list.loading && (
        <p role="status" className="muted">
          Loading people…
        </p>
      )}
      <ErrorPanel message={list.error} retry={list.refetch} />
      {!list.loading && !list.error && !list.items.length && (
        <EmptyState title="A little love goes a long way">
          Be the first to like this post.
        </EmptyState>
      )}
      <LoadMore
        hasMore={list.hasMore}
        loading={list.loading}
        onClick={list.loadMore}
      />
    </div>
  )
}
