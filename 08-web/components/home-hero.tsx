'use client'
import Link from 'next/link'
import EahLogo from './eah-logo'
import SearchBar from './search-bar'
import './home-hero.css'

const CATEGORIES = [
  { type: 'restaurant', emoji: '🍽️', label: 'مطاعم' },
  { type: 'pharmacy', emoji: '💊', label: 'صيدليات' },
  { type: 'supermarket', emoji: '🛒', label: 'ماركت' },
  { type: 'delivery_office', emoji: '🛵', label: 'توصيل' },
]

const STICKERS = [
  { kind: 'fork', top: '8%', left: '6%', size: 44, rot: -18 },
  { kind: 'pill', top: '22%', left: '14%', size: 36, rot: 22 },
  { kind: 'cart', top: '62%', left: '5%', size: 40, rot: -12 },
  { kind: 'moped', top: '78%', left: '12%', size: 38, rot: 16 },
  { kind: 'star', top: '40%', left: '3%', size: 28, rot: -22 },
  { kind: 'heart', top: '55%', left: '11%', size: 30, rot: 18 },
  { kind: 'coffee', top: '85%', left: '4%', size: 34, rot: -10 },
  { kind: 'fork', top: '12%', right: '5%', size: 42, rot: 14 },
  { kind: 'pill', top: '30%', right: '12%', size: 32, rot: -20 },
  { kind: 'cart', top: '55%', right: '6%', size: 44, rot: 12 },
  { kind: 'moped', top: '75%', right: '13%', size: 36, rot: -14 },
  { kind: 'star', top: '48%', right: '3%', size: 30, rot: 20 },
  { kind: 'heart', top: '20%', right: '18%', size: 26, rot: -16 },
  { kind: 'coffee', top: '68%', right: '8%', size: 32, rot: 22 },
]

function Sticker({ kind }: { kind: string }) {
  const c = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  if (kind === 'fork') return <svg viewBox="0 0 24 24" {...c}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>
  if (kind === 'pill') return <svg viewBox="0 0 24 24" {...c}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M12 8v8M8 12h8" /></svg>
  if (kind === 'cart') return <svg viewBox="0 0 24 24" {...c}><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.5 12.5a2 2 0 0 0 2 1.5h8.5a2 2 0 0 0 2-1.6L22 7H6" /></svg>
  if (kind === 'moped') return <svg viewBox="0 0 24 24" {...c}><circle cx="5" cy="18" r="2" /><circle cx="17" cy="18" r="2" /><path d="M5 18h10M15 18h2M14 6h4l2 6h-2M4 6h4v4" /></svg>
  if (kind === 'star') return <svg viewBox="0 0 24 24" {...c}><path d="M12 2l3 6.5 7 1-5 4.8 1.2 7L12 18l-6.2 3.3L7 14.3 2 9.5l7-1z" /></svg>
  if (kind === 'heart') return <svg viewBox="0 0 24 24" {...c}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
  if (kind === 'coffee') return <svg viewBox="0 0 24 24" {...c}><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" /><path d="M6 1v3M10 1v3M14 1v3" /></svg>
  return null
}

export default function HomeHero() {
  return (
    <section className="hh">
      <div className="hh__bg" aria-hidden>
        <div className="hh__stickers">
          {STICKERS.map((s, i) => {
            const style: React.CSSProperties = {
              top: s.top,
              width: s.size,
              height: s.size,
              transform: `rotate(${s.rot}deg)`,
              animationDelay: `${i * 0.5}s`,
            }
            if (s.left) style.left = s.left
            if (s.right) style.right = s.right
            return (
              <span key={i} className="hh__sticker" style={style}>
                <Sticker kind={s.kind} />
              </span>
            )
          })}
        </div>
      </div>

      <div className="hh__inner">
        <div className="hh__chip-top">
          
        </div>

        <div className="hh__logo">
          <EahLogo size="xl" variant="full" href="/" />
        </div>

        <p className="hh__sub">
          اكتشف مطاعم، صيدليات، ماركت، وتوصيل حواليك
        </p>

        <div className="hh__search">
          <SearchBar placeholder="مطعم؟ صيدلية؟ ماركت؟ دوّر..." />
        </div>

        <nav className="hh__cats" aria-label="تصفح سريع">
          {CATEGORIES.map((c) => (
            <Link key={c.type} href={`/explore?type=${c.type}`} className="hh__cat">
              <span className="hh__cat-emoji">{c.emoji}</span>
              <span className="hh__cat-label">{c.label}</span>
            </Link>
          ))}
        </nav>

        <Link href="/recommend" className="hh__recommend">
          <span className="hh__recommend-emoji">✨</span>
          <span className="hh__recommend-body">
            <strong>مش عارف تختار؟</strong>
            <small>قول مزاجك وإحنا نظبط</small>
          </span>
          <span className="hh__recommend-arrow">←</span>
        </Link>

        <div className="hh__trust">
          <span className="hh__trust-item">مجاني 100%</span>
          <span className="hh__trust-item">بدون تسجيل</span>
          <span className="hh__trust-item">أماكن موثوقة</span>
        </div>
      </div>
    </section>
  )
}
