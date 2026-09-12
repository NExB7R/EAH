'use client'

import './eah-logo.css'

type Variant = 'full' | 'tagline' | 'mark' | 'crown'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

type EahLogoProps = {
  variant?: Variant
  size?: Size
  className?: string
  animated?: boolean
  href?: string
}

export default function EahLogo({
  variant = 'full',
  size = 'md',
  className = '',
  animated = true,
  href,
}: EahLogoProps) {
  const showWord = variant !== 'crown'
  const showCrown = variant !== 'word' as any
  const showTagline = variant === 'full' || variant === 'tagline'

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

      {showTagline && (
        <span className="eah-logo__slogan">
          <span>اللى نفسك فيه</span>
          <span className="eah-logo__punct">؟</span>
        </span>
      )}
    </>
  )

  const cls = `eah-logo eah-logo--${size} eah-logo--${variant} ${className}`.trim()

  if (href) {
    return <a href={href} className={cls} aria-label="EAH — اللى نفسك فيه ؟">{inner}</a>
  }
  return <span className={cls} aria-label="EAH — اللى نفسك فيه ؟">{inner}</span>
}
