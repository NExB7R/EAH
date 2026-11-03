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

export function sliceVisible<T>(order: T[], start: number, size: number): T[] {
  if (order.length === 0 || size <= 0) return []
  const safeStart = Math.min(Math.max(0, start), order.length)
  return order.slice(safeStart, safeStart + size)
}

export function nextPageStart(cursor: number, length: number, size: number): number {
  if (length <= 0 || size <= 0) return 0
  const next = Math.max(0, cursor) + size
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
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    const nextCursor = nextPageStart(cursorRef.current, order.length, size)
    if (nextCursor === 0) {
      orderRef.current = fisherYates(itemsRef.current)
      cursorRef.current = 0
    } else {
      cursorRef.current = nextCursor
    }
    setVisible(sliceVisible(orderRef.current, cursorRef.current, size))
    persist()
  }, [persist])

  const prev = useCallback(() => {
    const order = orderRef.current
    if (order.length === 0) return
    const size = pageSizeRef.current
    // Do not wrap backward from page one: that could skip unseen items before the cycle resets.
    cursorRef.current = previousPageStart(cursorRef.current, size)
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
        const parsed = JSON.parse(raw) as { ids?: string[]; cursor?: number }
        const ids = parsed.ids ?? []
        const byId = new Map(items.map((b) => [b.id, b]))
        const restored = ids.map((id) => byId.get(id)).filter((b): b is T => !!b)
        const missing = items.filter((b) => !ids.includes(b.id))
        if (restored.length === items.length && missing.length === 0) {
          nextOrder = restored
          const c = typeof parsed.cursor === 'number' ? parsed.cursor : 0
          nextCursor = items.length > 0 ? c % items.length : 0
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time mount
    setMounted(true)
    setVisible(sliceVisible(nextOrder, nextCursor, pageSize))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, storageKey, disabled])

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
    setVisible(sliceVisible(orderRef.current, cursorRef.current, pageSize))
  }, [pageSize, mounted])

  return {
    visible,
    containerRef,
    paused,
    setPaused,
    next,
    prev,
    pageSize,
  }
}
