'use client'
import Link from 'next/link'
import './eah-logo.css'

type Props = {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'full' | 'compact' | 'mark'
  href?: string
  showTagline?: boolean
}

const SIZE_MAP = {
  sm: { word: 88,  crown: 30,  top: -18, left: -6 },
  md: { word: 130, crown: 44,  top: -27, left: -9 },
  lg: { word: 180, crown: 60,  top: -36, left: -12 },
  xl: { word: 240, crown: 80,  top: -48, left: -16 },
}

export default function EahLogo({
  size = 'md',
  variant = 'full',
  href,
  showTagline = true,
}: Props) {
  const s = SIZE_MAP[size]

  const content = (
    <span
      className={`eah-logo eah-logo--${size}`}
      dir="ltr"
      style={{
        '--word-w': `${s.word}px`,
        '--crown-s': `${s.crown}px`,
        '--crown-t': `${s.top}px`,
        '--crown-l': `${s.left}px`,
      } as React.CSSProperties}
    >
      <span className="eah-logo__word-wrap">
        {variant !== 'mark' && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src="/eah-word.webp" alt="EAH" className="eah-logo__word" />
        )}
        <span className="eah-logo__crown-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/eah-crown.webp" alt="" className="eah-logo__crown" aria-hidden />
          <span className="eah-logo__crown-glow" aria-hidden />
        </span>
      </span>
      {showTagline && variant === 'full' && (
        <span className="eah-logo__tagline" dir="rtl">اللي نفسك فيه ؟</span>
      )}
    </span>
  )

  if (href) {
    return (
      <Link href={href} className="eah-logo__link" aria-label="EAH">
        {content}
      </Link>
    )
  }
  return content
}
