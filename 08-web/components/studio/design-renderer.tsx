'use client'
import { useEffect, useState, useRef } from 'react'
import type { DesignData, Section } from './types'
import AdSlot from '@/components/ads/ad-slot'
import './design-renderer.css'

type Business = { id: string; name: string; slug: string; hook?: string | null; business_type?: string; is_featured?: boolean }
type Props = { initial: DesignData | null; businesses?: Business[] }

function Inline({ value, sectionId, propKey, className, as = 'span' }: {
  value: string; sectionId: string; propKey: string; className?: string; as?: any
}) {
  const ref = useRef<HTMLElement>(null)
  const Tag = as as any

  const commit = () => {
    const next = ref.current?.innerText ?? ''
    if (next !== value && window.parent !== window) {
      window.parent.postMessage({ type: 'EAH_INLINE_EDIT', sectionId, propKey, value: next }, '*')
    }
  }

  return (
    <Tag
      ref={ref}
      className={className}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={commit}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
          if (ref.current) ref.current.innerText = value
          ;(ref.current as HTMLElement | null)?.blur()
        }
        if (e.key === 'Enter' && Tag !== 'p') {
          e.preventDefault()
          ;(ref.current as HTMLElement | null)?.blur()
        }
      }}
    >
      {value}
    </Tag>
  )
}

export default function DesignRenderer({ initial, businesses = [] }: Props) {
  const [design, setDesign] = useState<DesignData | null>(initial)
  const [liveBusinesses, setLiveBusinesses] = useState<Business[]>(businesses)

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'object') return
      if (e.data.type === 'EAH_DESIGN_UPDATE' && e.data.design) setDesign(e.data.design)
      if (e.data.type === 'EAH_BUSINESSES_UPDATE' && e.data.businesses) setLiveBusinesses(e.data.businesses)
    }
    window.addEventListener('message', onMsg)
    if (window.parent !== window) window.parent.postMessage({ type: 'EAH_PREVIEW_READY' }, '*')
    return () => window.removeEventListener('message', onMsg)
  }, [])

  if (!design || !Array.isArray(design.sections) || design.sections.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A5A3B8', fontFamily: 'Cairo, system-ui', fontSize: 14 }}>
        جاري التحميل...
      </div>
    )
  }

  return (
    <main className="design-renderer">
      {design.sections.filter((s) => s.visible !== false).map((s) => (
        <SectionView key={s.id} section={s} businesses={liveBusinesses} />
      ))}
    </main>
  )
}

function buildStyle(p: Record<string, unknown>): React.CSSProperties {
  const style: React.CSSProperties = {}
  if (typeof p.padding === 'number') { style.paddingTop = p.padding; style.paddingBottom = p.padding }
  if (typeof p.margin === 'number') { style.marginTop = p.margin; style.marginBottom = p.margin }
  if (typeof p.align === 'string' && ['right', 'center', 'left'].includes(p.align)) style.textAlign = p.align as any
  if (typeof p.font === 'string' && p.font) style.fontFamily = `${p.font}, system-ui`
  return style
}

function SectionView({ section, businesses }: { section: Section; businesses: Business[] }) {
  const p = section.props as Record<string, unknown>
  const style = buildStyle(p)
  const count = typeof p.count === 'number' ? p.count : 6
  const slice = businesses.slice(0, count)

  switch (section.type) {
    case 'hero':
      return (
        <section className="dr-hero" style={style}>
          <Inline as="h1" className="dr-hero__title" value={String(p.title ?? '')} sectionId={section.id} propKey="title" />
          {p.subtitle != null && <Inline as="p" className="dr-hero__sub" value={String(p.subtitle)} sectionId={section.id} propKey="subtitle" />}
          {p.ctaText != null && <Inline as="span" className="dr-hero__cta" value={String(p.ctaText)} sectionId={section.id} propKey="ctaText" />}
        </section>
      )
    case 'featured':
    case 'trending':
    case 'new':
    case 'offers':
      return (
        <section className="dr-section" style={style}>
          <header className="dr-section__head">
            <Inline as="h2" className="dr-section__title" value={String(p.title ?? '')} sectionId={section.id} propKey="title" />
            {p.subtitle != null && <Inline as="p" className="dr-section__sub" value={String(p.subtitle)} sectionId={section.id} propKey="subtitle" />}
          </header>
          {slice.length > 0 ? (
            <div className="dr-section__grid">
              {slice.map((b) => (
                <a key={b.id} href={`/businesses/${b.slug}`} className="dr-card">
                  <div className="dr-card__name">{b.name}</div>
                  {b.hook && <div className="dr-card__hook">{b.hook}</div>}
                </a>
              ))}
            </div>
          ) : (
            <div className="dr-empty">أماكن هتظهر هنا تلقائياً</div>
          )}
        </section>
      )
    case 'categories':
      return (
        <section className="dr-section" style={style}>
          <header className="dr-section__head">
            <Inline as="h2" className="dr-section__title" value={String(p.title ?? 'بتدور على إيه؟')} sectionId={section.id} propKey="title" />
          </header>
          <div className="dr-cat-grid">
            {(Array.isArray(p.items) ? p.items : []).map((it: any, i: number) => (
              <a key={i} href={it.href ?? '#'} className="dr-cat"><span className="dr-cat__label">{it.label}</span></a>
            ))}
          </div>
        </section>
      )
    case 'cta':
      return (
        <section className="dr-cta" style={style}>
          <Inline as="h2" className="dr-cta__title" value={String(p.title ?? '')} sectionId={section.id} propKey="title" />
          {p.subtitle != null && <Inline as="p" className="dr-cta__sub" value={String(p.subtitle)} sectionId={section.id} propKey="subtitle" />}
          {p.ctaText != null && <Inline as="span" className="dr-cta__btn" value={String(p.ctaText)} sectionId={section.id} propKey="ctaText" />}
        </section>
      )
    case 'banner':
      return (
        <div className="dr-banner" style={{ ...style, background: String(p.color ?? 'rgba(168,85,247,0.2)') }}>
          <Inline value={String(p.text ?? '')} sectionId={section.id} propKey="text" />
        </div>
      )
    case 'spacer':
      return <div className="dr-spacer" style={{ height: typeof p.height === 'number' ? p.height : 40 }} aria-hidden />
    case 'ad':
      return <AdSection slotId={String(p.slotId ?? '')} height={typeof p.height === 'number' ? p.height : 120} label={String(p.label ?? 'مساحة إعلان')} />
    case 'footer':
      return null
    default:
      return null
  }
}

function AdSection({ slotId, height, label }: { slotId: string; height: number; label: string }) {
  const [ad, setAd] = useState<any>(null)
  const [loading, setLoading] = useState(!!slotId)
  useEffect(() => {
    if (!slotId) { setLoading(false); return }
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch(`/api/ads/active?slot=${encodeURIComponent(slotId)}`)
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled && data?.ad) setAd(data.ad)
      } finally { if (!cancelled) setLoading(false) }
    })()
    return () => { cancelled = true }
  }, [slotId])
  if (loading) return <div className="dr-ad dr-ad--loading" style={{ minHeight: height }}>...</div>
  if (ad) return <div className="dr-ad" style={{ minHeight: height }}><AdSlot ad={ad} href={ad.href} /></div>
  return (
    <div className="dr-ad dr-ad--empty" style={{ minHeight: height }}>
      <span className="dr-ad__badge">إعلان</span>
      <span className="dr-ad__label">{label || 'مساحة إعلان متاحة'}</span>
    </div>
  )
}
