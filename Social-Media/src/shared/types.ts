export interface User {
  _id: string
  name: string
  username?: string
  photo?: string
  cover?: string
  email?: string
  dateOfBirth?: string
  gender?: string
  createdAt?: string
  followers?: string[]
  following?: string[]
  followersCount?: number
  followingCount?: number
  bookmarksCount?: number
  mutualFollowersCount?: number
}

export type UserRef = User | string
export interface Mention {
  _id: string
  username?: string
  name?: string
}
export interface Post {
  _id: string
  body?: string
  image?: string | null
  user: UserRef
  createdAt: string
  likes?: UserRef[]
  likesCount?: number
  commentsCount?: number
  sharesCount?: number
  bookmarked?: boolean
  isShare?: boolean
  sharedPost?: Post | string | null
  mentions?: Mention[]
}

export interface Comment {
  _id: string
  content?: string
  image?: string | null
  commentCreator: UserRef
  post: string
  parentComment?: string | null
  createdAt: string
  likes?: UserRef[]
  likesCount?: number
  repliesCount?: number
  mentions?: Mention[]
}

export interface Notification {
  _id: string
  actor: UserRef
  type: string
  entityType: string
  entityId: string
  entity?: (Partial<Post> & { post?: string | { _id: string } }) | null
  isRead: boolean
  createdAt: string
}

export interface Pagination {
  currentPage: number
  numberOfPages: number
  limit: number
  total: number
  nextPage?: number
}
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  meta?: { pagination?: Pagination; feedMode?: string }
}
export interface Page<T> {
  items: T[]
  pagination?: Pagination
}
export interface AuthData {
  token: string
  user: User
  tokenType?: string
  expiresIn?: string
}
export const refId = (user?: UserRef | null) =>
  typeof user === 'string' ? user : user?._id
export const asUser = (user: UserRef): User =>
  typeof user === 'string' ? { _id: user, name: 'Community member' } : user
export const hasLiked = (likes: UserRef[] | undefined, id: string) =>
  !!likes?.some((user) => refId(user) === id)
export const canEdit = (owner: UserRef, userId: string) =>
  refId(owner) === userId
export const canDeleteComment = (
  comment: Comment,
  postOwner: UserRef,
  userId: string,
) => canEdit(comment.commentCreator, userId) || canEdit(postOwner, userId)
