'use client'
import { useRef, useEffect, useState } from 'react'
import './side-panel.css'

type SideItem = {
  id: string
  title: string
  subtitle?: string
  emoji?: string
  href: string
}

const FEATURED: SideItem[] = [
  { id: 'f1', title: 'مطبخ البلد', subtitle: 'شبين القناطر', emoji: '🍽️', href: '#' },
  { id: 'f2', title: 'صيدلية الأمان', subtitle: 'طوارئ 24س', emoji: '💊', href: '#' },
  { id: 'f3', title: 'برجر هاوس', subtitle: 'المنايل', emoji: '🍔', href: '#' },
  { id: 'f4', title: 'مشويات الشرق', subtitle: 'شبين القناطر', emoji: '🥙', href: '#' },
  { id: 'f5', title: 'كافيه النجوم', subtitle: 'المنايل', emoji: '☕', href: '#' },
  { id: 'f6', title: 'بيتزا الطليان', subtitle: 'شبين القناطر', emoji: '🍕', href: '#' },
]

const TRENDING: SideItem[] = [
  { id: 't1', title: 'برجر هاوس', subtitle: 'الأكثر زيارة', emoji: '🍔', href: '#' },
  { id: 't2', title: 'كشري التحرير', subtitle: 'ترند النهاردة', emoji: '🍲', href: '#' },
  { id: 't3', title: 'سوبر ماركت النور', subtitle: 'الأكثر طلباً', emoji: '🛒', href: '#' },
  { id: 't4', title: 'مشويات الشرق', subtitle: 'ترند الأسبوع', emoji: '🥙', href: '#' },
  { id: 't5', title: 'كافيه النجوم', subtitle: 'الأعلى تقييماً', emoji: '☕', href: '#' },
  { id: 't6', title: 'بيتزا الطليان', subtitle: 'ترند الشهر', emoji: '🍕', href: '#' },
]

function AutoSlider({
  items,
  showRank,
  featured,
}: {
  items: SideItem[]
  showRank?: boolean
  featured?: boolean
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (paused || items.length <= 5) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % (items.length - 4))
    }, 3500)
    return () => clearInterval(timer)
  }, [paused, items.length])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const step = 52
    el.scrollTo({ top: index * step, behavior: 'smooth' })
  }, [index])

  return (
    <div
      ref={trackRef}
      className="side-panel__track"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setTimeout(() => setPaused(false), 2500)}
    >
      {items.map((item, idx) => (
        <a
          key={item.id}
          href={item.href}
          className={`side-panel__card ${featured ? 'side-panel__card--featured' : ''}`}
        >
          {showRank && <span className="side-panel__rank">{idx + 1}</span>}
          <span className="side-panel__emoji">{item.emoji}</span>
          <span className="side-panel__text">
            <span className="side-panel__title">{item.title}</span>
            {item.subtitle && <span className="side-panel__subtitle">{item.subtitle}</span>}
          </span>
        </a>
      ))}
    </div>
  )
}

export default function SidePanel() {
  return (
    <>
      <aside className="side-panel side-panel--right" aria-label="الرائج">
        <h3 className="side-panel__head">
          <span className="side-panel__head-icon">🔥</span>
          <span>الرائج</span>
        </h3>
        <AutoSlider items={TRENDING} showRank />
      </aside>

      <aside className="side-panel side-panel--left" aria-label="المميز">
        <h3 className="side-panel__head">
          <span className="side-panel__head-icon">⭐</span>
          <span>المميز</span>
          <span className="side-panel__head-badge">مدفوع</span>
        </h3>
        <AutoSlider items={FEATURED} featured />
      </aside>
    </>
  )
}
