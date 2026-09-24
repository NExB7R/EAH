'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import styles from './splash.module.css'

const SESSION_KEY = 'eah-splash-shown'

export default function Splash() {
  const [hidden, setHidden] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    // لو ظهر قبل كده في نفس الـ session — متظهرش تاني
    if (sessionStorage.getItem(SESSION_KEY)) {
      return
    }
    // لو المستخدم مش عايز animations
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      sessionStorage.setItem(SESSION_KEY, '1')
      return
    }

    setHidden(false)
    sessionStorage.setItem(SESSION_KEY, '1')

    const fadeTimer = setTimeout(() => setFading(true), 1100)
    const hideTimer = setTimeout(() => setHidden(true), 1500)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (hidden) return null

  return (
    <div
      className={`${styles.splash} ${fading ? styles.fading : ''}`}
      aria-hidden
    >
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

      <div className={styles.slogan}>
        اللي نفسك فيه ؟
      </div>
    </div>
  )
}
