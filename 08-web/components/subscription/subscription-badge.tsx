'use client'
import './subscription-badge.css'

export default function SubscriptionBadge({
  variant = 'gold',
  label = 'مميز',
  size = 'md',
}: {
  variant?: 'gold' | 'purple'
  label?: string
  size?: 'sm' | 'md'
}) {
  return (
    <span className={`sub-badge sub-badge--${variant} sub-badge--${size}`}>
      <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden>
        <path d="M12 2l2.39 7.36H22l-6.2 4.5 2.39 7.36L12 16.72 5.81 21.22 8.2 13.86 2 9.36h7.61L12 2z" />
      </svg>
      <span>{label}</span>
    </span>
  )
}
