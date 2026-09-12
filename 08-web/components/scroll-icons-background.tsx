'use client'

import './scroll-icons-background.css'

const ICONS = {
  restaurant: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>),
  pharmacy: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M12 8v8M8 12h8" /></svg>),
  supermarket: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h2l2.4 12.6a2 2 0 0 0 2 1.4h9.2a2 2 0 0 0 2-1.4L21 7H5" /><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /></svg>),
  delivery: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" /><path d="M15 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" /><path d="M5 18H3V6h11v12M14 8h4l3 3v7h-2" /></svg>),
  star: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>),
  heart: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>),
}

type IconKind = keyof typeof ICONS

const ICONS_LAYOUT: Array<{ kind: IconKind; top: number; left: number; size: number; rotation: number }> = [
  // يمين (0-12%)
  { kind: 'restaurant',  top: 12, left: 4,  size: 38, rotation: -12 },
  { kind: 'pharmacy',    top: 30, left: 8,  size: 32, rotation: 18 },
  { kind: 'star',        top: 50, left: 2,  size: 26, rotation: -20 },
  { kind: 'heart',       top: 70, left: 6,  size: 28, rotation: 15 },
  { kind: 'supermarket', top: 88, left: 10, size: 34, rotation: 10 },
  { kind: 'delivery',    top: 22, left: 11, size: 30, rotation: -6 },
  { kind: 'heart',       top: 60, left: 9,  size: 24, rotation: 20 },
  // شمال (88-100%)
  { kind: 'delivery',    top: 15, left: 92, size: 40, rotation: -6 },
  { kind: 'supermarket', top: 35, left: 88, size: 34, rotation: 22 },
  { kind: 'restaurant',  top: 55, left: 94, size: 38, rotation: -14 },
  { kind: 'pharmacy',    top: 72, left: 90, size: 32, rotation: 8 },
  { kind: 'star',        top: 88, left: 92, size: 28, rotation: -18 },
  { kind: 'heart',       top: 45, left: 96, size: 26, rotation: 12 },
  { kind: 'star',        top: 25, left: 94, size: 24, rotation: -10 },
]

export default function ScrollIconsBackground() {
  return (
    <div className="scroll-icons-bg" aria-hidden>
      <div className="scroll-icons-bg__ambient" />
      {[0, 1, 2].map((layer) => (
        <div key={layer} className={`scroll-icons-bg__layer scroll-icons-bg__layer--${layer}`}>
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
