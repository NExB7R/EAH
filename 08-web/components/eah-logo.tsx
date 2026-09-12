'use client'

import './eah-logo.css'

type Size = 'sm' | 'md' | 'lg' | 'xl'
type Variant = 'full' | 'mark' | 'crown'

type EahLogoProps = {
  size?: Size
  variant?: Variant
  className?: string
  href?: string
}

export default function EahLogo({
  size = 'md',
  variant = 'full',
  className = '',
  href,
}: EahLogoProps) {
  const inner = (
    <>
      {variant !== 'crown' && <span className="eah-logo__glow" aria-hidden />}

      {variant !== 'crown' && (
        <img
          className="eah-logo__word"
          src="/eah-word.webp"
          alt="EAH"
          width={1440}
          height={720}
          decoding="async"
        />
      )}

      <img
        className="eah-logo__crown"
        src="/eah-crown.webp"
        alt=""
        aria-hidden
        width={1440}
        height={720}
        decoding="async"
      />

      {variant === 'full' && (
        <span className="eah-logo__slogan" aria-hidden>
          <span>اللى نفسك فيه</span>
          <span className="eah-logo__punct">؟</span>
        </span>
      )}
    </>
  )

  const cls = `eah-logo eah-logo--${size} eah-logo--${variant} ${className}`.trim()

  if (href) {
    return (
      <a href={href} className={cls} aria-label="EAH — اللى نفسك فيه ؟">
        {inner}
      </a>
    )
  }
  return (
    <span className={cls} aria-label="EAH — اللى نفسك فيه ؟">
      {inner}
    </span>
  )
}
