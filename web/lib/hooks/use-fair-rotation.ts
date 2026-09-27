'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// EAH — useFairRotation
// عدالة عشوائية موحّدة لكل الأقسام
// - Fisher-Yates Shuffle (عشوائي عادل)
// - لا تكرار قبل ظهور الكل
// - sessionStorage (كل جلسة = ترتيب جديد)
// - يتوقف: خارج الشاشة / Hover / Tab مخفي
// - SSR-safe

type PageSizes = { mobile: number; tablet: number; desktop: number }
type Breakpoints = { tablet: number; desktop: number }

type Options<T> = {
  items: T[]
  pageSizes: PageSizes
  intervalMs: number
  storageKey: string
  breakpoints?: Breakpoints
  disabled?: boolean
}

type Result<T> = {
  visible: T[]
  containerRef: React.RefObject<HTMLElement | null>
  paused: boolean
  setPaused: (v: boolean) => void
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

function sliceVisible<T>(order: T[], start: number, size: number): T[] {
  if (order.length === 0) return []
  if (order.length <= size) return [...order]
  const out: T[] = []
  for (let i = 0; i < size; i++) {
    const item = order[(start + i) % order.length]
    if (item) out.push(item)
  }
  return out
}

export function useFairRotation<T extends { id: string }>({
  items,
  pageSizes,
  intervalMs,
  storageKey,
  breakpoints = DEFAULT_BP,
  disabled = false,
}: Options<T>): Result<T> {
  const itemsKey = items.map((b) => b.id).join(',')

  const [pageSize, setPageSize] = useState(pageSizes.desktop)
  const [visible, setVisible] = useState<T[]>(() => items.slice(0, pageSizes.desktop))
  const [paused, setPaused] = useState(false)
  const [inView, setInView] = useState(true)
  const [reduced, setReduced] = useState(false)
  const [mounted, setMounted] = useState(false)

  const containerRef = useRef<HTMLElement | null>(null)
  const orderRef = useRef<T[]>([])
  const cursorRef = useRef(0)

  useLayoutEffect(() => {
    const calc = () => {
      setPageSize(pickPageSize(window.innerWidth, pageSizes, breakpoints))
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [pageSizes, breakpoints])

  useEffect(() => {
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
      // corrupted storage — ignore
    }

    if (!nextOrder) {
      nextOrder = fisherYates(items)
      nextCursor = 0
    }

    orderRef.current = nextOrder
    cursorRef.current = nextCursor
    setMounted(true)
    setVisible(sliceVisible(nextOrder, nextCursor, pageSize))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, storageKey, disabled])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? true),
      { threshold: 0.1 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const onVis = () => setInView(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  useEffect(() => {
    if (!mounted || reduced || disabled || paused || !inView) return
    if (orderRef.current.length <= pageSize) return

    const t = setInterval(() => {
      const order = orderRef.current
      const next = cursorRef.current + pageSize
      if (next >= order.length) {
        orderRef.current = fisherYates(items)
        cursorRef.current = 0
      } else {
        cursorRef.current = next
      }
      setVisible(sliceVisible(orderRef.current, cursorRef.current, pageSize))
      try {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({
            ids: orderRef.current.map((b) => b.id),
            cursor: cursorRef.current,
          }),
        )
      } catch {
        // storage full — ignore
      }
    }, intervalMs)

    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, reduced, disabled, paused, inView, pageSize, storageKey, intervalMs])

  useEffect(() => {
    if (!mounted) return
    setVisible(sliceVisible(orderRef.current, cursorRef.current, pageSize))
  }, [pageSize, mounted])

  return { visible, containerRef, paused, setPaused }
}
