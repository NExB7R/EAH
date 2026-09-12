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
  { id: 'f7', title: 'شاورما الشام', subtitle: 'شبين القناطر', emoji: '🌯', href: '#' },
  { id: 'f8', title: 'عصائر فريش', subtitle: 'المنايل', emoji: '🥤', href: '#' },
  { id: 'f9', title: 'حلواني الأصيل', subtitle: 'شبين القناطر', emoji: '🍰', href: '#' },
  { id: 'f10', title: 'مخبز الفجر', subtitle: 'شبين القناطر', emoji: '🥖', href: '#' },
]

const SUPPORT: SideItem[] = [
  { id: 's1', title: 'شاورما أحمد', subtitle: 'جديد', emoji: '🌯', href: '#' },
  { id: 's2', title: 'قهوة الشروق', subtitle: 'جديد', emoji: '☕', href: '#' },
  { id: 's3', title: 'حلويات نور', subtitle: 'جديد', emoji: '🍰', href: '#' },
  { id: 's4', title: 'عطارة الهنا', subtitle: 'جديد', emoji: '🌿', href: '#' },
  { id: 's5', title: 'سمكة ورق', subtitle: 'جديد', emoji: '🐟', href: '#' },
  { id: 's6', title: 'شيبسي سنتر', subtitle: 'جديد', emoji: '🥤', href: '#' },
]

function AutoSlider({ items, featured }: { items: SideItem[]; featured?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (paused || items.length <= 3) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % (items.length - 2))
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
      {items.map((item) => (
        <a
          key={item.id}
          href={item.href}
          className={`side-panel__card ${featured ? 'side-panel__card--featured' : ''}`}
        >
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
  const [closed, setClosed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (sessionStorage.getItem('eah-side-closed') === '1') setClosed(true)
  }, [])

  const handleClose = () => {
    setClosed(true)
    sessionStorage.setItem('eah-side-closed', '1')
  }

  if (!mounted || closed) return null

  return (
    <aside className="side-panel" aria-label="القائمة الجانبية">
      <button
        type="button"
        className="side-panel__close"
        onClick={handleClose}
        aria-label="إغلاق القائمة"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      <div className="side-panel__section">
        <h3 className="side-panel__head">
          <span className="side-panel__head-icon">⭐</span>
          <span>المميز</span>
          <a href="/featured" className="side-panel__see-all">الكل ←</a>
        </h3>
        <AutoSlider items={FEATURED} featured />
      </div>

      <div className="side-panel__divider" />

      <div className="side-panel__section">
        <h3 className="side-panel__head">
          <span className="side-panel__head-icon">🌱</span>
          <span>مشاريع جديدة</span>
          <a href="/new" className="side-panel__see-all">الكل ←</a>
        </h3>
        <AutoSlider items={SUPPORT} />
      </div>
    </aside>
  )
}
