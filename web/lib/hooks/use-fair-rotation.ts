'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

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

export function refreshOrderItems<T extends { id: string }>(
  order: readonly T[],
  items: readonly T[],
): T[] | null {
  if (order.length !== items.length) return null

  const latestById = new Map(items.map((item) => [item.id, item] as const))
  if (latestById.size !== items.length) return null

  const refreshed: T[] = []
  for (const item of order) {
    const latest = latestById.get(item.id)
    if (!latest) return null
    refreshed.push(latest)
  }

  return refreshed
}

export function sliceVisible<T>(order: T[], start: number, size: number): T[] {
  if (order.length === 0 || size <= 0) return []
  const safeStart = Math.min(Math.max(0, start), order.length)
  return order.slice(safeStart, safeStart + size)
}

export function nextPageStart(
  cursor: number,
  length: number,
  size: number,
  coveredUntil = cursor + size,
): number {
  if (length <= 0 || size <= 0) return 0
  const next = Math.max(Math.max(0, cursor) + size, coveredUntil)
  return next >= length ? 0 : next
}

export function previousPageStart(cursor: number, size: number): number {
  if (size <= 0) return Math.max(0, cursor)
  return Math.max(0, cursor - size)
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
  const [cursor, setCursor] = useState(0)
  const [visible, setVisible] = useState<T[]>(() => items.slice(0, pageSizes.desktop))
  const [paused, setPaused] = useState(false)
  const [inView, setInView] = useState(true)
  const [reduced, setReduced] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrolling, setScrolling] = useState(false)

  const containerRef = useRef<HTMLElement | null>(null)
  const orderRef = useRef<T[]>([])
  const cursorRef = useRef(0)
  const coveredUntilRef = useRef(0)
  const itemsRef = useRef<T[]>(items)
  const pageSizeRef = useRef(pageSize)
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    itemsRef.current = items
    pageSizeRef.current = pageSize

    // Keep the randomized ID order, but refresh each item from the latest server data.
    // A changed set of IDs is handled by the session restoration/reinitialization effect below.
    const refreshedOrder = refreshOrderItems(orderRef.current, items)
    if (refreshedOrder) {
      orderRef.current = refreshedOrder
      setVisible(sliceVisible(refreshedOrder, cursorRef.current, pageSize))
    }
  }, [items, pageSize])

  const persist = useCallback(() => {
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          ids: orderRef.current.map((b) => b.id),
          cursor: cursorRef.current,
          coveredUntil: coveredUntilRef.current,
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
    const nextCursor = nextPageStart(
      cursorRef.current,
      order.length,
      size,
      coveredUntilRef.current,
    )
    if (nextCursor === 0) {
      orderRef.current = fisherYates(itemsRef.current)
      cursorRef.current = 0
      coveredUntilRef.current = Math.min(orderRef.current.length, size)
    } else {
      cursorRef.current = nextCursor
      coveredUntilRef.current = Math.min(order.length, nextCursor + size)
    }
    setCursor(cursorRef.current)
    setVisible(sliceVisible(orderRef.current, cursorRef.current, size))
    persist()
  }, [persist])

  const prev = useCallback(() => {
    const order = orderRef.current
    if (order.length === 0) return
    const size = pageSizeRef.current
    // Do not wrap backward from page one: that could skip unseen items before the cycle resets.
    cursorRef.current = previousPageStart(cursorRef.current, size)
    setCursor(cursorRef.current)
    setVisible(sliceVisible(orderRef.current, cursorRef.current, size))
    persist()
  }, [persist])

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
        const parsed = JSON.parse(raw) as {
          ids?: string[]
          cursor?: number
          coveredUntil?: number
        }
        const ids = parsed.ids ?? []
        const byId = new Map(items.map((b) => [b.id, b]))
        const restored = ids.map((id) => byId.get(id)).filter((b): b is T => !!b)
        const missing = items.filter((b) => !ids.includes(b.id))
        if (restored.length === items.length && missing.length === 0) {
          nextOrder = restored
          const savedCursor =
            typeof parsed.cursor === 'number' && Number.isFinite(parsed.cursor)
              ? Math.floor(parsed.cursor)
              : 0
          nextCursor = Math.min(Math.max(0, savedCursor), Math.max(0, items.length - 1))
          const savedCovered =
            typeof parsed.coveredUntil === 'number' && Number.isFinite(parsed.coveredUntil)
              ? Math.floor(parsed.coveredUntil)
              : nextCursor + pageSize
          coveredUntilRef.current = Math.min(
            items.length,
            Math.max(nextCursor + pageSize, nextCursor, savedCovered),
          )
        }
      }
    } catch {
      // ignore
    }

    if (!nextOrder) {
      nextOrder = fisherYates(items)
      nextCursor = 0
      coveredUntilRef.current = Math.min(nextOrder.length, pageSize)
    }

    orderRef.current = nextOrder
    cursorRef.current = nextCursor
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time mount
    setMounted(true)
    setCursor(nextCursor)
    coveredUntilRef.current = Math.max(
      coveredUntilRef.current,
      Math.min(nextOrder.length, nextCursor + pageSize),
    )
    setVisible(sliceVisible(nextOrder, nextCursor, pageSize))
    persist()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, storageKey, disabled, pageSize, persist])

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

  useEffect(() => {
    if (!mounted) return
    const nextCoveredUntil = Math.min(
      orderRef.current.length,
      cursorRef.current + pageSize,
    )
    if (nextCoveredUntil > coveredUntilRef.current) {
      coveredUntilRef.current = nextCoveredUntil
      persist()
    }
    setVisible(sliceVisible(orderRef.current, cursorRef.current, pageSize))
  }, [pageSize, mounted, persist])

  return {
    visible,
    containerRef,
    paused,
    setPaused,
    next,
    prev,
    pageSize,
    canPrev: cursor > 0,
  }
}
