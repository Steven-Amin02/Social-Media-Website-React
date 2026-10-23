import { multipart, query, request } from './client'
import type {
  AuthData,
  Comment,
  Notification,
  Page,
  Post,
  User,
} from '../types'

const page = async <T>(
  path: string,
  key: string,
  signal?: AbortSignal,
): Promise<Page<T>> => {
  const response = await request<Record<string, T[]>>(path, { signal })
  return {
    items: response.data[key] ?? [],
    pagination: response.meta?.pagination,
  }
}
export const authApi = {
  login: (values: { login: string; password: string }) =>
    request<AuthData>('/users/signin', {
      method: 'POST',
      body: values,
      public: true,
    }),
  register: (values: Record<string, string>) =>
    request<AuthData>('/users/signup', {
      method: 'POST',
      body: values,
      public: true,
    }),
  me: (signal?: AbortSignal, token?: string) =>
    request<{ user: User }>('/users/profile-data', { signal, token }),
  password: (values: { password: string; newPassword: string }) =>
    request<{ token: string }>('/users/change-password', {
      method: 'PATCH',
      body: values,
    }),
}
export const userApi = {
  profile: (id: string, signal?: AbortSignal) =>
    request<{ user: User; isFollowing: boolean }>(`/users/${id}/profile`, {
      signal,
    }),
  follow: (id: string) =>
    request<{ following: boolean; followersCount: number }>(
      `/users/${id}/follow`,
      { method: 'PUT' },
    ),
  suggestions: (currentPage: number, signal?: AbortSignal) =>
    page<User>(
      `/users/suggestions${query({ page: currentPage, limit: 10 })}`,
      'suggestions',
      signal,
    ),
  upload: (photo: File) =>
    request<{ user?: User; photo?: string }>('/users/upload-photo', {
      method: 'PUT',
      body: multipart({ photo }),
    }),
}
export const postApi = {
  feed: (
    currentPage: number,
    only: string,
    images: boolean,
    signal?: AbortSignal,
  ) =>
    page<Post>(
      `/posts/feed${query({ only, page: currentPage, limit: 10, hasImage: images || undefined })}`,
      'posts',
      signal,
    ),
  explore: (currentPage: number, signal?: AbortSignal) =>
    page<Post>(
      `/posts${query({ page: currentPage, limit: 10 })}`,
      'posts',
      signal,
    ),
  user: (id: string, currentPage: number, signal?: AbortSignal) =>
    page<Post>(
      `/users/${id}/posts${query({ page: currentPage, limit: 10 })}`,
      'posts',
      signal,
    ),
  saved: (currentPage: number, signal?: AbortSignal) =>
    page<Post>(
      `/users/bookmarks${query({ page: currentPage, limit: 10 })}`,
      'bookmarks',
      signal,
    ),
  get: (id: string, signal?: AbortSignal) =>
    request<{ post: Post }>(`/posts/${id}`, { signal }),
  create: (body: string, image?: File) =>
    request<{ post: Post }>('/posts', {
      method: 'POST',
      body: multipart({ body, image }),
    }),
  update: (id: string, body: string, image?: File, removeImage?: boolean) =>
    request<{ post: Post }>(`/posts/${id}`, {
      method: 'PUT',
      body: multipart({
        body,
        image,
        removeImage: removeImage ? 'true' : undefined,
      }),
    }),
  remove: (id: string) => request(`/posts/${id}`, { method: 'DELETE' }),
  like: (id: string) =>
    request<{ liked: boolean; likesCount: number; post: Post }>(
      `/posts/${id}/like`,
      { method: 'PUT' },
    ),
  bookmark: (id: string) =>
    request<{ bookmarked: boolean; bookmarksCount: number }>(
      `/posts/${id}/bookmark`,
      { method: 'PUT' },
    ),
  share: (id: string, body: string) =>
    request<{ post: Post }>(`/posts/${id}/share`, {
      method: 'POST',
      body: { body },
    }),
  likes: (id: string, currentPage: number, signal?: AbortSignal) =>
    page<User>(
      `/posts/${id}/likes${query({ page: currentPage, limit: 20 })}`,
      'likes',
      signal,
    ),
}
export const commentApi = {
  list: (postId: string, currentPage: number, signal?: AbortSignal) =>
    page<Comment>(
      `/posts/${postId}/comments${query({ page: currentPage, limit: 10 })}`,
      'comments',
      signal,
    ),
  replies: (
    postId: string,
    commentId: string,
    currentPage: number,
    signal?: AbortSignal,
  ) =>
    page<Comment>(
      `/posts/${postId}/comments/${commentId}/replies${query({ page: currentPage, limit: 10 })}`,
      'replies',
      signal,
    ),
  create: (postId: string, content: string, image?: File, parentId?: string) =>
    request<{ comment?: Comment; reply?: Comment }>(
      `/posts/${postId}/comments${parentId ? `/${parentId}/replies` : ''}`,
      { method: 'POST', body: multipart({ content, image }) },
    ),
  update: (postId: string, id: string, content: string, image?: File) =>
    request<{ comment: Comment }>(`/posts/${postId}/comments/${id}`, {
      method: 'PUT',
      body: multipart({
        content,
        image,
      }),
    }),
  remove: (postId: string, id: string) =>
    request(`/posts/${postId}/comments/${id}`, { method: 'DELETE' }),
  like: (postId: string, id: string) =>
    request<{ liked: boolean; likesCount: number; comment: Comment }>(
      `/posts/${postId}/comments/${id}/like`,
      { method: 'PUT' },
    ),
}
export const notificationApi = {
  list: (currentPage: number, unread: boolean, signal?: AbortSignal) =>
    page<Notification>(
      `/notifications${query({ page: currentPage, limit: 10, unread })}`,
      'notifications',
      signal,
    ),
  count: (signal?: AbortSignal) =>
    request<{ unreadCount: number }>('/notifications/unread-count', { signal }),
  read: (id: string) =>
    request(`/notifications/${id}/read`, { method: 'PATCH' }),
  readAll: () => request('/notifications/read-all', { method: 'PATCH' }),
}
