'use client'
import { useEffect, useState } from 'react'
import type { DesignData, Section } from './types'
import './design-renderer.css'

type Business = {
  id: string
  name: string
  slug: string
  hook?: string | null
  business_type?: string
  is_featured?: boolean
}

type Props = {
  initial: DesignData | null
  businesses?: Business[]
}

export default function DesignRenderer({ initial, businesses = [] }: Props) {
  const [design, setDesign] = useState<DesignData | null>(initial)
  const [liveBusinesses, setLiveBusinesses] = useState<Business[]>(businesses)

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'object') return
      if (e.data.type === 'EAH_DESIGN_UPDATE' && e.data.design) {
        setDesign(e.data.design)
      }
      if (e.data.type === 'EAH_BUSINESSES_UPDATE' && e.data.businesses) {
        setLiveBusinesses(e.data.businesses)
      }
    }
    window.addEventListener('message', onMsg)

    if (window.parent !== window) {
      window.parent.postMessage({ type: 'EAH_PREVIEW_READY' }, '*')
    }
    return () => window.removeEventListener('message', onMsg)
  }, [])

  if (!design || !Array.isArray(design.sections) || design.sections.length === 0) {
    return null
  }

  return (
    <main className="design-renderer">
      {design.sections
        .filter((s) => s.visible !== false)
        .map((s) => (
          <SectionView key={s.id} section={s} businesses={liveBusinesses} />
        ))}
    </main>
  )
}

function buildStyle(p: Record<string, unknown>): React.CSSProperties {
  const style: React.CSSProperties = {}
  if (typeof p.padding === 'number') {
    style.paddingTop = p.padding
    style.paddingBottom = p.padding
  }
  if (typeof p.margin === 'number') {
    style.marginTop = p.margin
    style.marginBottom = p.margin
  }
  if (typeof p.align === 'string' && ['right', 'center', 'left'].includes(p.align)) {
    style.textAlign = p.align as 'right' | 'center' | 'left'
  }
  if (typeof p.font === 'string' && p.font) {
    style.fontFamily = `var(--font-${p.font.toLowerCase().replace(/ /g, '-')}, ${p.font}, system-ui)`
  }
  if (typeof p.accent === 'string' && p.accent) {
    ;(style as Record<string, string>)['--accent'] = p.accent
  }
  if (typeof p.bg === 'string' && p.bg) {
    style.background = p.bg
  }
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
          <h1 className="dr-hero__title">{String(p.title ?? '')}</h1>
          {p.subtitle != null && <p className="dr-hero__sub">{String(p.subtitle)}</p>}
          {p.ctaText != null && (
            <a href={String(p.ctaHref ?? '#')} className="dr-hero__cta">
              {String(p.ctaText)}
            </a>
          )}
        </section>
      )

    case 'featured':
    case 'trending':
    case 'offers':
      return (
        <section className="dr-section" style={style}>
          <header className="dr-section__head">
            <h2 className="dr-section__title">{String(p.title ?? '')}</h2>
            {p.subtitle != null && (
              <p className="dr-section__sub">{String(p.subtitle)}</p>
            )}
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
            <h2 className="dr-section__title">{String(p.title ?? 'بتدور على إيه؟')}</h2>
          </header>
          <div className="dr-cat-grid">
            {(Array.isArray(p.items) ? p.items : []).map((it: any, i: number) => (
              <a key={i} href={it.href ?? '#'} className="dr-cat">
                <span className="dr-cat__emoji">{it.emoji}</span>
                <span className="dr-cat__label">{it.label}</span>
              </a>
            ))}
          </div>
        </section>
      )

    case 'cta':
      return (
        <section className="dr-cta" style={style}>
          <h2 className="dr-cta__title">{String(p.title ?? '')}</h2>
          {p.subtitle != null && <p className="dr-cta__sub">{String(p.subtitle)}</p>}
          {p.ctaText != null && (
            <a href={String(p.ctaHref ?? '#')} className="dr-cta__btn">
              {String(p.ctaText)}
            </a>
          )}
        </section>
      )

    case 'banner':
      return (
        <div
          className="dr-banner"
          style={{ ...style, background: String(p.color ?? 'rgba(168,85,247,0.2)') }}
        >
          {String(p.text ?? '')}
        </div>
      )

    case 'footer':
      return null

    default:
      return null
  }
}
