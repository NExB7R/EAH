'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import './side-panel.css'

type SideItem = {
  id: string
  name: string
  slug: string
  type?: string
}

type PanelData = {
  featured: SideItem[]
  trending: SideItem[]
  newest: SideItem[]
}

const EMOJI: Record<string, string> = {
  restaurant: '🍽️',
  pharmacy: '💊',
  supermarket: '🛒',
  delivery_office: '🛵',
}

export default function SidePanel() {
  const [closed, setClosed] = useState(false) // مفتوح افتراضياً
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<PanelData | null>(null)

  useEffect(() => {
    setMounted(true)
    // يظهر دايماً على الديسكتوب — الإغلاق للسشن بس
    setClosed(false)

    const onOpen = () => setClosed(false)
    window.addEventListener('eah:open-sidepanel', onOpen)
    return () => window.removeEventListener('eah:open-sidepanel', onOpen)
  }, [])

  // حمّل البيانات
  useEffect(() => {
    let alive = true
    void (async () => {
      try {
        const supabase = createClient()
        const [f, t, n] = await Promise.all([
          supabase
            .from('businesses')
            .select('id,name,slug,type')
            .eq('is_published', true)
            .eq('is_featured', true)
            .limit(4),
          supabase
            .from('businesses')
            .select('id,name,slug,type,view_count')
            .eq('is_published', true)
            .order('view_count', { ascending: false, nullsFirst: false })
            .limit(4),
          supabase
            .from('businesses')
            .select('id,name,slug,type,created_at')
            .eq('is_published', true)
            .order('created_at', { ascending: false })
            .limit(4),
        ])
        if (!alive) return
        setData({
          featured: (f.data ?? []) as SideItem[],
          trending: (t.data ?? []) as SideItem[],
          newest: (n.data ?? []) as SideItem[],
        })
      } catch {
        /* silent */
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const handleClose = () => {
    setClosed(true)
  }

  if (!mounted || closed || !data) return null

  const total =
    data.featured.length + data.trending.length + data.newest.length
  if (total === 0) return null

  const Section = ({
    title,
    icon,
    items,
    seeAll,
  }: {
    title: string
    icon: string
    items: SideItem[]
    seeAll: string
  }) => {
    if (items.length === 0) return null
    return (
      <section className="side-panel__section">
        <header className="side-panel__head">
          <span className="side-panel__head-icon">{icon}</span>
          <span className="side-panel__head-title">{title}</span>
          <a href={seeAll} className="side-panel__see-all">
            الكل
          </a>
        </header>
        <div className="side-panel__list">
          {items.map((it) => (
            <a
              key={it.id}
              href={`/businesses/${it.slug}`}
              className="side-panel__card"
            >
              <span className="side-panel__emoji">
                {EMOJI[it.type ?? ''] ?? '📍'}
              </span>
              <span className="side-panel__name">{it.name}</span>
            </a>
          ))}
        </div>
      </section>
    )
  }

  return (
    <aside className="side-panel" aria-label="اكتشف">
      <button
        type="button"
        className="side-panel__close"
        onClick={handleClose}
        aria-label="إغلاق"
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
        items={data.featured}
        seeAll="/featured"
      />
      <Section
        title="الترند"
        icon="🔥"
        items={data.trending}
        seeAll="/trends"
      />
      <Section
        title="جديد"
        icon="🌱"
        items={data.newest}
        seeAll="/new"
      />

      <div className="side-panel__cta">
        <a href="/pricing" className="side-panel__cta-btn">
          ✨ اعرض نشاطك هنا
        </a>
      </div>
    </aside>
  )
}
