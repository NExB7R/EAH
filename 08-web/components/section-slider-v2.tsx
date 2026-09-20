'use client'
import { useRef, useState, useEffect, Children } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import './section-slider-v2.css'

type Variant = 'featured' | 'trending' | 'new' | 'offers' | 'projects'

type Props = {
  title: string
  subtitle?: string
  seeAllHref: string
  variant: Variant
  children: ReactNode
  autoAdvanceMs?: number
  paused?: boolean
}

export default function SectionSliderV2({
  title,
  subtitle,
  seeAllHref,
  variant,
  children,
  autoAdvanceMs = 2500,
  paused: externalPaused = false,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)

  const items = Children.toArray(children)
  const isPaused = paused || externalPaused

  useEffect(() => {
    if (isPaused || items.length === 0) return
    const el = scrollRef.current
    if (!el) return

    const t = setInterval(() => {
      const max = el.scrollWidth - el.clientWidth
      if (max <= 4) return
      const isRTL = getComputedStyle(el).direction === 'rtl'
      const cardEl = el.querySelector('.ec5') as HTMLElement | null
      const step = (cardEl?.clientWidth ?? 260) + 14

      const cur = Math.abs(el.scrollLeft)
      const next = cur + step

      if (next >= max - 4) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: isRTL ? -step : step, behavior: 'smooth' })
      }
    }, autoAdvanceMs)

    return () => clearInterval(t)
  }, [isPaused, items.length, autoAdvanceMs])

  function scrollByDir(dir: 1 | -1) {
    const el = scrollRef.current
    if (!el) return
    const isRTL = getComputedStyle(el).direction === 'rtl'
    const cardEl = el.querySelector('.ec5') as HTMLElement | null
    const step = (cardEl?.clientWidth ?? 260) + 14
    el.scrollBy({ left: isRTL ? -step * dir : step * dir, behavior: 'smooth' })
  }

  return (
    <section className={`ss2 ss2--${variant}`}>
      <header className="ss2__head">
        <div>
          <h2 className="ss2__title">{title}</h2>
          {subtitle && <p className="ss2__subtitle">{subtitle}</p>}
        </div>
        <Link href={seeAllHref} className="ss2__see-all">
          شوف الكل ←
        </Link>
      </header>

      <div
        className="ss2__wrapper"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setTimeout(() => setPaused(false), 4000)}
      >
        <button
          type="button"
          className="ss2__nav ss2__nav--prev"
          onClick={() => scrollByDir(-1)}
          aria-label="السابق"
        >
          ‹
        </button>

        <div ref={scrollRef} className="ss2__track">
          {items}
        </div>

        <button
          type="button"
          className="ss2__nav ss2__nav--next"
          onClick={() => scrollByDir(1)}
          aria-label="التالي"
        >
          ›
        </button>
      </div>
    </section>
  )
}
