'use client'

import './eah-logo.css'

type Variant = 'full' | 'mark' | 'crown'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

type EahLogoProps = {
  variant?: Variant
  size?: Size
  className?: string
  animated?: boolean
  href?: string
  active?: boolean
}

export default function EahLogo({
  variant = 'full',
  size = 'md',
  className = '',
  animated = true,
  href,
  active = false,
}: EahLogoProps) {
  const showWord = variant !== 'crown'
  const showCrown = variant !== 'mark' || true
  const showSlogan = variant === 'full'

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
    </>
  )

  const cls = `eah-logo eah-logo--${size} eah-logo--${variant} ${active ? 'crown-active' : ''} ${className}`.trim()

  if (href) {
    return <a href={href} className={cls} aria-label="EAH — اللى نفسك فيه ؟">{inner}</a>
  }
  return <span className={cls} aria-label="EAH — اللى نفسك فيه ؟">{inner}</span>
}
