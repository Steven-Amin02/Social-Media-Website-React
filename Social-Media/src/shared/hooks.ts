import { useCallback, useEffect, useRef, useState } from 'react'
import type { Page } from './types'

export const messageOf = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.'

export function useResource<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [data, setData] = useState<T>()
  const [revision, setRevision] = useState(0)
  const [settled, setSettled] = useState<{
    load: typeof load
    revision: number
    error: string
  }>()
  const loading = settled?.load !== load || settled?.revision !== revision
  const error = loading ? '' : settled?.error || ''
  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(result)
          setSettled({ load, revision, error: '' })
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setSettled({ load, revision, error: messageOf(error) })
      })
    return () => controller.abort()
  }, [load, revision])
  const refetch = useCallback(() => setRevision((value) => value + 1), [])
  return { data, loading, error, refetch, setData }
}

export function usePaged<T extends { _id: string }>(
  load: (page: number, signal: AbortSignal) => Promise<Page<T>>,
) {
  const [items, setItems] = useState<T[]>([])
  const [nextPage, setNextPage] = useState<number>()
  const [page, setPage] = useState(1)
  const [revision, setRevision] = useState(0)
  const [settled, setSettled] = useState<{
    page: number
    revision: number
    error: string
  }>()
  const loading = settled?.page !== page || settled?.revision !== revision
  const error = loading ? '' : settled?.error || ''
  const [total, setTotal] = useState<number>()
  const loaderRef = useRef(load)
  useEffect(() => {
    loaderRef.current = load
  }, [load])
  useEffect(() => {
    const controller = new AbortController()
    loaderRef
      .current(page, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        setItems((previous) => {
          const merged =
            page === 1 ? result.items : [...previous, ...result.items]
          return [...new Map(merged.map((item) => [item._id, item])).values()]
        })
        const pagination = result.pagination
        setTotal(pagination?.total)
        setNextPage(
          pagination?.nextPage ??
            (pagination && pagination.currentPage < pagination.numberOfPages
              ? pagination.currentPage + 1
              : undefined),
        )
        setSettled({ page, revision, error: '' })
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setSettled({ page, revision, error: messageOf(error) })
      })
    return () => controller.abort()
  }, [page, revision])
  const refetch = useCallback(() => {
    setPage(1)
    setRevision((value) => value + 1)
  }, [])
  return {
    items,
    setItems,
    total,
    loading,
    error,
    hasMore: nextPage !== undefined,
    loadMore: () => {
      if (nextPage && !loading) setPage(nextPage)
    },
    refetch,
  }
}

export function useAction() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const lock = useRef(false)
  async function run(action: () => Promise<void>) {
    if (lock.current) return false
    lock.current = true
    setPending(true)
    setError('')
    try {
      await action()
      return true
    } catch (error) {
      setError(messageOf(error))
      return false
    } finally {
      lock.current = false
      setPending(false)
    }
  }
  return { pending, error, setError, run }
}
