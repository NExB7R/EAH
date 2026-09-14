'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import './side-panel.css'

type SideItem = {
  id: string
  name: string
  slug: string
  subtitle?: string
  emoji?: string
  badge?: 'new' | 'featured' | 'trending'
}

type PanelData = {
  featured: SideItem[]
  trending: SideItem[]
  newest: SideItem[]
}

const CATEGORY_EMOJI: Record<string, string> = {
  restaurant: '🍽️',
  pharmacy: '💊',
  supermarket: '🛒',
  delivery_office: '🛵',
}

export default function SidePanel() {
  const [closed, setClosed] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<PanelData | null>(null)
  const [loading, setLoading] = useState(true)

  // ─── Toggle visibility ───
  useEffect(() => {
    setMounted(true)
    const wasOpen = localStorage.getItem('eah-sidepanel-open') === '1'
    if (wasOpen) setClosed(false)

    const onToggle = () =>
      setClosed((c) => {
        const next = !c
        localStorage.setItem('eah-sidepanel-open', next ? '0' : '1')
        return next
      })
    const onOpen = () => {
      setClosed(false)
      localStorage.setItem('eah-sidepanel-open', '1')
    }
    window.addEventListener('eah:toggle-sidepanel', onToggle)
    window.addEventListener('eah:open-sidepanel', onOpen)
    return () => {
      window.removeEventListener('eah:toggle-sidepanel', onToggle)
      window.removeEventListener('eah:open-sidepanel', onOpen)
    }
  }, [])

  // ─── Fetch real data ───
  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const supabase = createClient()
        const [feat, trend, fresh] = await Promise.all([
          supabase
            .from('businesses')
            .select('id, name, slug, type')
            .eq('is_published', true)
            .eq('is_featured', true)
            .limit(5),
          supabase
            .from('businesses')
            .select('id, name, slug, type, view_count')
            .eq('is_published', true)
            .order('view_count', { ascending: false, nullsFirst: false })
            .limit(5),
          supabase
            .from('businesses')
            .select('id, name, slug, type, created_at')
            .eq('is_published', true)
            .order('created_at', { ascending: false })
            .limit(5),
        ])

        if (!active) return

        const map = (rows: any[], badge?: SideItem['badge']): SideItem[] =>
          (rows ?? []).map((r) => ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            emoji: CATEGORY_EMOJI[r.type] ?? '📍',
            badge,
          }))

        const next: PanelData = {
          featured: map(feat.data ?? [], 'featured'),
          trending: map(trend.data ?? [], 'trending'),
          newest: map(fresh.data ?? [], 'new'),
        }

        // لو مفيش أي بيانات حقيقية → ما نعرضش البانل
        const empty =
          next.featured.length + next.trending.length + next.newest.length === 0
        setData(empty ? null : next)
      } catch {
        if (active) setData(null)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const handleClose = () => {
    setClosed(true)
    localStorage.setItem('eah-sidepanel-open', '0')
  }

  // ما نعرضش أي حاجة لحد ما نعرف النتيجة
  if (!mounted || closed || loading || !data) return null

  const Section = ({
    title,
    icon,
    seeAllHref,
    items,
    badge,
  }: {
    title: string
    icon: string
    seeAllHref: string
    items: SideItem[]
    badge?: 'featured' | 'trending' | 'new'
  }) => {
    if (items.length === 0) return null
    return (
      <div className="side-panel__section">
        <h3 className="side-panel__head">
          <span className="side-panel__head-icon">{icon}</span>
          <span>{title}</span>
          <a href={seeAllHref} className="side-panel__see-all">
            الكل
          </a>
        </h3>
        <div className="side-panel__track">
          {items.slice(0, 3).map((item) => (
            <a
              key={item.id}
              href={`/businesses/${item.slug}`}
              className={`side-panel__card ${badge === 'featured' ? 'side-panel__card--featured' : ''}`}
            >
              <span className="side-panel__emoji">{item.emoji}</span>
              <span className="side-panel__text">
                <span className="side-panel__title">{item.name}</span>
                {item.subtitle && (
                  <span className="side-panel__subtitle">{item.subtitle}</span>
                )}
              </span>
            </a>
          ))}
        </div>
      </div>
    )
  }

  const sections = [data.featured, data.trending, data.newest].filter(
    (s) => s.length > 0
  )
  if (sections.length === 0) return null

  return (
    <aside className="side-panel" aria-label="اكتشف">
      <button
        type="button"
        className="side-panel__close"
        onClick={handleClose}
        aria-label="إغلاق القائمة"
      >
        <svg
          viewBox="0 0 24 24"
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      <Section
        title="المميز"
        icon="⭐"
        seeAllHref="/featured"
        items={data.featured}
        badge="featured"
      />
      {data.featured.length > 0 && data.trending.length > 0 && (
        <div className="side-panel__divider" />
      )}
      <Section
        title="ترند"
        icon="🔥"
        seeAllHref="/trends"
        items={data.trending}
        badge="trending"
      />
      {(data.featured.length > 0 || data.trending.length > 0) &&
        data.newest.length > 0 && <div className="side-panel__divider" />}
      <Section
        title="جديد"
        icon="🌱"
        seeAllHref="/new"
        items={data.newest}
        badge="new"
      />
    </aside>
  )
}
