'use client'
import { useState, useEffect } from 'react'
import './side-panel.css'

type SideItem = {
  id: string
  title: string
  subtitle?: string
  emoji?: string
  href: string
  badge?: string
}

type SidePanelProps = {
  featured?: SideItem[]
  trending?: SideItem[]
}

const MOCK_FEATURED: SideItem[] = [
  { id: 'f1', title: 'مطبخ البلد', subtitle: 'شبين القناطر', emoji: '🍽️', href: '#', badge: 'مميز' },
  { id: 'f2', title: 'صيدلية الأمان', subtitle: 'طوارئ 24س', emoji: '💊', href: '#', badge: 'مميز' },
]

const MOCK_TRENDING: SideItem[] = [
  { id: 't1', title: 'برجر هاوس', subtitle: 'الأكثر زيارة', emoji: '🍔', href: '#' },
  { id: 't2', title: 'كشري التحرير', subtitle: 'ترند النهاردة', emoji: '🍲', href: '#' },
  { id: 't3', title: 'سوبر ماركت النور', subtitle: 'الأكثر طلباً', emoji: '🛒', href: '#' },
]

export default function SidePanel({ featured = MOCK_FEATURED, trending = MOCK_TRENDING }: SidePanelProps) {
  const [closed, setClosed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const wasClosed = sessionStorage.getItem('eah-side-closed') === '1'
    if (wasClosed) setClosed(true)
  }, [])

  const handleClose = () => {
    setClosed(true)
    sessionStorage.setItem('eah-side-closed', '1')
  }

  if (!mounted || closed) return null

  return (
    <aside className="side-panel" aria-label="المميز والرائج">
      <button
        type="button"
        className="side-panel__close"
        onClick={handleClose}
        aria-label="إغلاق اللوحة الجانبية"
      >
        ×
      </button>

      {featured.length > 0 && (
        <div className="side-panel__group">
          <h3 className="side-panel__head">
            <span className="side-panel__head-icon">⭐</span>
            <span>المميز</span>
            <span className="side-panel__head-badge">مدفوع</span>
          </h3>
          <div className="side-panel__list">
            {featured.map((item) => (
              <a key={item.id} href={item.href} className="side-panel__card side-panel__card--featured">
                <span className="side-panel__emoji">{item.emoji}</span>
                <span className="side-panel__text">
                  <span className="side-panel__title">{item.title}</span>
                  {item.subtitle && <span className="side-panel__subtitle">{item.subtitle}</span>}
                </span>
                {item.badge && <span className="side-panel__badge">{item.badge}</span>}
              </a>
            ))}
          </div>
        </div>
      )}

      {trending.length > 0 && (
        <div className="side-panel__group">
          <h3 className="side-panel__head">
            <span className="side-panel__head-icon">🔥</span>
            <span>الرائج</span>
          </h3>
          <div className="side-panel__list">
            {trending.map((item, idx) => (
              <a key={item.id} href={item.href} className="side-panel__card">
                <span className="side-panel__rank">{idx + 1}</span>
                <span className="side-panel__emoji">{item.emoji}</span>
                <span className="side-panel__text">
                  <span className="side-panel__title">{item.title}</span>
                  {item.subtitle && <span className="side-panel__subtitle">{item.subtitle}</span>}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
