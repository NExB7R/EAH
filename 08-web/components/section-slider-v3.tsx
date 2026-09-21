'use client'
import { useRef, useState, useEffect, Children } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import './section-slider-v3.css'

type Variant = 'similar' | 'featured' | 'trending'

const VARIANT_META: Record<Variant, { kicker: string; icon: ReactNode }> = {
  similar: {
    kicker: 'على نفس الفكرة',
    icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/></svg>,
  },
  featured: {
    kicker: 'اختيارات فريقنا',
    icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3 6.5 7 1-5 4.8 1.2 7L12 18l-6.2 3.3L7 14.3 2 9.5l7-1z"/></svg>,
  },
  trending: {
    kicker: 'اللي الناس بتدور عليه',
    icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  },
}

type Props = {
  title: string
  subtitle?: string
  seeAllHref: string
  variant: Variant
  children: ReactNode
  autoAdvanceMs?: number
}

export default function SectionSliderV3({
  title,
  subtitle,
  seeAllHref,
  variant,
  children,
  autoAdvanceMs = 3200,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const items = Children.toArray(children)

  useEffect(() => {
    if (paused || items.length === 0) return
    const el = scrollRef.current
    if (!el) return

    const t = setInterval(() => {
      const max = el.scrollWidth - el.clientWidth
      if (max <= 4) return
      const isRTL = getComputedStyle(el).direction === 'rtl'
      const cardEl = el.querySelector('.sv3-card') as HTMLElement | null
      const step = (cardEl?.clientWidth ?? 200) + 12
      const cur = Math.abs(el.scrollLeft)
      const next = cur + step

      if (next >= max - 4) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: isRTL ? -step : step, behavior: 'smooth' })
      }
    }, autoAdvanceMs)

    return () => clearInterval(t)
  }, [paused, items.length, autoAdvanceMs])

  function scrollByDir(dir: 1 | -1) {
    const el = scrollRef.current
    if (!el) return
    const isRTL = getComputedStyle(el).direction === 'rtl'
    const cardEl = el.querySelector('.sv3-card') as HTMLElement | null
    const step = (cardEl?.clientWidth ?? 200) + 12
    el.scrollBy({ left: isRTL ? -step * dir : step * dir, behavior: 'smooth' })
  }

  const meta = VARIANT_META[variant]

  return (
    <section className={`sv3 sv3--${variant}`}>
      <header className="sv3__head">
        <div className="sv3__head-text">
          <span className="sv3__kicker">
            <span className="sv3__kicker-icon" aria-hidden>{meta.icon}</span>
            {meta.kicker}
          </span>
          <h3 className="sv3__title">{title}</h3>
          {subtitle && <p className="sv3__subtitle">{subtitle}</p>}
        </div>
        <Link href={seeAllHref} className="sv3__see-all">
          شوف الكل
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </Link>
      </header>

      <div
        className="sv3__wrapper"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setTimeout(() => setPaused(false), 4000)}
      >
        <button type="button" className="sv3__nav sv3__nav--prev" onClick={() => scrollByDir(-1)} aria-label="السابق">‹</button>

        <div ref={scrollRef} className="sv3__track">
          {items}
        </div>

        <button type="button" className="sv3__nav sv3__nav--next" onClick={() => scrollByDir(1)} aria-label="التالي">›</button>
      </div>
    </section>
  )
}
