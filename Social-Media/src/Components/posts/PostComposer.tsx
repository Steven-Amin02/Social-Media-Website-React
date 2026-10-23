import { useState } from 'react'
import { Globe2, Send } from 'lucide-react'
import { useAuth } from '../../features/auth/auth-state'
import { postApi } from '../../shared/api/services'
import { useAction } from '../../shared/hooks'
import { Avatar, Button, ErrorPanel, ImagePicker } from '../ui'
import type { Post } from '../../shared/types'

export function PostComposer({
  post,
  onSuccess,
  onCancel,
}: {
  post?: Post
  onSuccess: () => void
  onCancel?: () => void
}) {
  const { user } = useAuth()
  const [body, setBody] = useState(post?.body || '')
  const [image, setImage] = useState<File>()
  const [removeImage, setRemoveImage] = useState(false)
  const action = useAction()
  const canSubmit = !!body.trim() || !!image || (!!post?.image && !removeImage)
  return (
    <form
      className={`post-composer ${post ? '' : 'card'}`}
      onSubmit={(event) => {
        event.preventDefault()
        if (!canSubmit) return
        void action.run(async () => {
          if (post)
            await postApi.update(post._id, body.trim(), image, removeImage)
          else await postApi.create(body.trim(), image)
          setBody('')
          setImage(undefined)
          setRemoveImage(false)
          onSuccess()
        })
      }}
    >
      <div className="composer-top">
        <Avatar user={user} />
        <div className="grow">
          <label
            className="sr-only"
            htmlFor={post ? `edit-post-${post._id}` : 'new-post'}
          >
            {post ? 'Edit post text' : 'Write a post'}
          </label>
          <textarea
            id={post ? `edit-post-${post._id}` : 'new-post'}
            rows={post ? 4 : 2}
            placeholder={`What’s on your mind, ${user?.name.split(' ')[0] || 'friend'}?`}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            disabled={action.pending}
            maxLength={10000}
          />
        </div>
      </div>
      <ErrorPanel message={action.error} />
      <div className="composer-tools">
        <ImagePicker
          file={image}
          onChange={setImage}
          existingImage={post?.image}
          removeImage={removeImage}
          onRemoveExisting={() => setRemoveImage(true)}
          disabled={action.pending}
          compact
        />
        <div className="composer-actions">
          {!post && (
            <span className="composer-public">
              <Globe2 size={13} /> Public
            </span>
          )}
          {onCancel && (
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={action.pending}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" busy={action.pending} disabled={!canSubmit}>
            <Send size={15} />
            {post ? 'Save changes' : 'Post'}
          </Button>
        </div>
      </div>
    </form>
  )
}
