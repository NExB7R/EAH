'use client'
import { useRef, useState, useEffect, Children } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import './section-slider.css'

type SliderVariant = 'restaurant' | 'offer' | 'pharmacy' | 'delivery' | 'market' | 'new'

type SectionSliderProps = {
  id?: string
  title: string
  subtitle?: string
  seeAllHref: string
  variant?: SliderVariant
  maxItems?: number
  totalItems?: number
  children: ReactNode
}

export default function SectionSlider({
  id,
  title,
  subtitle,
  seeAllHref,
  variant = 'restaurant',
  maxItems = 12,
  totalItems,
  children,
}: SectionSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  const items = Children.toArray(children).slice(0, maxItems)
  const remaining = (totalItems ?? items.length) - maxItems

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth
      if (max <= 0) return
      setProgress(Math.abs(el.scrollLeft) / max)
      setCanPrev(Math.abs(el.scrollLeft) > 10)
      setCanNext(Math.abs(el.scrollLeft) < max - 10)
    }
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.7
    const isRTL = getComputedStyle(el).direction === 'rtl'
    el.scrollBy({ left: dir * amount * (isRTL ? -1 : 1), behavior: 'smooth' })
  }

  return (
    <section id={id} className={`ss ss--${variant}`}>
      <div className="ss__head">
        <h2 className="ss__title">{title}</h2>
        {subtitle && <p className="ss__subtitle">{subtitle}</p>}
      </div>

      <div className="ss__wrapper">
        <div ref={scrollRef} className="ss__track">
          {items}
        </div>
      </div>

      {/* الأسهم في النص */}
      <div className="ss__arrows">
        <button
          type="button"
          className="ss__arrow ss__arrow--prev"
          onClick={() => scrollBy(-1)}
          disabled={!canPrev}
          aria-label="السابق"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="ss__bar" aria-hidden>
          <div
            className="ss__bar-fill"
            style={{ transform: `scaleX(${Math.max(0.05, progress)})` }}
          />
        </div>

        <button
          type="button"
          className="ss__arrow ss__arrow--next"
          onClick={() => scrollBy(1)}
          disabled={!canNext}
          aria-label="التالي"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      {/* اكتشف الكل في النص تحت */}
      <div className="ss__discover">
        <Link href={seeAllHref} className="ss__discover-link">
          اكتشف الكل
          {remaining > 0 && <span className="ss__discover-count">{remaining}+</span>}
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
