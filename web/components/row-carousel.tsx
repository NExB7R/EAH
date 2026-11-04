'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useMounted, useMediaQuery } from '@/lib/hooks/use-mounted'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'
import styles from './row-carousel.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — RowCarousel
// صف واحد أفقي + أسهم مخفية + auto-scroll
// يتوقف: hover / touch / خارج الشاشة / tab مخفي
// ═══════════════════════════════════════════════════════════

type Props = {
  children: React.ReactNode
  accent: string
  intervalMs?: number
}

export default function RowCarousel({ children, accent, intervalMs = 10000 }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [paused, setPaused] = useState(false)
  const [inView, setInView] = useState(true)
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const mounted = useMounted()
  const [hasOverflow, setHasOverflow] = useState(false)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e?.isIntersecting ?? true), {
      threshold: 0.1,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const onVis = () => setInView(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const check = () => setHasOverflow(el.scrollWidth > el.clientWidth + 4)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [children])

  const step = useCallback((dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const amount = el.clientWidth * 0.85
    const isRTL = getComputedStyle(el).direction === 'rtl'
    const sign = isRTL ? -1 : 1
    el.scrollBy({ left: dir * sign * amount, behavior: 'smooth' })
  }, [])

  const autoStep = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const max = Math.abs(el.scrollWidth - el.clientWidth)
    if (max < 4) return
    const current = Math.abs(el.scrollLeft)
    if (current >= max - 10) {
      el.scrollTo({ left: 0, behavior: 'smooth' })
    } else {
      step(1)
    }
  }, [step])

  useEffect(() => {
    if (!mounted || reduced || paused || !inView || !hasOverflow) return
    const t = setInterval(autoStep, intervalMs)
    return () => clearInterval(t)
  }, [mounted, reduced, paused, inView, hasOverflow, intervalMs, autoStep])

  return (
    <div
      className={`${styles.wrapper} ${hasOverflow ? styles.hasOverflow : ''}`}
      style={{ ['--carousel-accent' as string]: accent } as React.CSSProperties}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {hasOverflow && (
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowPrev}`}
          onClick={() => step(-1)}
          aria-label="السابق"
        >
          <ChevronRightIcon size={20} />
        </button>
      )}

      <div ref={trackRef} className={styles.track}>
        {children}
      </div>

      {hasOverflow && (
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowNext}`}
          onClick={() => step(1)}
          aria-label="التالي"
        >
          <ChevronLeftIcon size={20} />
        </button>
      )}
    </div>
  )
}
