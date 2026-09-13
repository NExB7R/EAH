'use client'
import { useState, useEffect, useRef, type ReactNode } from 'react'
import Link from 'next/link'
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
  /** أقصى عدد كروت في الدايرة */
  maxVisible?: number
  /** مدة الدوران التلقائي (ms) */
  autoRotateMs?: number
}

export default function CircleSlider({
  id,
  title,
  subtitle,
  seeAllHref,
  shape,
  accent = '#A855F7',
  items,
  maxVisible = 8,
  autoRotateMs = 5000,
}: CircleSliderProps) {
  const visibleItems = items.slice(0, maxVisible)
  const total = visibleItems.length
  const angleStep = total > 0 ? 360 / total : 0

  const [rotation, setRotation] = useState(0)
  const [paused, setPaused] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const rotationRef = useRef(0)

  // نتحقق من حجم الشاشة (الدائرة صعبة على الموبايل)
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 900)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Auto-rotate
  useEffect(() => {
    if (!isDesktop || paused || total <= 1) return
    const timer = setInterval(() => {
      setRotation((r) => r + angleStep)
    }, autoRotateMs)
    return () => clearInterval(timer)
  }, [isDesktop, paused, total, angleStep, autoRotateMs])

  useEffect(() => {
    rotationRef.current = rotation
  }, [rotation])

  const rotate = (dir: 1 | -1) => {
    setRotation((r) => r + dir * angleStep)
  }

  // ===== Render =====
  const shapeComponent = (() => {
    switch (shape) {
      case 'pizza': return <ShapeWrapper name="pizza" />
      case 'capsule': return <ShapeWrapper name="capsule" />
      case 'lightning': return <ShapeWrapper name="lightning" />
      case 'crown': return <ShapeWrapper name="crown" />
      case 'seedling': return <ShapeWrapper name="seedling" />
    }
  })()

  return (
    <section id={id} className={`cslider cslider--${shape}`} style={{ '--accent': accent } as React.CSSProperties}>
      {/* Head */}
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

      {/* Stage */}
      <div
        className="cslider__stage"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Center shape */}
        <div className="cslider__shape">
          {shapeComponent}
        </div>

        {/* Cards ring */}
        {total > 0 && (
          <div
            className="cslider__ring"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {visibleItems.map((item, i) => {
              const angle = angleStep * i
              return (
                <div
                  key={i}
                  className="cslider__slot"
                  style={{
                    transform: `rotate(${angle}deg) translateY(var(--cslider-radius)) rotate(${-angle}deg)`,
                  }}
                >
                  {item}
                </div>
              )
            })}
          </div>
        )}

        {/* Nav buttons */}
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

// ===== Shape wrapper (lazy import) =====
function ShapeWrapper({ name }: { name: Shape }) {
  const [Comp, setComp] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    const load = async () => {
      const mod = await import(
        `./shapes/shape-${name}`
      )
      setComp(() => mod.default)
    }
    load()
  }, [name])

  if (!Comp) return null
  return <Comp />
}
