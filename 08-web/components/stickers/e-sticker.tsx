'use client'
import './e-sticker.css'

type Props = {
  variant: 'koshary' | 'foul' | 'coffee' | 'new' | 'trending'
  size?: 'sm' | 'md' | 'lg'
  label?: string
  rotate?: number
  className?: string
}

const LABELS: Record<Props['variant'], string> = {
  koshary: 'كشري',
  foul: 'فول',
  coffee: 'قهوة',
  new: 'جديد',
  trending: 'ترند',
}

export default function ESticker({
  variant,
  size = 'md',
  label,
  rotate = -6,
  className = '',
}: Props) {
  return (
    <span
      className={`e-sticker e-sticker--${variant} e-sticker--${size} ${className}`}
      style={{ '--stk-rotate': `${rotate}deg` } as React.CSSProperties}
      aria-label={label ?? LABELS[variant]}
    >
      <span className="e-sticker__inner">
        <span className="e-sticker__icon" aria-hidden>
          {variant === 'koshary' && (
            <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11h18" />
              <path d="M4 11c0 5 3 8 8 8s8-3 8-8" />
              <path d="M8 7c0-1.5 1-2 1-3" />
              <path d="M12 6c0-1.5 1-2 1-3" />
              <path d="M16 7c0-1.5 1-2 1-3" />
            </svg>
          )}
          {variant === 'foul' && (
            <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12c0-4 3.5-7 8-7s8 3 8 7" />
              <path d="M3 12h18" />
              <path d="M5 15c0 3 3 5 7 5s7-2 7-5" />
              <circle cx="9" cy="13" r="0.8" fill="currentColor" />
              <circle cx="15" cy="13" r="0.8" fill="currentColor" />
            </svg>
          )}
          {variant === 'coffee' && (
            <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z" />
              <path d="M16 9h2a3 3 0 0 1 0 6h-2" />
              <path d="M7 4v2" />
              <path d="M11 4v2" />
            </svg>
          )}
          {variant === 'new' && (
            <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l2.5 6 6.5.5-5 4.5 1.5 6.5L12 17l-5.5 3.5 1.5-6.5-5-4.5 6.5-.5z" />
            </svg>
          )}
          {variant === 'trending' && (
            <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 18l6-8 4 5 6-9" />
              <path d="M14 6h6v6" />
            </svg>
          )}
        </span>
        <span className="e-sticker__label">{label ?? LABELS[variant]}</span>
      </span>
    </span>
  )
}
