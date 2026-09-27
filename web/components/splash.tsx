'use client'

import { useLayoutEffect, useState } from 'react'
import Image from 'next/image'
import styles from './splash.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Splash (ظاهر من أول paint + يخفي نفسه قبل paint تاني)
// ═══════════════════════════════════════════════════════════

const SESSION_KEY = 'eah-splash-shown'

export default function Splash() {
  // يبدأ ظاهر — مش هيبان "بعد" الصفحة
  const [hidden, setHidden] = useState(false)
  const [fading, setFading] = useState(false)

  // useLayoutEffect = قبل paint → لو شفناه قبل كده، نخفيه فوراً
  useLayoutEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      setHidden(true)
      return
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    sessionStorage.setItem(SESSION_KEY, '1')

    if (reduced) {
      setHidden(true)
      return
    }

    const fadeTimer = setTimeout(() => setFading(true), 1100)
    const hideTimer = setTimeout(() => setHidden(true), 1500)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (hidden) return null

  return (
    <div className={`${styles.splash} ${fading ? styles.fading : ''}`} aria-hidden>
      <div className={styles.glow} />
      <div className={styles.crownWrap}>
        <Image
          src="/eah-crown.webp"
          alt=""
          width={489}
          height={264}
          priority
          className={styles.crown}
        />
      </div>
      <div className={styles.wordWrap}>
        <Image
          src="/eah-word.webp"
          alt=""
          width={546}
          height={231}
          priority
          className={styles.word}
        />
      </div>
      <div className={styles.slogan}>اللي نفسك فيه ؟</div>
    </div>
  )
}
