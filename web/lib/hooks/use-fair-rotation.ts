'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { clampFairRotationCursor, getNextFairRotationCursor, sliceFairRotation } from '@/lib/fair-rotation'

// ═══════════════════════════════════════════════════════════
// EAH — useFairRotation (Performance Optimized)
//   • Fisher-Yates + sessionStorage
//   • يتوقف: hover / tab hidden / out of view / **scrolling**
//   • IntersectionObserver مع rootMargin (يوقف بدري)
// ═══════════════════════════════════════════════════════════

type PageSizes = { mobile: number; tablet: number; desktop: number }
type Breakpoints = { tablet: number; desktop: number }

type Options<T> = {
  items: T[]
  pageSizes: PageSizes
  intervalMs?: number
  storageKey: string
  breakpoints?: Breakpoints
  disabled?: boolean
  auto?: boolean
}

type Result<T> = {
  visible: T[]
  containerRef: React.RefObject<HTMLElement | null>
  paused: boolean
  setPaused: (v: boolean) => void
  next: () => void
  prev: () => void
  pageSize: number
  canPrev: boolean
}

const DEFAULT_BP: Breakpoints = { tablet: 640, desktop: 1024 }

function fisherYates<T>(items: readonly T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = tmp
  }
  return arr
}

function pickPageSize(w: number, s: PageSizes, bp: Breakpoints): number {
  if (w >= bp.desktop) return s.desktop
  if (w >= bp.tablet) return s.tablet
  return s.mobile
}

export function useFairRotation<T extends { id: string }>({
  items,
  pageSizes,
  intervalMs = 8000,
  storageKey,
  breakpoints = DEFAULT_BP,
  disabled = false,
  auto = true,
}: Options<T>): Result<T> {
  const itemsKey = items.map((b) => b.id).join(',')

  const [pageSize, setPageSize] = useState(pageSizes.desktop)
  const [visible, setVisible] = useState<T[]>(() => items.slice(0, pageSizes.desktop))
  const [paused, setPaused] = useState(false)
  const [inView, setInView] = useState(true)
  const [reduced, setReduced] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrolling, setScrolling] = useState(false)

  const containerRef = useRef<HTMLElement | null>(null)
  const orderRef = useRef<T[]>([])
  const cursorRef = useRef(0)
  const itemsRef = useRef<T[]>(items)
  const pageSizeRef = useRef(pageSize)
  const visibleRef = useRef<T[]>(items.slice(0, pageSizes.desktop))
  const pageHistoryRef = useRef<Array<{ cursor: number; size: number }>>([])
  const hasAdvancedRef = useRef(false)
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showVisible = useCallback((nextVisible: T[]) => {
    visibleRef.current = nextVisible
    setVisible(nextVisible)
  }, [])

  useEffect(() => {
    itemsRef.current = items
    pageSizeRef.current = pageSize
  }, [items, pageSize])

  const persist = useCallback(() => {
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          ids: orderRef.current.map((b) => b.id),
          cursor: cursorRef.current,
          visibleIds: visibleRef.current.map((item) => item.id),
        }),
      )
    } catch {
      // ignore
    }
  }, [storageKey])

  const next = useCallback(() => {
    const order = orderRef.current
    if (order.length === 0) return
    const size = pageSizeRef.current
    // Advance by the number of cards actually shown, not the current breakpoint.
    const next = getNextFairRotationCursor(
      order.length,
      cursorRef.current,
      visibleRef.current.length,
    )
    if (next.restart) {
      orderRef.current = fisherYates(itemsRef.current)
      cursorRef.current = 0
      pageHistoryRef.current = []
    } else {
      cursorRef.current = next.cursor
    }

    hasAdvancedRef.current = true
    const nextVisible = sliceFairRotation(orderRef.current, cursorRef.current, size)
    showVisible(nextVisible)
    pageHistoryRef.current.push({ cursor: cursorRef.current, size: nextVisible.length })
    persist()
  }, [persist, showVisible])

  const prev = useCallback(() => {
    const history = pageHistoryRef.current
    if (history.length <= 1) return
    history.pop()
    const previous = history[history.length - 1]
    if (!previous) return
    cursorRef.current = previous.cursor
    showVisible(sliceFairRotation(orderRef.current, previous.cursor, previous.size))
    hasAdvancedRef.current = true
    persist()
  }, [persist, showVisible])

  useLayoutEffect(() => {
    const calc = () => {
      setPageSize(pickPageSize(window.innerWidth, pageSizes, breakpoints))
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [pageSizes, breakpoints])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    if (disabled || items.length === 0) return

    let nextOrder: T[] | null = null
    let nextCursor = 0

    try {
      const raw = sessionStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as { ids?: string[]; cursor?: number; visibleIds?: string[] }
        const ids = parsed.ids ?? []
        const byId = new Map(items.map((b) => [b.id, b]))
        const restored = ids.map((id) => byId.get(id)).filter((b): b is T => !!b)
        const missing = items.filter((b) => !ids.includes(b.id))
        if (restored.length === items.length && missing.length === 0) {
          nextOrder = restored
          const c = typeof parsed.cursor === 'number' && Number.isFinite(parsed.cursor) ? parsed.cursor : 0
          nextCursor = clampFairRotationCursor(items.length, c)
        }
      }
    } catch {
      // ignore
    }

    if (!nextOrder) {
      nextOrder = fisherYates(items)
      nextCursor = 0
    }

    orderRef.current = nextOrder
    cursorRef.current = nextCursor
    const visibleIds = (() => {
      try {
        const raw = sessionStorage.getItem(storageKey)
        if (!raw) return null
        const parsed = JSON.parse(raw) as { visibleIds?: string[] }
        if (!Array.isArray(parsed.visibleIds)) return null
        const byId = new Map(nextOrder!.map((item) => [item.id, item]))
        const restored = parsed.visibleIds.map((id) => byId.get(id)).filter((item): item is T => !!item)
        return restored.length === parsed.visibleIds.length && restored.length > 0 ? restored : null
      } catch {
        return null
      }
    })()
    const initialVisible = visibleIds ?? sliceFairRotation(nextOrder, nextCursor, pageSizeRef.current)
    hasAdvancedRef.current = !!visibleIds
    pageHistoryRef.current = [{ cursor: nextCursor, size: initialVisible.length }]
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration
    setMounted(true)
    showVisible(initialVisible)
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          ids: nextOrder.map((item) => item.id),
          cursor: nextCursor,
          visibleIds: initialVisible.map((item) => item.id),
        }),
      )
    } catch {
      // Rotation remains functional when storage is unavailable.
    }
  }, [itemsKey, storageKey, disabled, showVisible])

  // IntersectionObserver مع rootMargin
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? true), {
      threshold: 0.1,
      rootMargin: '200px 0px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const onVis = () => setInView(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // إيقاف أثناء السكرول
  useEffect(() => {
    const onScroll = () => {
      setScrolling(true)
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
      scrollTimerRef.current = setTimeout(() => setScrolling(false), 400)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!auto) return
    if (!mounted || reduced || disabled || paused || !inView || scrolling) return
    if (orderRef.current.length <= pageSize) return

    const t = setInterval(() => {
      next()
    }, intervalMs)
    return () => clearInterval(t)
  }, [auto, mounted, reduced, disabled, paused, inView, scrolling, pageSize, intervalMs, next])

  // The first responsive measurement may resize the initial page. Once a
  // visitor advances, retain the current items and use the new size only for
  // the next page, so no card repeats early after a breakpoint change.
  useEffect(() => {
    if (!mounted || hasAdvancedRef.current || orderRef.current.length === 0) return
    const initialVisible = sliceFairRotation(orderRef.current, cursorRef.current, pageSize)
    showVisible(initialVisible)
    pageHistoryRef.current = [{ cursor: cursorRef.current, size: initialVisible.length }]
    persist()
  }, [pageSize, mounted, persist, showVisible])

  return {
    visible,
    containerRef,
    paused,
    setPaused,
    next,
    prev,
    pageSize,
    canPrev: pageHistoryRef.current.length > 1,
  }
}
