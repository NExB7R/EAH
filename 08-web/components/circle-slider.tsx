'use client'
import { useState, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import ShapePizza from './shapes/shape-pizza'
import ShapeCapsule from './shapes/shape-capsule'
import ShapeLightning from './shapes/shape-lightning'
import ShapeCrown from './shapes/shape-crown'
import ShapeSeedling from './shapes/shape-seedling'
import './circle-slider.css'

type Shape = 'pizza' | 'capsule' | 'lightning' | 'crown' | 'seedling'

type CircleSliderProps = {
  id?: string
  title: string
  subtitle?: string
  seeAllHref: string
  shape: Shape
  accent?: string
  items: ReactNode[]
  maxVisible?: number
  autoRotateMs?: number
}

const SHAPES: Record<Shape, React.ComponentType> = {
  pizza: ShapePizza,
  capsule: ShapeCapsule,
  lightning: ShapeLightning,
  crown: ShapeCrown,
  seedling: ShapeSeedling,
}

export default function CircleSlider({
  id,
  title,
  subtitle,
  seeAllHref,
  shape,
  accent = '#A855F7',
  items,
  maxVisible = 6,
  autoRotateMs = 5000,
}: CircleSliderProps) {
  const visibleItems = items.slice(0, maxVisible)
  const total = visibleItems.length
  const angleStep = total > 0 ? 360 / total : 0

  const [rotation, setRotation] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || total <= 1) return
    const timer = setInterval(() => {
      setRotation((r) => r + angleStep)
    }, autoRotateMs)
    return () => clearInterval(timer)
  }, [paused, total, angleStep, autoRotateMs])

  const rotate = (dir: 1 | -1) => setRotation((r) => r + dir * angleStep)

  const ShapeComp = SHAPES[shape]

  return (
    <section
      id={id}
      className={`cslider cslider--${shape}`}
      style={{ '--accent': accent } as React.CSSProperties}
    >
      <div className="cslider__head">
        <div className="cslider__titles">
          <h2 className="cslider__title">{title}</h2>
          {subtitle && <p className="cslider__subtitle">{subtitle}</p>}
        </div>
        <Link href={seeAllHref} className="cslider__see-all">
          اكتشف الكل
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
      </div>

      <div
        className="cslider__stage"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* الشكل المركزي */}
        <div className="cslider__shape">
          <ShapeComp />
        </div>

        {/* الحلقة */}
        {total > 0 && (
          <div className="cslider__ring">
            {visibleItems.map((item, i) => {
              const angle = angleStep * i + rotation
              return (
                <div
                  key={i}
                  className="cslider__slot"
                  style={{ '--angle': `${angle}deg` } as React.CSSProperties}
                >
                  {item}
                </div>
              )
            })}
          </div>
        )}

        {/* أزرار */}
        {total > 1 && (
          <>
            <button
              type="button"
              className="cslider__nav cslider__nav--prev"
              onClick={() => rotate(-1)}
              aria-label="السابق"
            >
              ‹
            </button>
            <button
              type="button"
              className="cslider__nav cslider__nav--next"
              onClick={() => rotate(1)}
              aria-label="التالي"
            >
              ›
            </button>
          </>
        )}
      </div>
    </section>
  )
}
