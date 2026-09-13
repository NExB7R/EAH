'use client'
import { useRef, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import './section-slider.css'

type SectionSliderProps = {
  id?: string
  title: string
  subtitle?: string
  seeAllHref?: string
  accent?: 'purple' | 'gold' | 'soft'
  children: ReactNode
}

export default function SectionSlider({
  id,
  title,
  subtitle,
  seeAllHref,
  accent = 'purple',
  children,
}: SectionSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth
      if (max <= 0) return
      const p = Math.abs(el.scrollLeft) / max
      setProgress(p)
      setCanPrev(Math.abs(el.scrollLeft) > 10)
      setCanNext(Math.abs(el.scrollLeft) < max - 10)
    }
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (paused) return
    const el = scrollRef.current
    if (!el) return
    const timer = setInterval(() => {
      const max = el.scrollWidth - el.clientWidth
      if (max <= 0) return
      const isRTL = getComputedStyle(el).direction === 'rtl'
      const step = isRTL ? -240 : 240
      const next = el.scrollLeft + step
      if ((isRTL && next <= -max) || (!isRTL && next >= max)) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' })
      }
    }, 4500)
    return () => clearInterval(timer)
  }, [paused])

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.75
    const isRTL = getComputedStyle(el).direction === 'rtl'
    el.scrollBy({ left: dir * amount * (isRTL ? -1 : 1), behavior: 'smooth' })
  }

  return (
    <section id={id} className={`ss section-slider--${accent}`}>
      <div className="ss__head">
        <div className="ss__titles">
          <h2 className="ss__title">{title}</h2>
          {subtitle && <p className="ss__subtitle">{subtitle}</p>}
        </div>
        <div className="ss__controls">
          {seeAllHref && (
            <a href={seeAllHref} className="ss__see-all">
              شوف الكل
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </a>
          )}
          <div className="ss__nav-group">
            <button
              type="button"
              className="ss__nav"
              onClick={() => scrollBy(-1)}
              disabled={!canPrev}
              aria-label="السابق"
            >
              ‹
            </button>
            <button
              type="button"
              className="ss__nav"
              onClick={() => scrollBy(1)}
              disabled={!canNext}
              aria-label="التالي"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <div className="ss__wrapper">
        <div
          ref={scrollRef}
          className="ss__track"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setTimeout(() => setPaused(false), 2000)}
        >
          {children}
        </div>
      </div>

      <div className="ss__progress" aria-hidden>
        <div
          className="ss__progress-bar"
          style={{ transform: `scaleX(${Math.max(0.08, progress)})` }}
        />
      </div>
    </section>
  )
}
