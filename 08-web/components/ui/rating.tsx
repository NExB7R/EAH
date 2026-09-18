'use client'
import { useState } from 'react'

type Props = {
  value: number
  onChange?: (v: number) => void
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  readOnly?: boolean
}

export default function Rating({ value, onChange, max = 5, size = 'md', showValue = false, readOnly = false }: Props) {
  const [hover, setHover] = useState<number | null>(null)
  const display = hover ?? value

  return (
    <div className={`e-rating e-rating--${size}`} role="radiogroup" aria-label="تقييم">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          className={`e-rating__star ${n <= display ? 'is-on' : ''}`}
          onClick={() => !readOnly && onChange?.(n)}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(null)}
          disabled={readOnly}
          aria-label={`${n} من ${max}`}
        >
          <svg viewBox="0 0 24 24" width="100%" height="100%" fill={n <= display ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
      {showValue && value > 0 && <span className="e-rating__value">{value.toFixed(1)}</span>}
    </div>
  )
}
