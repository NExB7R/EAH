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
  sm: { word: 88,  crown: 28,  overlap: 6,  left: -6 },
  md: { word: 130, crown: 42,  overlap: 9,  left: -8 },
  lg: { word: 180, crown: 58,  overlap: 12, left: -10 },
  xl: { word: 240, crown: 76,  overlap: 16, left: -12 },
}

export default function EahLogo({
  size = 'md',
  variant = 'full',
  href,
  showTagline = true,
}: Props) {
  const s = SIZE_MAP[size]
  const crownTop = -(s.crown - s.overlap)

  const content = (
    <span className={`eah-logo eah-logo--${size}`} dir="ltr">
      <span className="eah-logo__word-wrap" style={{ width: s.word }}>
        {variant !== 'mark' && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src="/eah-word.webp" alt="EAH" className="eah-logo__word" />
        )}
        <span
          className="eah-logo__crown-wrap"
          style={{
            width: s.crown,
            height: s.crown,
            top: crownTop,
            left: s.left,
          }}
        >
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
