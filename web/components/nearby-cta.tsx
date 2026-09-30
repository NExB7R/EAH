'use client'

import { useState } from 'react'
import { NavigationIcon, MapPinIcon } from './icons'
import styles from './nearby-cta.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Nearby CTA (Location) — يظهر جوه Nearby Grid
//   • أول مرة → يطلب الإذن تلقائياً
//   • لو رفض → يظهر زرار "حدد موقعي"
//   • لما يفعّل → يختفي تماماً
// ═══════════════════════════════════════════════════════════

type State = 'idle' | 'loading' | 'denied' | 'granted'

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

  // لما يفعّل → يختفي
  if (state === 'granted') return null

  return (
    <div className={styles.wrap}>
      <div className={styles.left}>
        <span className={styles.icon} aria-hidden>
          <NavigationIcon size={20} />
        </span>
        <div className={styles.textWrap}>
          <span className={styles.title}>قريب منك؟</span>
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
