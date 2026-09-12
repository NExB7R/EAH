'use client'
import { useRef, useState } from 'react'
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
  const [hovered, setHovered] = useState(false)

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.8
    el.scrollBy({ left: dir * amount, behavior: 'smooth' })
  }

  return (
    <section id={id} className={`section-slider section-slider--${accent}`}>
      <div className="section-slider__head">
        <div className="section-slider__titles">
          <h2 className="section-slider__title">{title}</h2>
          {subtitle && <p className="section-slider__subtitle">{subtitle}</p>}
        </div>
        <div className="section-slider__controls">
          {seeAllHref && (
            <a href={seeAllHref} className="section-slider__see-all">
              شوف الكل ←
            </a>
          )}
          <button
            type="button"
            className="section-slider__nav"
            onClick={() => scrollBy(-1)}
            aria-label="السابق"
          >
            ‹
          </button>
          <button
            type="button"
            className="section-slider__nav"
            onClick={() => scrollBy(1)}
            aria-label="التالي"
          >
            ›
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className={`section-slider__track ${hovered ? 'is-hovered' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {children}
      </div>
    </section>
  )
}
