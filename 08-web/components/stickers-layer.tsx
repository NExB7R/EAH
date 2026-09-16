'use client'
import { useEffect, useState } from 'react'
import './stickers-layer.css'

type Sticker = {
  kind: string
  top: string
  left?: string
  right?: string
  size: number
  rot: number
  opacity?: number
  delay?: number
}

const ICONS = {
  crown: <><path d="M3 18 L2 7 L8 11 L12 3 L16 11 L22 7 L21 18 Z" /><rect x="4" y="18" width="16" height="3" rx="1" /></>,
  fork: <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />,
  pill: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M12 8v8M8 12h8" /></>,
  cart: <><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.5 12.5a2 2 0 0 0 2 1.5h8.5a2 2 0 0 0 2-1.6L22 7H6" /></>,
  moped: <><circle cx="5" cy="18" r="2" /><circle cx="17" cy="18" r="2" /><path d="M5 18h10M15 18h2M14 6h4l2 6h-2M4 6h4v4" /></>,
  star: <path d="M12 2l3 6.5 7 1-5 4.8 1.2 7L12 18l-6.2 3.3L7 14.3 2 9.5l7-1z" />,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />,
  coffee: <><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" /><path d="M6 1v3M10 1v3M14 1v3" /></>,
  bubble: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
  pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
  phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
  clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  check: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4 12 14.01l-3-3" /></>,
  fire: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
  sparkle: <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z" />,
  gift: <><rect x="3" y="8" width="18" height="4" /><path d="M12 8v13M5 12v9h14v-9" /><path d="M12 8a3 3 0 1 1 3-3v3M12 8a3 3 0 1 0-3-3v3" /></>,
  bolt: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
  flower: <><circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l2.8 2.8M16.2 16.2 19 19M5 19l2.8-2.8M16.2 7.8 19 5" /></>,
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor((seed * 9301 + 49297) % 233280) / 233280 * arr.length | 0]
}

function rnd(seed: number): number {
  return ((seed * 9301 + 49297) % 233280) / 233280
}

const KINDS = ['crown', 'fork', 'pill', 'cart', 'moped', 'star', 'heart', 'coffee', 'bubble', 'pin', 'phone', 'clock', 'check', 'fire', 'sparkle', 'gift', 'bolt', 'flower']

function buildStickers(seed: number, count: number, positions: 'edges' | 'all'): Sticker[] {
  const out: Sticker[] = []
  for (let i = 0; i < count; i++) {
    const s = seed + i * 7
    const kind = KINDS[Math.floor(rnd(s) * KINDS.length)]
    const size = 24 + Math.floor(rnd(s + 1) * 44)
    const rot = -28 + rnd(s + 2) * 56
    const side = rnd(s + 3)
    const topPos = 4 + rnd(s + 4) * 92

    let top = `${topPos}%`
    let left: string | undefined
    let right: string | undefined

    if (positions === 'edges') {
      // Only on left/right edges
      if (side < 0.5) left = `${2 + rnd(s + 5) * 12}%`
      else right = `${2 + rnd(s + 5) * 12}%`
    } else {
      // Anywhere
      left = `${2 + rnd(s + 5) * 94}%`
    }

    out.push({
      kind,
      top,
      left,
      right,
      size,
      rot,
      opacity: 0.06 + rnd(s + 6) * 0.1,
      delay: rnd(s + 7) * 4,
    })
  }
  return out
}

export default function StickersLayer() {
  const [stickers, setStickers] = useState<Sticker[]>([])

  useEffect(() => {
    // Random on mount (client only)
    const count = window.innerWidth < 768 ? 14 : 22
    setStickers(buildStickers(Date.now() % 9973, count, 'all'))
  }, [])

  if (stickers.length === 0) return null

  return (
    <div className="stick-layer" aria-hidden>
      {stickers.map((s, i) => (
        <span
          key={i}
          className="stick-layer__item"
          style={{
            top: s.top,
            left: s.left,
            right: s.right,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            ['--r' as string]: `${s.rot}deg`,
            animationDelay: `${s.delay}s`,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {ICONS[s.kind as keyof typeof ICONS]}
          </svg>
        </span>
      ))}
    </div>
  )
}
