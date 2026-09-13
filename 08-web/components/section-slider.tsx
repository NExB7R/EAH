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
  maxItems = 9,
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
        <div className="ss__titles">
          <h2 className="ss__title">{title}</h2>
          {subtitle && <p className="ss__subtitle">{subtitle}</p>}
        </div>
        <div className="ss__controls">
          <Link href={seeAllHref} className="ss__see-all">
            اكتشف الكل
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="ss__nav-group">
            <button type="button" className="ss__nav" onClick={() => scrollBy(-1)} disabled={!canPrev} aria-label="السابق">‹</button>
            <button type="button" className="ss__nav" onClick={() => scrollBy(1)} disabled={!canNext} aria-label="التالي">›</button>
          </div>
        </div>
      </div>

      <div className="ss__wrapper">
        <div ref={scrollRef} className="ss__track">
          {items}

          <Link href={seeAllHref} className="ss__seeall-card">
            <span className="ss__seeall-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </span>
            <span className="ss__seeall-title">شوف الكل</span>
            <span className="ss__seeall-sub">
              {remaining > 0 ? `و ${remaining}+ تاني` : 'المزيد'}
            </span>
          </Link>
        </div>
      </div>

      <div className="ss__progress" aria-hidden>
        <div className="ss__progress-bar" style={{ transform: `scaleX(${Math.max(0.08, progress)})` }} />
      </div>
    </section>
  )
}
