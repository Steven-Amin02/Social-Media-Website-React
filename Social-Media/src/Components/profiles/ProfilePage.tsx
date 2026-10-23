import { useCallback, useState } from 'react'
import {
  CalendarDays,
  Camera,
  Check,
  Settings,
  UserPlus,
  Users,
} from 'lucide-react'
import { Link, useParams } from 'react-router'
import { useAuth } from '../../features/auth/auth-state'
import { UserPosts } from '../feed/FeedPages'
import { PostComposer } from '../posts/PostComposer'
import { userApi } from '../../shared/api/services'
import { useAction, useResource } from '../../shared/hooks'
import {
  Avatar,
  Button,
  ContentImage,
  ErrorPanel,
  ImagePicker,
  Modal,
  Skeleton,
} from '../ui'

export function ProfilePage() {
  const { user, refreshUser, updateFollowing } = useAuth()
  const { userId } = useParams()
  const id = userId || user?._id || ''
  const own = id === user?._id
  const profile = useResource(
    useCallback(
      async (signal: AbortSignal) => (await userApi.profile(id, signal)).data,
      [id],
    ),
  )
  const action = useAction()
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File>()
  const [postsRevision, setPostsRevision] = useState(0)
  const data = profile.data
  if (profile.loading) return <Skeleton />
  if (profile.error)
    return <ErrorPanel message={profile.error} retry={profile.refetch} />
  if (!data) return null
  return (
    <div className="stack">
      <section className="card profile-card">
        <div className="profile-cover">
          {data.user.cover ? (
            <ContentImage
              src={data.user.cover}
              alt={`${data.user.name}’s cover`}
            />
          ) : (
            <>
              <div className="cover-orbit" />
              <div className="cover-orbit second" />
              <span className="cover-word">a little more connected.</span>
            </>
          )}
        </div>
        <div className="profile-details">
          <div className="profile-avatar-row">
            <Avatar user={data.user} size="xl" />
            {own ? (
              <div className="row">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFile(undefined)
                    action.setError('')
                    setUploading(true)
                  }}
                >
                  <Camera size={16} />
                  Edit photo
                </Button>
                <Link
                  to="/settings"
                  className="icon-button"
                  aria-label="Profile settings"
                >
                  <Settings size={19} />
                </Link>
              </div>
            ) : (
              <Button
                variant={data.isFollowing ? 'secondary' : 'primary'}
                busy={action.pending}
                onClick={() =>
                  void action.run(async () => {
                    const response = await userApi.follow(id)
                    profile.setData({
                      user: {
                        ...data.user,
                        followersCount: response.data.followersCount,
                      },
                      isFollowing: response.data.following,
                    })
                    updateFollowing(id, response.data.following)
                    window.dispatchEvent(
                      new Event('route-social:people-changed'),
                    )
                    window.dispatchEvent(new Event('route-social:changed'))
                  })
                }
              >
                {data.isFollowing ? (
                  <Check size={16} />
                ) : (
                  <UserPlus size={16} />
                )}
                {data.isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
          <h1>{data.user.name}</h1>
          <p className="profile-username">@{data.user.username || 'member'}</p>
          <div className="profile-stats">
            <span>
              <Users size={15} />
              <strong>
                {data.user.followersCount ?? data.user.followers?.length ?? 0}
              </strong>{' '}
              followers
            </span>
            <span>
              <strong>
                {data.user.followingCount ?? data.user.following?.length ?? 0}
              </strong>{' '}
              following
            </span>
            {data.user.createdAt && (
              <span className="profile-joined">
                <CalendarDays size={14} />
                Joined{' '}
                {new Date(data.user.createdAt).toLocaleDateString('en', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
          {!uploading && <ErrorPanel message={action.error} />}
        </div>
        <div className="profile-tab">Posts & shared moments</div>
      </section>
      {own && (
        <PostComposer
          onSuccess={() => setPostsRevision((value) => value + 1)}
        />
      )}
      <UserPosts key={`${id}-${postsRevision}`} userId={id} />
      {uploading && (
        <Modal
          title="A face for your community"
          onClose={() => {
            if (!action.pending) setUploading(false)
          }}
        >
          <form
            className="form-stack"
            onSubmit={(event) => {
              event.preventDefault()
              if (!file) return
              void action.run(async () => {
                await userApi.upload(file)
                await refreshUser()
                profile.refetch()
                setUploading(false)
                setFile(undefined)
              })
            }}
          >
            <p className="muted">Choose a photo that feels like you.</p>
            <ImagePicker
              file={file}
              onChange={setFile}
              disabled={action.pending}
            />
            <ErrorPanel message={action.error} />
            <div className="dialog-actions">
              <Button
                variant="secondary"
                disabled={action.pending}
                onClick={() => setUploading(false)}
              >
                Cancel
              </Button>
              <Button type="submit" busy={action.pending} disabled={!file}>
                Save photo
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
