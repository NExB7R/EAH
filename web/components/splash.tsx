'use client'

import { useLayoutEffect, useRef } from 'react'
import styles from './splash.module.css'

const KEY = 'eah-splash-v1'

export default function Splash() {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    let shown = false
    try {
      shown = !!sessionStorage.getItem(KEY)
    } catch {
      /* ignore */
    }

    if (shown) {
      el.style.display = 'none'
      return
    }

    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      /* ignore */
    }

    const t = setTimeout(() => {
      if (el) el.style.display = 'none'
    }, 1400)
    return () => clearTimeout(t)
  }, [])

  return (
    <div ref={ref} className={styles.splash} aria-hidden>
      <div className={styles.glow} />
      <div className={styles.crownWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/eah-crown.webp" alt="" width={180} height={97} className={styles.crown} />
      </div>
      <div className={styles.wordWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/eah-word.webp" alt="" width={200} height={85} className={styles.word} />
      </div>
      <p className={styles.slogan}>اللى نفسك فيه ؟</p>
    </div>
  )
}
