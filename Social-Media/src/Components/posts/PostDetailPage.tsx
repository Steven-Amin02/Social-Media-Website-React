import { useCallback } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import { postApi } from '../../shared/api/services'
import { useResource } from '../../shared/hooks'
import { ErrorPanel, Skeleton } from '../ui'
import { PostCard } from './PostCard'

export function PostDetailPage() {
  const { postId = '' } = useParams()
  const navigate = useNavigate()
  const post = useResource(
    useCallback(
      async (signal: AbortSignal) =>
        (await postApi.get(postId, signal)).data.post,
      [postId],
    ),
  )
  return (
    <div className="stack">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} />
        Back to your feed
      </Link>
      <div className="page-heading">
        <span className="eyebrow">A MOMENT WORTH SHARING</span>
        <h1>
          The conversation<span>.</span>
        </h1>
      </div>
      {post.loading ? (
        <Skeleton count={1} />
      ) : post.error ? (
        <ErrorPanel message={post.error} retry={post.refetch} />
      ) : (
        post.data && (
          <PostCard
            key={post.data._id}
            post={post.data}
            expanded
            onUpdate={post.setData}
            onDelete={() => navigate('/', { replace: true })}
          />
        )
      )}
    </div>
  )
}
