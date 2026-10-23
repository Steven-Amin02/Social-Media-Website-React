import { useEffect, useId, useRef, useState } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import {
  AlertCircle,
  ArrowRight,
  ImagePlus,
  LoaderCircle,
  MessageCircle,
  RefreshCw,
  Users,
  X,
} from 'lucide-react'
import { Link } from 'react-router'
import type { Mention, User } from '../shared/types'
import { ApiError } from '../shared/api/client'

export function Button({
  children,
  className = '',
  variant = 'primary',
  busy,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  busy?: boolean
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || busy}
      className={`btn btn-${variant} ${className}`}
      aria-busy={busy || undefined}
    >
      {busy && <LoaderCircle size={16} className="spin" />}
      {children}
    </button>
  )
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="brand" aria-label="Route Social home">
      <span className="brand-mark">
        <span />
        <span />
        <span />
      </span>
      {!compact && (
        <span>
          route<span className="brand-social">social</span>
          <span className="brand-dot">.</span>
        </span>
      )}
    </Link>
  )
}

export function Avatar({
  user,
  size = 'md',
}: {
  user?: Pick<User, 'name' | 'photo'> | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const [failed, setFailed] = useState('')
  const initials = (user?.name || 'Community member')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join('')
  return (
    <span
      className={`avatar avatar-${size}`}
      aria-label={user?.name || 'Community member'}
    >
      {user?.photo &&
      failed !== user.photo &&
      !user.photo.includes('default-profile') ? (
        <img
          src={user.photo}
          alt=""
          onError={() => setFailed(user.photo || '')}
        />
      ) : (
        <span>{initials}</span>
      )}
    </span>
  )
}

export function ErrorPanel({
  message,
  retry,
}: {
  message: string
  retry?: () => void
}) {
  if (!message) return null
  return (
    <div role="alert" className="error-panel">
      <AlertCircle size={18} />
      <div>
        <p>{message}</p>
        {retry && (
          <button className="text-link" onClick={retry}>
            Try again <RefreshCw size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

export function FormError({ error }: { error?: unknown }) {
  if (!error) return null
  return (
    <ErrorPanel
      message={
        error instanceof ApiError
          ? [...new Set([error.message, ...error.details])].join(' · ')
          : error instanceof Error
            ? error.message
            : String(error)
      }
    />
  )
}

export function EmptyState({
  title,
  children,
  icon = 'posts',
}: {
  title: string
  children?: ReactNode
  icon?: 'posts' | 'users'
}) {
  const Icon = icon === 'users' ? Users : MessageCircle
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={27} strokeWidth={1.5} />
      </span>
      <h3>{title}</h3>
      <div>
        {children || 'When there’s something new, you’ll find it here.'}
      </div>
    </div>
  )
}

export function Skeleton({ count = 2 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading content" className="stack">
      {Array.from({ length: count }, (_, index) => (
        <div className="card skeleton-card" key={index}>
          <div className="row">
            <span className="skeleton skeleton-avatar" />
            <div className="grow">
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line short" />
            </div>
          </div>
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-image" />
        </div>
      ))}
    </div>
  )
}

export function LoadingScreen() {
  return (
    <div className="loading-screen">
      <Brand />
      <LoaderCircle className="spin" aria-label="Restoring your session" />
      <p>Making room for your community…</p>
    </div>
  )
}

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const headingId = useId()
  useEffect(() => {
    const node = dialog.current
    const active = document.activeElement as HTMLElement | null
    node?.showModal()
    return () => {
      node?.close()
      active?.focus()
    }
  }, [])
  return (
    <dialog
      ref={dialog}
      className="modal"
      aria-labelledby={headingId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal-header">
        <h2 id={headingId}>{title}</h2>
        <button
          type="button"
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      <div className="modal-content">{children}</div>
    </dialog>
  )
}

export function ConfirmDialog({
  title,
  pending,
  error,
  onConfirm,
  onClose,
}: {
  title: string
  pending: boolean
  error: string
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <Modal
      title={title}
      onClose={() => {
        if (!pending) onClose()
      }}
    >
      <p className="muted">
        This action permanently removes this content. It cannot be undone.
      </p>
      <ErrorPanel message={error} />
      <div className="dialog-actions">
        <Button variant="secondary" disabled={pending} onClick={onClose}>
          Keep it
        </Button>
        <Button variant="danger" busy={pending} onClick={onConfirm}>
          Delete
        </Button>
      </div>
    </Modal>
  )
}

export function LoadMore({
  hasMore,
  loading,
  onClick,
}: {
  hasMore: boolean
  loading: boolean
  onClick: () => void
}) {
  return hasMore ? (
    <div className="load-more">
      <Button variant="secondary" busy={loading} onClick={onClick}>
        Load more <ArrowRight size={15} />
      </Button>
    </div>
  ) : null
}

export function RichText({
  text,
  mentions = [],
}: {
  text?: string
  mentions?: Mention[]
}) {
  if (!text) return null
  return (
    <p className="rich-text">
      {text.split(/(@[\w.]+)/g).map((part, index) => {
        const mention = part.startsWith('@')
          ? mentions.find((user) => user.username === part.slice(1))
          : undefined
        return mention ? (
          <Link className="mention" to={`/users/${mention._id}`} key={index}>
            {part}
          </Link>
        ) : (
          <span key={index}>{part}</span>
        )
      })}
    </p>
  )
}

export function ContentImage({
  src,
  alt = 'Post attachment',
  className = '',
}: {
  src: string
  alt?: string
  className?: string
}) {
  const [failedSource, setFailedSource] = useState('')
  return failedSource === src ? (
    <div className="image-unavailable">
      <ImagePlus size={20} /> Image unavailable
    </div>
  ) : (
    <img
      className={`content-image ${className}`}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailedSource(src)}
    />
  )
}

function FilePreview({ file }: { file: File }) {
  const image = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const url = URL.createObjectURL(file)
    if (image.current) image.current.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])
  return <img ref={image} alt="Selected attachment preview" />
}

export function ImagePicker({
  file,
  onChange,
  existingImage,
  removeImage = false,
  onRemoveExisting,
  compact = false,
  disabled = false,
}: {
  file?: File
  onChange: (file?: File) => void
  existingImage?: string | null
  removeImage?: boolean
  onRemoveExisting?: () => void
  compact?: boolean
  disabled?: boolean
}) {
  const id = useId()
  const [error, setError] = useState('')
  const existing = !removeImage ? existingImage : ''
  return (
    <div className={compact ? 'image-picker compact' : 'image-picker'}>
      {(file || existing) && (
        <div className="upload-preview">
          {file ? (
            <FilePreview file={file} />
          ) : (
            <img src={existing || ''} alt="Current attachment preview" />
          )}
          {(file || onRemoveExisting) && (
            <button
              type="button"
              aria-label="Remove attachment"
              className="icon-button"
              disabled={disabled}
              onClick={() => {
                if (file) onChange(undefined)
                else onRemoveExisting?.()
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}
      <label htmlFor={id} className="photo-control">
        <ImagePlus size={compact ? 17 : 19} />
        <span>{compact ? 'Photo' : 'Add a photo'}</span>
        <input
          id={id}
          type="file"
          disabled={disabled}
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) => {
            const selected = event.target.files?.[0]
            event.target.value = ''
            if (!selected) return
            if (
              !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(
                selected.type,
              )
            ) {
              setError('Choose a JPG, PNG, WebP, or GIF image.')
              return
            }
            if (selected.size > 5 * 1024 * 1024) {
              setError('Choose an image up to 5 MB.')
              return
            }
            setError('')
            onChange(selected)
          }}
        />
      </label>
      {!compact && (
        <span className="upload-hint">JPG, PNG, WebP or GIF · up to 5 MB</span>
      )}
      <ErrorPanel message={error} />
    </div>
  )
}
