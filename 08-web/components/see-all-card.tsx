import Link from 'next/link'
import './see-all-card.css'

function IArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

function IPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function ISparkle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
    </svg>
  )
}

type Props = {
  href: string
  label: string
  count?: number
  variant?: 'featured' | 'trending' | 'new' | 'offers' | 'default'
  ctaText?: string
}

export default function SeeAllCard({
  href,
  label,
  count,
  variant = 'default',
  ctaText = 'شوف الكل',
}: Props) {
  return (
    <Link href={href} className={`sac sac--${variant}`}>
      <span className="sac__icon">
        {variant === 'default' ? <IPlus /> : <ISparkle />}
      </span>

      <span className="sac__label">{label}</span>

      {count != null && count > 0 && (
        <span className="sac__count">{count} مكان</span>
      )}

      <span className="sac__cta">
        {ctaText}
        <IArrow />
      </span>
    </Link>
  )
}
