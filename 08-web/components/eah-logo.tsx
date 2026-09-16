'use client'
import Link from 'next/link'
import './eah-logo.css'

type Props = {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'full' | 'compact' | 'mark'
  href?: string
  showTagline?: boolean
}

export default function EahLogo({
  size = 'md',
  variant = 'full',
  href,
  showTagline = true,
}: Props) {
  const content = (
    <span className={`eah-logo eah-logo--${size} eah-logo--${variant}`}>
      {variant !== 'mark' && (
        <span className="eah-logo__word">
          <span className="eah-logo__letter">E</span>
          <span className="eah-logo__letter">A</span>
          <span className="eah-logo__letter">H</span>
        </span>
      )}
      {variant === 'mark' && (
        <span className="eah-logo__mark">EAH</span>
      )}
      {showTagline && variant === 'full' && (
        <span className="eah-logo__tagline">اللي نفسك فيه ؟</span>
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
