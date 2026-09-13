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

const TRENDING: SideItem[] = [
  { id: 't1', title: 'برجر هاوس', subtitle: 'الأكثر زيارة', emoji: '🍔', href: '#' },
  { id: 't2', title: 'كشري التحرير', subtitle: 'ترند النهاردة', emoji: '🍲', href: '#' },
  { id: 't3', title: 'سوبر ماركت النور', subtitle: 'الأكثر طلباً', emoji: '🛒', href: '#' },
  { id: 't4', title: 'مشويات الشرق', subtitle: 'ترند الأسبوع', emoji: '🥙', href: '#' },
  { id: 't5', title: 'كافيه النجوم', subtitle: 'الأعلى تقييماً', emoji: '☕', href: '#' },
  { id: 't6', title: 'بيتزا الطليان', subtitle: 'ترند الشهر', emoji: '🍕', href: '#' },
  { id: 't7', title: 'شاورما الشام', subtitle: 'الأكثر تفاعلاً', emoji: '🌯', href: '#' },
  { id: 't8', title: 'عصائر فريش', subtitle: 'ترند الصيف', emoji: '🥤', href: '#' },
  { id: 't9', title: 'حلواني الأصيل', subtitle: 'الأعلى تقييماً', emoji: '🍰', href: '#' },
  { id: 't10', title: 'مخبز الفجر', subtitle: 'ترند الصباح', emoji: '🥖', href: '#' },
]

const NEW_BIZ: SideItem[] = [
  { id: 'n1', title: 'شاورما أحمد', subtitle: 'جديد', emoji: '🌯', href: '#' },
  { id: 'n2', title: 'قهوة الشروق', subtitle: 'جديد', emoji: '☕', href: '#' },
  { id: 'n3', title: 'حلويات نور', subtitle: 'جديد', emoji: '🍰', href: '#' },
  { id: 'n4', title: 'عطارة الهنا', subtitle: 'جديد', emoji: '🌿', href: '#' },
  { id: 'n5', title: 'سمكة ورق', subtitle: 'جديد', emoji: '🐟', href: '#' },
  { id: 'n6', title: 'شيبسي سنتر', subtitle: 'جديد', emoji: '🥤', href: '#' },
  { id: 'n7', title: 'فول وطعمية', subtitle: 'جديد', emoji: '🥣', href: '#' },
  { id: 'n8', title: 'كريب ستريت', subtitle: 'جديد', emoji: '🥞', href: '#' },
  { id: 'n9', title: 'بقالة الخير', subtitle: 'جديد', emoji: '🏪', href: '#' },
  { id: 'n10', title: 'عصير المانجو', subtitle: 'جديد', emoji: '🥭', href: '#' },
]

function AutoSlider({ items, featured }: { items: SideItem[]; featured?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [index, setIndex] = useState(0)

  // 10 عناصر، 3 ظاهرين، نتحرك لحد 7 ثم نرجع 0
  useEffect(() => {
    if (paused || items.length <= 3) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % (items.length - 2))
    }, 3000)
    return () => clearInterval(timer)
  }, [paused, items.length])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const step = 46
    if (el.scrollHeight > el.clientHeight + 4) { el.scrollTo({ top: index * step, left: 0, behavior: 'smooth' }) }
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
    
  }, [])

  const handleClose = () => {
    setClosed(true)
    
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
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      <div className="side-panel__section">
        <h3 className="side-panel__head">
          <span className="side-panel__head-icon">⭐</span>
          <span>المميز</span>
          <a href="/featured" className="side-panel__see-all">الكل</a>
        </h3>
        <AutoSlider items={FEATURED} featured />
      </div>

      <div className="side-panel__divider" />

      <div className="side-panel__section">
        <h3 className="side-panel__head">
          <span className="side-panel__head-icon">🔥</span>
          <span>ترند</span>
          <a href="/trends" className="side-panel__see-all">الكل</a>
        </h3>
        <AutoSlider items={TRENDING} />
      </div>

      <div className="side-panel__divider" />

      <div className="side-panel__section">
        <h3 className="side-panel__head">
          <span className="side-panel__head-icon">🌱</span>
          <span>جديد</span>
          <a href="/new" className="side-panel__see-all">الكل</a>
        </h3>
        <AutoSlider items={NEW_BIZ} />
      </div>
    </aside>
  )
}
