'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// EAH — useInfiniteList
// يعرض 12 عنصر، وبعدين يحمّل 12 تانيين لما يوصل لأسفل

type Options<T> = {
  items: T[]
  pageSize: number
}

export function useInfiniteList<T>({ items, pageSize }: Options<T>) {
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const loadMore = useCallback(() => {
    setVisibleCount((c) => Math.min(c + pageSize, items.length))
  }, [items.length, pageSize])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) loadMore()
      },
      { rootMargin: '400px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [loadMore])

  const visible = items.slice(0, visibleCount)
  const hasMore = visibleCount < items.length
  const remaining = Math.max(0, items.length - visibleCount)

  return { visible, hasMore, remaining, sentinelRef }
}
