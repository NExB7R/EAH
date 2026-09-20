'use client'
import { useEffect, useState } from 'react'
import EahLogo from './eah-logo'
import {
  IcRestaurant, IcPharmacy, IcMarket, IcDelivery,
  IcStar, IcHeart, IcCompass, IcSparkle,
  IcOffer, IcChat, IcGift, IcPin,
} from './eah-icons'
import './splash-screen.css'

// ═══ أيقونات "كل حاجة حواليك" — حول اللوجو ═══
const FLOATING = [
  { Icon: IcRestaurant, x: '12%',  y: '18%', size: 34, delay: 0.0, dur: 5.0 },
  { Icon: IcPharmacy,   x: '84%',  y: '14%', size: 30, delay: 0.6, dur: 5.8 },
  { Icon: IcMarket,     x: '8%',   y: '72%', size: 32, delay: 1.1, dur: 6.2 },
  { Icon: IcDelivery,   x: '88%',  y: '78%', size: 36, delay: 0.3, dur: 5.5 },
  { Icon: IcStar,       x: '22%',  y: '42%', size: 24, delay: 0.9, dur: 6.5 },
  { Icon: IcHeart,      x: '76%',  y: '44%', size: 26, delay: 1.4, dur: 5.2 },
  { Icon: IcCompass,    x: '16%',  y: '88%', size: 28, delay: 0.4, dur: 6.8 },
  { Icon: IcSparkle,    x: '82%',  y: '62%', size: 22, delay: 1.7, dur: 5.6 },
  { Icon: IcOffer,      x: '30%',  y: '10%', size: 26, delay: 1.0, dur: 6.0 },
  { Icon: IcChat,       x: '70%',  y: '90%', size: 24, delay: 0.7, dur: 5.4 },
  { Icon: IcGift,       x: '10%',  y: '55%', size: 22, delay: 1.5, dur: 6.3 },
  { Icon: IcPin,        x: '90%',  y: '38%', size: 24, delay: 0.2, dur: 5.9 },
]

export default function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [hiding, setHiding] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setHiding(true), 1700)
    const t2 = setTimeout(() => setVisible(false), 2200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  if (!visible) return null

  return (
    <div className={`spl ${hiding ? 'is-hiding' : ''}`} aria-hidden>
      {/* خلفية المنصة */}
      <div className="spl__bg" />

      {/* أيقونات "كل حاجة حواليك" */}
      <div className="spl__orbit">
        {FLOATING.map((item, i) => {
          const Icon = item.Icon
          return (
            <span
              key={i}
              className="spl__orbit-icon"
              style={{
                left: item.x,
                top: item.y,
                width: item.size,
                height: item.size,
                animationDelay: `${item.delay}s`,
                animationDuration: `${item.dur}s`,
              }}
            >
              <Icon />
            </span>
          )
        })}
      </div>

      {/* اللوجو الرسمي */}
      <div className="spl__center">
        <div className="spl__logo">
          <EahLogo size="xl" variant="full" />
        </div>
        <p className="spl__tagline">اللي نفسك فيه ؟</p>
      </div>

      {/* شريط التحميل */}
      <div className="spl__bar">
        <span className="spl__bar-fill" />
      </div>
    </div>
  )
}
