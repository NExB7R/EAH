'use client'

import './eah-logo.css'

type Variant = 'full' | 'compact' | 'mark' | 'crown'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

type EahLogoProps = {
  variant?: Variant
  size?: Size
  className?: string
  active?: boolean
  href?: string
}

export default function EahLogo({
  variant = 'full',
  size = 'md',
  className = '',
  active = false,
  href,
}: EahLogoProps) {
  const showWord = variant !== 'crown'
  const showCrown = variant !== 'mark'
  const showSlogan = variant === 'full'
  const showCity = variant === 'compact' || variant === 'full'

  const inner = (
    <>
      {showWord && <span className="eah-logo__glow" aria-hidden />}

      {showWord && (
        <img
          className="eah-logo__word"
          src="/eah-word.webp"
          alt="EAH"
          width={1440}
          height={720}
          decoding="async"
        />
      )}

      {showCrown && (
        <img
          className="eah-logo__crown"
          src="/eah-crown.webp"
          alt=""
          aria-hidden
          width={1440}
          height={720}
          decoding="async"
        />
      )}

      {showSlogan && (
        <span className="eah-logo__slogan" aria-hidden>
          <span>اللى نفسك فيه</span>
          <span className="eah-logo__punct">؟</span>
        </span>
      )}

      {showCity && variant === 'compact' && (
        <span className="eah-logo__city-compact">شبين القناطر تتحدث...</span>
      )}
    </>
  )

  const cls = `eah-logo eah-logo--${size} eah-logo--${variant} ${active ? 'crown-active' : ''} ${className}`.trim()

  if (href) {
    return <a href={href} className={cls} aria-label="EAH">{inner}</a>
  }
  return <span className={cls} aria-label="EAH">{inner}</span>
}
