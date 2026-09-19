'use client'
import type { ReactNode } from 'react'
import './neon-icon-button.css'

type NeonIconButtonProps = {
  icon: ReactNode
  label: string
  href?: string
  variant?: 'default' | 'accent'
  ariaLabel?: string
  onClick?: () => void
}

export default function NeonIconButton({
  icon,
  label,
  href,
  variant = 'default',
  ariaLabel,
  onClick,
}: NeonIconButtonProps) {
  const cls = `neon-icon-btn neon-icon-btn--${variant}`
  const content = (
    <>
      <span className="neon-icon-btn__icon" aria-hidden>{icon}</span>
      <span className="neon-icon-btn__label">{label}</span>
    </>
  )

  if (href) {
    // كل روابط خارجية تفتح في تاب جديد
    const isExternal = href.startsWith('http://') || href.startsWith('https://')
    if (isExternal) {
      return (
        <a
          href={href}
          className={cls}
          aria-label={ariaLabel || label}
          target="_blank"
          rel="noopener noreferrer"
        >
          {content}
        </a>
      )
    }
    return (
      <a href={href} className={cls} aria-label={ariaLabel || label}>
        {content}
      </a>
    )
  }

  return (
    <button className={cls} aria-label={ariaLabel || label} type="button" onClick={onClick}>
      {content}
    </button>
  )
}
