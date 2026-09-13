'use client'
import type { Section } from './types'

function Placeholder({ count = 3, tall = 80 }: { count?: number; tall?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          height: tall, borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(139,92,246,.15), rgba(168,85,247,.05))',
          border: '1px solid rgba(139,92,246,.2)',
        }} />
      ))}
    </div>
  )
}

export default function SectionRenderer({ section }: { section: Section }) {
  const p = section.props as any

  switch (section.type) {
    case 'hero':
      return (
        <div style={{ padding: '40px 20px', textAlign: p.align ?? 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 10px', color: '#F5F3FF' }}>
            {p.title}
          </h2>
          {p.subtitle && (
            <p style={{ color: '#A5A3B8', margin: '0 0 18px', fontSize: '1rem' }}>
              {p.subtitle}
            </p>
          )}
          {p.showSearch && (
            <div style={{
              maxWidth: 400, margin: '0 auto 14px', padding: '12px 16px',
              borderRadius: 999, background: 'rgba(10,8,16,.7)',
              border: '1px solid rgba(139,92,246,.25)', color: '#6B6880', fontSize: '.85rem',
            }}>
              🔍 ابحث...
            </div>
          )}
          {p.ctaText && (
            <span style={{
              display: 'inline-block', padding: '10px 22px', borderRadius: 12,
              background: 'linear-gradient(135deg,#8B5CF6,#A855F7)', color: '#fff',
              fontWeight: 800, fontSize: '.85rem',
            }}>
              {p.ctaText}
            </span>
          )}
        </div>
      )

    case 'featured':
    case 'trending':
    case 'offers':
      return (
        <div style={{ padding: '24px 16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 900, margin: '0 0 4px', color: '#F5F3FF' }}>
            {p.title}
          </h3>
          {p.subtitle && (
            <p style={{ color: '#A5A3B8', fontSize: '.78rem', margin: '0 0 12px' }}>
              {p.subtitle}
            </p>
          )}
          <Placeholder count={p.count ?? 4} tall={100} />
        </div>
      )

    case 'categories':
      return (
        <div style={{ padding: '24px 16px' }}>
          {p.title && (
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, margin: '0 0 12px', color: '#F5F3FF' }}>
              {p.title}
            </h3>
          )}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {(p.items ?? []).map((it: any, i: number) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 14,
                background: 'rgba(10,8,16,.6)',
                border: '1px solid rgba(139,92,246,.2)',
                color: '#F5F3FF', fontWeight: 700, fontSize: '.85rem',
              }}>
                <span>{it.emoji}</span>{it.label}
              </div>
            ))}
          </div>
        </div>
      )

    case 'cta':
      return (
        <div style={{
          margin: '20px 16px', padding: '24px',
          borderRadius: 22,
          background: 'linear-gradient(135deg,rgba(139,92,246,.15),rgba(168,85,247,.05))',
          border: '1px solid rgba(139,92,246,.25)',
          textAlign: 'center',
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#F5F3FF', margin: '0 0 8px' }}>
            {p.title}
          </h3>
          {p.subtitle && (
            <p style={{ color: '#A5A3B8', fontSize: '.85rem', margin: '0 0 14px' }}>
              {p.subtitle}
            </p>
          )}
          {p.ctaText && (
            <span style={{
              display: 'inline-block', padding: '10px 22px', borderRadius: 12,
              background: 'linear-gradient(135deg,#8B5CF6,#A855F7)', color: '#fff',
              fontWeight: 800, fontSize: '.85rem',
            }}>
              {p.ctaText}
            </span>
          )}
        </div>
      )

    case 'banner':
      return (
        <div style={{
          margin: '12px 16px', padding: '14px 18px',
          borderRadius: 14,
          background: `${p.color ?? '#A855F7'}22`,
          border: `1px solid ${p.color ?? '#A855F7'}55`,
          color: '#F5F3FF', fontWeight: 800, fontSize: '.85rem',
          textAlign: 'center',
        }}>
          {p.text}
        </div>
      )

    case 'footer':
      return (
        <div style={{ padding: '24px 16px', textAlign: 'center', borderTop: '1px solid rgba(139,92,246,.15)' }}>
          <div style={{ color: '#A5A3B8', fontSize: '.8rem', marginBottom: 4 }}>
            {p.tagline}
          </div>
          <div style={{ color: '#6B6880', fontSize: '.72rem' }}>
            {p.copyright}
          </div>
        </div>
      )

    default:
      return <div style={{ padding: 20, color: '#6B6880' }}>({section.type})</div>
  }
}
