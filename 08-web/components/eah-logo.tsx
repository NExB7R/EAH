'use client'
// v14 — static crown with slow pulse
import Link from 'next/link'
import { useState } from 'react'

type Props = {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'full' | 'compact' | 'mark'
  href?: string
  showTagline?: boolean
}

const SIZE_MAP = {
  sm: { word: 88,  crown: 30, topRatio: -0.38, restLeft: 0 },
  md: { word: 130, crown: 42, topRatio: -0.38, restLeft: 2 },
  lg: { word: 180, crown: 58, topRatio: -0.38, restLeft: 4 },
  xl: { word: 240, crown: 78, topRatio: -0.38, restLeft: 6 },
}

export default function EahLogo({
  size = 'md',
  variant = 'full',
  href,
  showTagline = false,
}: Props) {
  const s = SIZE_MAP[size]
  // crown ثابت

  const crownTop = s.crown * s.topRatio
  const crownLeft = s.restLeft
  const crownRotation = -18

  const content = (
    <span
      dir="ltr"
      data-eah-logo="v15"
      
      
      
      
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
            className="eah-logo__word"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              filter:
                'drop-shadow(0 0 1px rgba(168,85,247,0.9)) drop-shadow(0 0 14px rgba(168,85,247,0.35)) drop-shadow(0 0 48px rgba(168,85,247,0.15))',
            }}
          />
        )}
        <span
          style={{
            position: 'absolute',
            top: `${crownTop}px`,
            left: `${crownLeft}px`,
            width: `${s.crown}px`,
            height: `${s.crown}px`,
            zIndex: 3,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            transformOrigin: '50% 100%',
            transform: `rotate(${crownRotation}deg)`,
            animation: 'crownPulse 3s ease-in-out infinite',
            filter:
              'drop-shadow(0 0 1px rgba(232,199,154,0.95)) drop-shadow(0 4px 12px rgba(232,199,154,0.4)) drop-shadow(0 0 36px rgba(232,199,154,0.2))',
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
