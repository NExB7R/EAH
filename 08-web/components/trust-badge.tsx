'use client'
import './trust-badge.css'

type Props = {
  score: number
  tier: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showScore?: boolean
  showLabel?: boolean
  variant?: 'default' | 'chip' | 'card'
}

const TIER_META: Record<string, { label: string; stars: string; color: string }> = {
  newbie:  { label: 'مبتدئ',  stars: '⭐',     color: '#A29DB5' },
  trusted: { label: 'موثوق',  stars: '⭐⭐',   color: '#C084FC' },
  pro:     { label: 'محترف',  stars: '⭐⭐⭐', color: '#E8C79A' },
  vip:     { label: 'VIP',    stars: '👑',     color: '#FBBF24' },
}

export default function TrustBadge({
  score,
  tier,
  size = 'sm',
  showScore = true,
  showLabel = true,
  variant = 'chip',
}: Props) {
  const meta = TIER_META[tier] ?? TIER_META.trusted

  return (
    <span
      className={`tb tb--${size} tb--${variant} tb--${tier}`}
      style={{ '--tb-color': meta.color } as React.CSSProperties}
      title={`مصداقية: ${meta.label} (${score}/100)`}
    >
      <span className="tb__stars">{meta.stars}</span>
      {showLabel && <span className="tb__label">{meta.label}</span>}
      {showScore && <span className="tb__score">{score}</span>}
    </span>
  )
}
