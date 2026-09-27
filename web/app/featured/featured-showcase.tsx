'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Business } from '@/lib/data'
import FeaturedCard from '@/components/featured-card'
import { FEATURED_ROTATION_MS } from '@/lib/featured-rotation'
import styles from './featured.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Featured Showcase (/featured)
//   • 8/6/4 slots حسب الشاشة (4×2 / 3×2 / 2×2)
//   • نفس نظام Home
// ═══════════════════════════════════════════════════════════

type Props = {
  businesses: Business[]
}

const PAGE_SIZE = { mobile: 4, tablet: 6, desktop: 8 } as const
const TOUCH_THRESHOLD = 50

export default function FeaturedShowcase({ businesses }: Props) {
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE.desktop)
  const [page, setPage] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const touchStartX = useRef<number | null>(null)

  useLayoutEffect(() => {
    const calc = () => {
      const w = window.innerWidth
      if (w >= 1024) setPageSize(PAGE_SIZE.desktop)
      else if (w >= 640) setPageSize(PAGE_SIZE.tablet)
      else setPageSize(PAGE_SIZE.mobile)
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setIsVisible(entry?.isIntersecting ?? true),
      { threshold: 0.1 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const totalPages = Math.max(1, Math.ceil(businesses.length / pageSize))
  const safePage = Math.min(page, totalPages - 1)

  useEffect(() => {
    if (reduced || totalPages <= 1 || paused || !isVisible) return
    const t = setInterval(() => {
      setPage((p) => (p + 1) % totalPages)
    }, FEATURED_ROTATION_MS)
    return () => clearInterval(t)
  }, [reduced, totalPages, paused, isVisible])

  const go = (dir: 1 | -1) => {
    setPage((p) => (p + dir + totalPages) % totalPages)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const end = e.changedTouches[0]?.clientX ?? touchStartX.current
    const delta = end - touchStartX.current
    if (Math.abs(delta) > TOUCH_THRESHOLD) go(delta > 0 ? -1 : 1)
    touchStartX.current = null
  }

  if (businesses.length === 0) return null

  const start = safePage * pageSize
  const visible = businesses.slice(start, start + pageSize)

  return (
    <div ref={rootRef}>
      <div
        key={safePage}
        className={styles.grid}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {visible.map((b, i) => (
          <FeaturedCard
            key={b.id}
            business={b}
            variant="small"
            priority={i < 4}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pager} aria-hidden>
          <span className={styles.counter}>
            <span className={styles.counterNow}>{safePage + 1}</span>
            <span className={styles.counterSep}>/</span>
            <span className={styles.counterTotal}>{totalPages}</span>
          </span>
        </div>
      )}
    </div>
  )
}
