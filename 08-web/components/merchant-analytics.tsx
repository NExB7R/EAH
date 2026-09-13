'use client'
import { useMemo } from 'react'
import './merchant-analytics.css'

type Point = { label: string; value: number }

export function MiniLine({ data, color = '#A855F7', label }: { data: Point[]; color?: string; label: string }) {
  const max = Math.max(...data.map(d => d.value), 1)
  const w = 280, h = 80, pad = { t: 10, r: 10, b: 20, l: 10 }
  const innerW = w - pad.l - pad.r
  const innerH = h - pad.t - pad.b
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0

  const points = data.map((d, i) => ({
    x: pad.l + i * stepX,
    y: pad.t + innerH - (d.value / max) * innerH,
    ...d,
  }))

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const area = `${path} L ${points[points.length - 1]?.x ?? 0} ${pad.t + innerH} L ${pad.l} ${pad.t + innerH} Z`
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="ma-card">
      <div className="ma-card__head">
        <span className="ma-card__label">{label}</span>
        <span className="ma-card__total" style={{ color }}>{total}</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="ma-chart">
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#grad-${label})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} />
        ))}
      </svg>
      <div className="ma-card__labels">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  )
}

export function RatingBars({ taste, value, speed, exp }: { taste: number; value: number; speed: number; exp: number }) {
  const bars = [
    { label: '😋 الطعم', value: taste, color: '#F97316' },
    { label: '💰 القيمة', value: value, color: '#4ADE80' },
    { label: '⚡ السرعة', value: speed, color: '#FBBF24' },
    { label: '✨ التجربة', value: exp, color: '#A855F7' },
  ]
  return (
    <div className="ma-bars">
      {bars.map(b => (
        <div key={b.label} className="ma-bar">
          <span className="ma-bar__label">{b.label}</span>
          <div className="ma-bar__track">
            <div className="ma-bar__fill" style={{ width: `${(b.value / 5) * 100}%`, background: b.color }} />
          </div>
          <span className="ma-bar__val">{b.value.toFixed(1)}</span>
        </div>
      ))}
    </div>
  )
}

export function StatBox({ emoji, value, label, color }: { emoji: string; value: number | string; label: string; color: string }) {
  return (
    <div className="ma-stat" style={{ borderColor: `${color}44` }}>
      <span className="ma-stat__emoji">{emoji}</span>
      <span className="ma-stat__val" style={{ color }}>{value}</span>
      <span className="ma-stat__label">{label}</span>
    </div>
  )
}

export default function MerchantAnalytics({ businessId }: { businessId: string }) {
  // Placeholder — يمكن ربطه بـ API لاحقًا
  const data14d = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(Date.now() - (13 - i) * 86400000)
      return { label: d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }), value: 0 }
    })
  }, [])

  return (
    <div className="ma">
      <div className="ma-stats">
        <StatBox emoji="👁️" value={0} label="مشاهدات" color="#A855F7" />
        <StatBox emoji="📞" value={0} label="كشف رقم" color="#4ADE80" />
        <StatBox emoji="⭐" value={0} label="تقييمات" color="#FBBF24" />
        <StatBox emoji="❤️" value={0} label="مفضلات" color="#EC4899" />
      </div>

      <MiniLine data={data14d} label="المشاهدات (14 يوم)" color="#A855F7" />
      <MiniLine data={data14d} label="كشف الأرقام (14 يوم)" color="#4ADE80" />

      <RatingBars taste={0} value={0} speed={0} exp={0} />
    </div>
  )
}
