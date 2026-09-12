'use client'

import './scroll-icons-background.css'

// أيقونات SVG حقيقية (من Lucide + إضافات)
const ICONS = {
  restaurant: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  ),
  pharmacy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),
  supermarket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h2l2.4 12.6a2 2 0 0 0 2 1.4h9.2a2 2 0 0 0 2-1.4L21 7H5" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
    </svg>
  ),
  delivery: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
      <path d="M15 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
      <path d="M5 18H3V6h11v12" />
      <path d="M14 8h4l3 3v7h-2" />
    </svg>
  ),
  offer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  location: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  tag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
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
  { kind: 'restaurant',  top: 8,  left: 12, size: 44, rotation: -12, delay: 0.0 },
  { kind: 'pharmacy',    top: 22, left: 78, size: 38, rotation: 18,  delay: 0.4 },
  { kind: 'star',        top: 45, left: 5,  size: 30, rotation: -22, delay: 0.8 },
  { kind: 'offer',       top: 62, left: 88, size: 46, rotation: 10,  delay: 1.2 },
  { kind: 'location',    top: 78, left: 30, size: 36, rotation: -8,  delay: 1.6 },
  { kind: 'heart',       top: 90, left: 65, size: 32, rotation: 15,  delay: 0.6 },
  { kind: 'tag',         top: 15, left: 55, size: 40, rotation: -18, delay: 1.4 },
  { kind: 'clock',       top: 55, left: 42, size: 28, rotation: 6,   delay: 0.2 },

  // Layer 1 — متوسط
  { kind: 'delivery',    top: 12, left: 35, size: 52, rotation: -6,  delay: 0.3 },
  { kind: 'supermarket', top: 30, left: 8,  size: 48, rotation: 22,  delay: 0.9 },
  { kind: 'restaurant',  top: 48, left: 70, size: 42, rotation: -14, delay: 1.5 },
  { kind: 'pharmacy',    top: 68, left: 15, size: 40, rotation: 8,   delay: 0.1 },
  { kind: 'star',        top: 82, left: 82, size: 34, rotation: -20, delay: 1.1 },
  { kind: 'offer',       top: 5,  left: 92, size: 44, rotation: 12,  delay: 1.7 },
  { kind: 'location',    top: 40, left: 92, size: 30, rotation: -4,  delay: 0.7 },
  { kind: 'heart',       top: 72, left: 50, size: 38, rotation: 16,  delay: 1.3 },

  // Layer 2 — سريع
  { kind: 'supermarket', top: 18, left: 68, size: 56, rotation: -10, delay: 0.5 },
  { kind: 'delivery',    top: 38, left: 25, size: 50, rotation: 20,  delay: 1.0 },
  { kind: 'tag',         top: 58, left: 8,  size: 42, rotation: -16, delay: 1.5 },
  { kind: 'clock',       top: 75, left: 72, size: 36, rotation: 4,   delay: 0.2 },
  { kind: 'restaurant',  top: 92, left: 45, size: 46, rotation: -24, delay: 0.9 },
  { kind: 'pharmacy',    top: 3,  left: 22, size: 32, rotation: 14,  delay: 1.6 },
  { kind: 'star',        top: 88, left: 8,  size: 28, rotation: -8,  delay: 0.4 },
  { kind: 'offer',       top: 52, left: 95, size: 38, rotation: 18,  delay: 1.2 },
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
