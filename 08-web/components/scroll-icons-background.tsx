'use client'

import './scroll-icons-background.css'

// أيقونات SVG بسيطة (بدون صور خارجية)
const ICONS = {
  restaurant: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 2v20M8 2v20M12 2v20M16 2v20M20 2v20" />
      <path d="M2 6h20M2 12h20M2 18h20" />
    </svg>
  ),
  pharmacy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8M8 10h8M8 14h8M8 18h8" />
    </svg>
  ),
  supermarket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 3h18l-2 13H5L3 3z" />
      <path d="M8 21h.01M16 21h.01" />
      <path d="M5 16h14" />
    </svg>
  ),
  delivery: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  offer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6" />
      <path d="M12 2v10M12 2l-3 3M12 2l3 3" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  location: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  tag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <circle cx="7" cy="7" r="1.5" />
    </svg>
  ),
}

// توزيع عشوائي للأيقونات
const ICONS_ARRAY = Object.values(ICONS)

type IconPos = {
  id: number
  icon: React.ReactNode
  layer: number
  top: string
  left: string
  size: number
  rotation: number
  delay: number
}

function generateIcons(count: number): IconPos[] {
  return Array.from({ length: count }).map((_, i) => {
    const layer = Math.floor(Math.random() * 3) // 3 طبقات
    return {
      id: i,
      icon: ICONS_ARRAY[i % ICONS_ARRAY.length],
      layer,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: 20 + Math.random() * 40, // 20-60px
      rotation: -30 + Math.random() * 60, // -30 to 30 degrees
      delay: Math.random() * 2,
    }
  })
}

const ICONS_CONFIG = generateIcons(24) // 24 أيقونة

export default function ScrollIconsBackground() {
  return (
    <div className="scroll-icons-bg" aria-hidden>
      {/* طبقة ضبابية بنفسجية خفيفة جدًا */}
      <div className="scroll-icons-bg__ambient" />
      
      {/* الأيقونات موزعة على 3 طبقات */}
      {[0, 1, 2].map((layer) => (
        <div key={layer} className={`scroll-icons-bg__layer scroll-icons-bg__layer--${layer}`}>
          {ICONS_CONFIG.filter((icon) => icon.layer === layer).map((icon) => (
            <div
              key={icon.id}
              className="scroll-icons-bg__icon"
              style={{
                top: icon.top,
                left: icon.left,
                width: icon.size,
                height: icon.size,
                transform: `rotate(${icon.rotation}deg)`,
                animationDelay: `${icon.delay}s`,
              }}
            >
              {icon.icon}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
