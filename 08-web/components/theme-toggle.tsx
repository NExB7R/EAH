'use client'
import { useEffect, useState } from 'react'
import { IconSun, IconMoon } from './neon-icons'
import './neon-icon-button.css'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = (localStorage.getItem('eah-theme') as 'dark' | 'light') || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('eah-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const icon = mounted && theme === 'light' ? <IconMoon /> : <IconSun />
  const label = mounted && theme === 'light' ? 'وضع ليلي' : 'وضع نهاري'

  return (
    <button
      type="button"
      className="neon-icon-btn"
      aria-label="تبديل المظهر"
      onClick={toggle}
    >
      <span className="neon-icon-btn__icon" aria-hidden>{icon}</span>
      <span className="neon-icon-btn__label">{label}</span>
    </button>
  )
}
