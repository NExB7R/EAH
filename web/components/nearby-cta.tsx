'use client'

import { useState } from 'react'
import { NavigationIcon, MapPinIcon, CheckCircleIcon } from './icons'
import styles from './nearby-cta.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Nearby CTA (Location)
//   • بيطلب الموقع تلقائياً
//   • لو رفض → يظهر زرار "حدد موقعي"
// ═══════════════════════════════════════════════════════════

type State = 'idle' | 'loading' | 'granted' | 'denied'

export default function NearbyCta() {
  const [state, setState] = useState<State>('idle')

  const askLocation = () => {
    if (!('geolocation' in navigator)) {
      setState('denied')
      return
    }
    setState('loading')
    navigator.geolocation.getCurrentPosition(
      () => setState('granted'),
      () => setState('denied'),
      { timeout: 8000, maximumAge: 60000 },
    )
  }

  if (state === 'granted') {
    return (
      <div className={`${styles.wrap} ${styles.ok}`}>
        <span className={styles.icon} aria-hidden>
          <CheckCircleIcon size={20} />
        </span>
        <span className={styles.text}>تمام! هنعرض الأنشطة القريبة منك</span>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.left}>
        <span className={styles.icon} aria-hidden>
          <NavigationIcon size={22} />
        </span>
        <div className={styles.textWrap}>
          <span className={styles.title}>قريب منك</span>
          <span className={styles.sub}>
            <MapPinIcon size={12} />
            <span>فعّل الموقع لعرض الأنشطة القريبة</span>
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={askLocation}
        disabled={state === 'loading'}
        className={styles.btn}
      >
        {state === 'loading' ? 'بندور عليك…' : state === 'denied' ? 'جرّب تاني' : 'حدد موقعي'}
      </button>
    </div>
  )
}
