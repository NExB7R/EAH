'use client'
// v6.1 — cache-busted 1789585536.1980636
import Link from 'next/link'

type Props = {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'full' | 'compact' | 'mark'
  href?: string
  showTagline?: boolean
}

const SIZE_MAP = {
  sm: { word: 88,  crown: 30,  top: -18, left: -4 },
  md: { word: 130, crown: 44,  top: -27, left: -6 },
  lg: { word: 180, crown: 60,  top: -36, left: -8 },
  xl: { word: 240, crown: 80,  top: -48, left: -10 },
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
      dir="ltr"
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        lineHeight: 1,
        cursor: 'pointer',
        position: 'relative',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span
        style={{
          position: 'relative',
          display: 'block',
          width: `${s.word}px`,
          lineHeight: 0,
        }}
      >
        {variant !== 'mark' && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src="/eah-word.webp"
            alt="EAH"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              filter:
                'drop-shadow(0 0 14px rgba(168,85,247,0.6)) drop-shadow(0 0 28px rgba(168,85,247,0.3))',
            }}
          />
        )}
        <span
          style={{
            position: 'absolute',
            top: `${s.top}px`,
            left: `${s.left}px`,
            width: `${s.crown}px`,
            height: `${s.crown}px`,
            zIndex: 3,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            transformOrigin: '50% 100%',
            transform: 'rotate(-24deg)',
            filter:
              'drop-shadow(0 3px 10px rgba(251,191,36,0.9)) drop-shadow(0 0 22px rgba(232,199,154,0.6))',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/eah-crown.webp"
            alt=""
            aria-hidden
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </span>
      </span>
      {showTagline && variant === 'full' && (
        <span
          dir="rtl"
          style={{
            fontFamily: 'var(--font-cairo, system-ui)',
            fontWeight: 800,
            color: '#E8C79A',
            marginTop: size === 'xl' ? 10 : size === 'lg' ? 8 : size === 'md' ? 6 : 4,
            fontSize:
              size === 'xl' ? '1rem' :
              size === 'lg' ? '0.88rem' :
              size === 'md' ? '0.72rem' : '0.6rem',
            letterSpacing: '0.02em',
            textShadow: '0 0 12px rgba(232,199,154,0.55)',
          }}
        >
          اللي نفسك فيه ؟
        </span>
      )}
    </span>
  )

  if (href) {
    return (
      <Link
        href={href}
        aria-label="EAH"
        style={{ textDecoration: 'none', display: 'inline-flex' }}
      >
        {content}
      </Link>
    )
  }
  return content
}
