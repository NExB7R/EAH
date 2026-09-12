'use client'

import './scroll-icons-background.css'

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

type IconKind = keyof typeof ICONS

// إحداثيات ثابتة (نفسها على السيرفر والمتصفح)
const ICONS_LAYOUT: Array<{
  kind: IconKind
  top: number
  left: number
  size: number
  rotation: number
  delay: number
}> = [
  // Layer 0 — بطيء
  { kind: 'restaurant',  top: 8,  left: 12, size: 42, rotation: -12, delay: 0.0 },
  { kind: 'pharmacy',    top: 22, left: 78, size: 36, rotation: 18,  delay: 0.4 },
  { kind: 'star',        top: 45, left: 5,  size: 28, rotation: -22, delay: 0.8 },
  { kind: 'offer',       top: 62, left: 88, size: 44, rotation: 10,  delay: 1.2 },
  { kind: 'location',    top: 78, left: 30, size: 34, rotation: -8,  delay: 1.6 },
  { kind: 'heart',       top: 90, left: 65, size: 30, rotation: 15,  delay: 0.6 },
  { kind: 'tag',         top: 15, left: 55, size: 38, rotation: -18, delay: 1.4 },
  { kind: 'clock',       top: 55, left: 42, size: 26, rotation: 6,   delay: 0.2 },

  // Layer 1 — متوسط
  { kind: 'delivery',    top: 12, left: 35, size: 50, rotation: -6,  delay: 0.3 },
  { kind: 'supermarket', top: 30, left: 8,  size: 46, rotation: 22,  delay: 0.9 },
  { kind: 'restaurant',  top: 48, left: 70, size: 40, rotation: -14, delay: 1.5 },
  { kind: 'pharmacy',    top: 68, left: 15, size: 38, rotation: 8,   delay: 0.1 },
  { kind: 'star',        top: 82, left: 82, size: 32, rotation: -20, delay: 1.1 },
  { kind: 'offer',       top: 5,  left: 92, size: 42, rotation: 12,  delay: 1.7 },
  { kind: 'location',    top: 40, left: 92, size: 28, rotation: -4,  delay: 0.7 },
  { kind: 'heart',       top: 72, left: 50, size: 36, rotation: 16,  delay: 1.3 },

  // Layer 2 — سريع
  { kind: 'supermarket', top: 18, left: 68, size: 54, rotation: -10, delay: 0.5 },
  { kind: 'delivery',    top: 38, left: 25, size: 48, rotation: 20,  delay: 1.0 },
  { kind: 'tag',         top: 58, left: 8,  size: 40, rotation: -16, delay: 1.5 },
  { kind: 'clock',       top: 75, left: 72, size: 34, rotation: 4,   delay: 0.2 },
  { kind: 'restaurant',  top: 92, left: 45, size: 44, rotation: -24, delay: 0.9 },
  { kind: 'pharmacy',    top: 3,  left: 22, size: 30, rotation: 14,  delay: 1.6 },
  { kind: 'star',        top: 88, left: 8,  size: 26, rotation: -8,  delay: 0.4 },
  { kind: 'offer',       top: 52, left: 95, size: 36, rotation: 18,  delay: 1.2 },
]

export default function ScrollIconsBackground() {
  return (
    <div className="scroll-icons-bg" aria-hidden>
      <div className="scroll-icons-bg__ambient" />

      {[0, 1, 2].map((layer) => (
        <div
          key={layer}
          className={`scroll-icons-bg__layer scroll-icons-bg__layer--${layer}`}
        >
          {ICONS_LAYOUT.filter((_, i) => i % 3 === layer).map((item, idx) => (
            <div
              key={`${layer}-${idx}`}
              className="scroll-icons-bg__icon"
              style={{
                top: `${item.top}%`,
                left: `${item.left}%`,
                width: item.size,
                height: item.size,
                transform: `rotate(${item.rotation}deg)`,
                animationDelay: `${item.delay}s`,
              }}
            >
              {ICONS[item.kind]}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
