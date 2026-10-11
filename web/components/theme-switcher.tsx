'use client'

import { useTheme } from '@/lib/contexts/theme-context'
import { SunIcon, MoonIcon } from './icons'
import styles from './theme-switcher.module.css'

export default function ThemeSwitcher() {
  const { resolved, setTheme } = useTheme()

  const toggle = () => {
    setTheme(resolved === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      type="button"
      className={styles.btn}
      onClick={toggle}
      aria-label={resolved === 'dark' ? 'الوضع الفاتح' : 'الوضع الغامق'}
      data-tooltip={resolved === 'dark' ? 'الوضع الفاتح' : 'الوضع الغامق'}
    >
      {resolved === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
    </button>
  )
}
