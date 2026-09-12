'use client'
import './neon-icon-button.css'

type NeonIconButtonProps = {
  icon: string
  label: string
  href?: string
  variant?: 'default' | 'accent'
}

export default function NeonIconButton({ icon, label, href, variant = 'default' }: NeonIconButtonProps) {
  const cls = `neon-icon-btn neon-icon-btn--${variant}`
  if (href) {
    return (
      <a href={href} className={cls} aria-label={label}>
        <span className="neon-icon-btn__icon">{icon}</span>
        <span className="neon-icon-btn__label">{label}</span>
      </a>
    )
  }
  return (
    <button className={cls} aria-label={label}>
      <span className="neon-icon-btn__icon">{icon}</span>
      <span className="neon-icon-btn__label">{label}</span>
    </button>
  )
}
