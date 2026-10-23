import { useState } from 'react'
import { Heart, MessageCircle, Pencil, Send, Trash2 } from 'lucide-react'
import { Link } from 'react-router'
import { useAuth } from '../../features/auth/auth-state'
import { commentApi } from '../../shared/api/services'
import { useAction, usePaged } from '../../shared/hooks'
import { asUser, canDeleteComment, canEdit, hasLiked } from '../../shared/types'
import type { Comment, Post } from '../../shared/types'
import {
  Avatar,
  Button,
  ConfirmDialog,
  ContentImage,
  EmptyState,
  ErrorPanel,
  ImagePicker,
  LoadMore,
  RichText,
} from '../ui'
import { timeAgo } from '../../shared/format'

export function CommentForm({
  postId,
  parentId,
  comment,
  onSuccess,
  onCancel,
}: {
  postId: string
  parentId?: string
  comment?: Comment
  onSuccess: (comment?: Comment) => void
  onCancel?: () => void
}) {
  const { user } = useAuth()
  const [content, setContent] = useState(comment?.content || '')
  const [image, setImage] = useState<File>()
  const action = useAction()
  const canSubmit = !!content.trim() || !!image || !!comment?.image
  return (
    <form
      className="comment-form"
      onSubmit={(event) => {
        event.preventDefault()
        if (!canSubmit) return
        void action.run(async () => {
          const response = comment
            ? await commentApi.update(
                postId,
                comment._id,
                content.trim(),
                image,
              )
            : await commentApi.create(postId, content.trim(), image, parentId)
          setContent('')
          setImage(undefined)
          onSuccess(
            response.data.comment ||
              ('reply' in response.data ? response.data.reply : undefined),
          )
        })
      }}
    >
      <Avatar user={user} size="sm" />
      <div className="grow">
        <div className="comment-input">
          <textarea
            aria-label={
              comment
                ? 'Edit comment text'
                : parentId
                  ? 'Write a reply'
                  : 'Write a comment'
            }
            placeholder={
              parentId ? 'Write a thoughtful reply…' : 'Join the conversation…'
            }
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={2}
            maxLength={5000}
            disabled={action.pending}
          />
          <div className="comment-input-tools">
            <ImagePicker
              file={image}
              onChange={setImage}
              existingImage={comment?.image}
              disabled={action.pending}
              compact
            />
            {comment?.image && !image && (
              <span className="field-hint">
                Choose a photo to replace this attachment.
              </span>
            )}
            <Button
              type="submit"
              busy={action.pending}
              disabled={!canSubmit}
              aria-label={
                comment
                  ? 'Save comment'
                  : parentId
                    ? 'Send reply'
                    : 'Send comment'
              }
            >
              <Send size={14} />
              {comment && 'Save'}
            </Button>
          </div>
        </div>
        <ErrorPanel message={action.error} />
        {onCancel && (
          <button
            type="button"
            className="text-link small"
            disabled={action.pending}
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

function CommentItem({
  comment,
  post,
  onUpdate,
  onDelete,
  isReply = false,
}: {
  comment: Comment
  post: Post
  onUpdate: (comment: Comment) => void
  onDelete: (id: string) => void
  isReply?: boolean
}) {
  const { user } = useAuth()
  const creator = asUser(comment.commentCreator)
  const [replying, setReplying] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [repliesRevision, setRepliesRevision] = useState(0)
  const action = useAction()
  if (!user) return null
  const liked = hasLiked(comment.likes, user._id)
  return (
    <div className={`comment-item ${isReply ? 'is-reply' : ''}`}>
      <Link to={`/users/${creator._id}`}>
        <Avatar user={creator} size="sm" />
      </Link>
      <div className="comment-main">
        {editing ? (
          <CommentForm
            postId={post._id}
            comment={comment}
            onCancel={() => setEditing(false)}
            onSuccess={(updated) => {
              setEditing(false)
              if (updated)
                onUpdate({ ...comment, ...updated, commentCreator: creator })
            }}
          />
        ) : (
          <>
            <div className="comment-bubble">
              <div className="comment-author">
                <Link to={`/users/${creator._id}`}>{creator.name}</Link>
                <span>{timeAgo(comment.createdAt)}</span>
              </div>
              <RichText text={comment.content} mentions={comment.mentions} />
              {comment.image && (
                <ContentImage
                  src={comment.image}
                  className="comment-image"
                  alt="Comment attachment"
                />
              )}
            </div>
            <div className="comment-actions">
              <button
                className={liked ? 'active' : ''}
                disabled={action.pending}
                onClick={() =>
                  void action.run(async () => {
                    const response = await commentApi.like(
                      post._id,
                      comment._id,
                    )
                    onUpdate({
                      ...comment,
                      ...response.data.comment,
                      commentCreator: creator,
                      likesCount: response.data.likesCount,
                    })
                  })
                }
              >
                <Heart size={12} fill={liked ? 'currentColor' : 'none'} />
                {comment.likesCount ?? comment.likes?.length ?? 0} Like
              </button>
              {!isReply && (
                <button
                  onClick={() => {
                    setReplying((value) => !value)
                    setShowReplies(true)
                  }}
                >
                  <MessageCircle size={12} /> Reply
                </button>
              )}
              {canEdit(comment.commentCreator, user._id) && (
                <button onClick={() => setEditing(true)}>
                  <Pencil size={12} /> Edit
                </button>
              )}
              {canDeleteComment(comment, post.user, user._id) && (
                <button
                  onClick={() => {
                    action.setError('')
                    setDeleting(true)
                  }}
                >
                  <Trash2 size={12} /> Delete
                </button>
              )}
            </div>
          </>
        )}
        {!deleting && <ErrorPanel message={action.error} />}
        {!isReply && (
          <>
            {comment.repliesCount || showReplies ? (
              <button
                className="text-link reply-toggle"
                onClick={() => setShowReplies((value) => !value)}
              >
                {showReplies
                  ? 'Hide replies'
                  : `View ${comment.repliesCount || ''} replies`}
              </button>
            ) : null}
            {showReplies && (
              <Replies
                key={repliesRevision}
                post={post}
                parent={comment}
                onDelete={() =>
                  onUpdate({
                    ...comment,
                    repliesCount: Math.max(0, (comment.repliesCount || 0) - 1),
                  })
                }
              />
            )}
            {replying && (
              <CommentForm
                postId={post._id}
                parentId={comment._id}
                onCancel={() => setReplying(false)}
                onSuccess={() => {
                  setReplying(false)
                  setShowReplies(true)
                  setRepliesRevision((value) => value + 1)
                  onUpdate({
                    ...comment,
                    repliesCount: (comment.repliesCount || 0) + 1,
                  })
                }}
              />
            )}
          </>
        )}
      </div>
      {deleting && (
        <ConfirmDialog
          title="Delete this comment?"
          pending={action.pending}
          error={action.error}
          onClose={() => setDeleting(false)}
          onConfirm={() =>
            void action.run(async () => {
              await commentApi.remove(post._id, comment._id)
              setDeleting(false)
              onDelete(comment._id)
            })
          }
        />
      )}
    </div>
  )
}

function Replies({
  post,
  parent,
  onDelete,
}: {
  post: Post
  parent: Comment
  onDelete: () => void
}) {
  const list = usePaged<Comment>((page, signal) =>
    commentApi.replies(post._id, parent._id, page, signal),
  )
  return (
    <div className="replies">
      {list.items.map((comment) => (
        <CommentItem
          key={comment._id}
          isReply
          comment={comment}
          post={post}
          onUpdate={(updated) =>
            list.setItems((items) =>
              items.map((item) => (item._id === updated._id ? updated : item)),
            )
          }
          onDelete={(id) => {
            list.setItems((items) => items.filter((item) => item._id !== id))
            onDelete()
          }}
        />
      ))}
      {list.loading && (
        <p role="status" className="muted small">
          Loading replies…
        </p>
      )}
      <ErrorPanel message={list.error} retry={list.refetch} />
      <LoadMore
        hasMore={list.hasMore}
        loading={list.loading}
        onClick={list.loadMore}
      />
    </div>
  )
}

export function Comments({
  post,
  onCountChange,
}: {
  post: Post
  onCountChange: (delta: number) => void
}) {
  const list = usePaged<Comment>((page, signal) =>
    commentApi.list(post._id, page, signal),
  )
  return (
    <section className="comments-section" aria-label="Comments">
      <CommentForm
        postId={post._id}
        onSuccess={() => {
          list.refetch()
          onCountChange(1)
        }}
      />
      {list.items.map((comment) => (
        <CommentItem
          key={comment._id}
          comment={comment}
          post={post}
          onUpdate={(updated) =>
            list.setItems((items) =>
              items.map((item) => (item._id === updated._id ? updated : item)),
            )
          }
          onDelete={(id) => {
            list.setItems((items) => items.filter((item) => item._id !== id))
            onCountChange(-1)
          }}
        />
      ))}
      {list.loading && (
        <p role="status" className="muted small">
          Loading conversation…
        </p>
      )}
      <ErrorPanel message={list.error} retry={list.refetch} />
      {!list.loading && !list.error && !list.items.length && (
        <EmptyState title="Start the conversation">
          A kind word can go a long way. Be the first to comment.
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
