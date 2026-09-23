'use client'
// v16 — SVG 2026 (IBM Plex + Tajawal + neon + gold)
import Link from 'next/link'

type Props = {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'full' | 'compact' | 'mark'
  href?: string
  showTagline?: boolean
}

const SIZE_MAP = {
  sm: { w: 72,  h: 32 },
  md: { w: 110, h: 48 },
  lg: { w: 155, h: 68 },
  xl: { w: 220, h: 96 },
}

export default function EahLogo({
  size = 'md',
  variant = 'full',
  href,
  showTagline = false,
}: Props) {
  const s = SIZE_MAP[size]

  const content = (
    <span
      dir="ltr"
      data-eah-logo="v16"
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
      {variant !== 'mark' ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src="/eah-logo-2026.svg"
          alt="EAH"
          width={s.w}
          height={s.h}
          style={{
            display: 'block',
            width: `${s.w}px`,
            height: 'auto',
            filter:
              'drop-shadow(0 0 8px rgba(168, 85, 247, 0.35)) drop-shadow(0 0 24px rgba(168, 85, 247, 0.15))',
          }}
        />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src="/eah-crown.webp"
          alt="EAH"
          width={s.w}
          height={s.w}
          style={{
            display: 'block',
            width: `${s.w}px`,
            height: `${s.w}px`,
            objectFit: 'contain',
            filter:
              'drop-shadow(0 0 8px rgba(232, 199, 154, 0.5)) drop-shadow(0 0 24px rgba(232, 199, 154, 0.2))',
          }}
        />
      )}
      {showTagline && variant === 'full' && (
        <span
          dir="rtl"
          style={{
            fontFamily: "'Tajawal', 'IBM Plex Sans Arabic', system-ui",
            fontWeight: 900,
            color: '#E8C79A',
            marginTop: size === 'xl' ? 10 : size === 'lg' ? 8 : size === 'md' ? 6 : 4,
            fontSize:
              size === 'xl' ? '1rem' :
              size === 'lg' ? '0.88rem' :
              size === 'md' ? '0.72rem' : '0.6rem',
            letterSpacing: '0.02em',
            textShadow: '0 0 12px rgba(232, 199, 154, 0.55)',
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
