'use client'
import { useRef, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
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
  maxItems = 10,
  totalItems,
  children,
}: SectionSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const currentIndexRef = useRef(0)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  // ===== تتبع الـ scroll الأفقي =====
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

      // أقرب بطاقة في المنتصف
      const cards = Array.from(el.children) as HTMLElement[]
      if (cards.length === 0) return
      const containerRect = el.getBoundingClientRect()
      const centerX = containerRect.left + containerRect.width / 2

      let closestIdx = 0
      let closestDist = Infinity
      cards.forEach((card, i) => {
        const r = card.getBoundingClientRect()
        const cardCenter = r.left + r.width / 2
        const dist = Math.abs(cardCenter - centerX)
        if (dist < closestDist) {
          closestDist = dist
          closestIdx = i
        }
      })
      currentIndexRef.current = closestIdx
    }

    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // ===== Helper: scroll أفقي فقط (بدون أي حركة رأسية) =====
  const scrollToIndex = (idx: number) => {
    const el = scrollRef.current
    if (!el) return
    const cards = Array.from(el.children) as HTMLElement[]
    const card = cards[idx] as HTMLElement | undefined
    if (!card) return

    // ⚠️ المهم: نستخدم scrollTo على الـ container نفسه فقط
    // offsetLeft مش بيتأثر بحركة الصفحة الرأسية
    const targetLeft = card.offsetLeft - el.offsetLeft
    el.scrollTo({
      left: targetLeft,
      top: 0, // ← صفر: نمنع أي scroll رأسي
      behavior: 'smooth',
    })
  }

  // ===== Auto-play =====
  useEffect(() => {
    if (paused) return
    const el = scrollRef.current
    if (!el) return

    // ⚠️ ما نعملش auto-play لو مفيش overflow أفقي
    const hasOverflow = el.scrollWidth > el.clientWidth + 4
    if (!hasOverflow) return

    const timer = setInterval(() => {
      const cards = Array.from(el.children) as HTMLElement[]
      if (cards.length === 0) return

      let nextIndex = currentIndexRef.current + 1
      if (nextIndex >= cards.length) nextIndex = 0

      scrollToIndex(nextIndex)
      currentIndexRef.current = nextIndex
    }, 5000)

    return () => clearInterval(timer)
  }, [paused])

  // ===== أزرار الأسهم =====
  const scrollByCard = (dir: 1 | -1) => {
    const el = scrollRef.current
    if (!el) return
    const cards = Array.from(el.children) as HTMLElement[]
    if (cards.length === 0) return

    let nextIndex = currentIndexRef.current + dir
    if (nextIndex < 0) nextIndex = 0
    if (nextIndex >= cards.length) nextIndex = cards.length - 1

    scrollToIndex(nextIndex)
    currentIndexRef.current = nextIndex
  }

  const items = Array.isArray(children) ? children : [children]
  const visible = items.slice(0, maxItems)
  const remaining = (totalItems ?? items.length) - maxItems

  return (
    <section id={id} className={`ss ss--${variant}`}>
      <div className="ss__head">
        <div className="ss__titles">
          <h2 className="ss__title">{title}</h2>
          {subtitle && <p className="ss__subtitle">{subtitle}</p>}
        </div>
        <div className="ss__controls">
          <div className="ss__nav-group">
            <button
              type="button"
              className="ss__nav"
              onClick={() => scrollByCard(-1)}
              disabled={!canPrev}
              aria-label="السابق"
            >
              ‹
            </button>
            <button
              type="button"
              className="ss__nav"
              onClick={() => scrollByCard(1)}
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
          onTouchEnd={() => setTimeout(() => setPaused(false), 3000)}
        >
          {visible}

          <a href={seeAllHref} className="ecard-seeall" aria-label={`شوف كل ${title}`}>
            <div className="ecard-seeall__icon" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </div>
            <h3 className="ecard-seeall__title">شوف الكل</h3>
            <p className="ecard-seeall__subtitle">
              {remaining > 0 ? `و ${remaining}+ مكان تاني` : 'استكشف كل الأماكن'}
            </p>
          </a>
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
