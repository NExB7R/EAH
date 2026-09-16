'use client'
import './analytics-chart.css'

type Point = { label: string; value: number }

export default function AnalyticsChart({
  points,
  title,
  color = '#A855F7',
  unit = '',
}: {
  points: Point[]
  title: string
  color?: string
  unit?: string
}) {
  if (points.length === 0) {
    return (
      <div className="achart achart--empty">
        <h3 className="achart__title">{title}</h3>
        <p className="achart__empty">لسه مفيش بيانات</p>
      </div>
    )
  }

  const max = Math.max(...points.map((p) => p.value), 1)
  const w = 600
  const h = 160
  const pad = 20
  const innerW = w - pad * 2
  const innerH = h - pad * 2
  const step = points.length > 1 ? innerW / (points.length - 1) : 0

  const coords = points.map((p, i) => {
    const x = pad + i * step
    const y = pad + innerH - (p.value / max) * innerH
    return [x, y] as const
  })

  const path = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')
  const areaPath = path + ` L ${coords[coords.length - 1][0]} ${pad + innerH} L ${coords[0][0]} ${pad + innerH} Z`
  const gradId = `grad-${title.replace(/[^a-z]/gi, '') || 'x'}`

  const total = points.reduce((s, p) => s + p.value, 0)

  return (
    <div className="achart">
      <header className="achart__head">
        <h3 className="achart__title">{title}</h3>
        <span className="achart__total">
          {total.toLocaleString('ar-EG')} {unit}
        </span>
      </header>
      <svg viewBox={`0 0 ${w} ${h}`} className="achart__svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {coords.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill={color} />
        ))}
      </svg>
      <div className="achart__labels">
        {points.map((p, i) => (
          <span key={i} className="achart__label">{p.label}</span>
        ))}
      </div>
    </div>
  )
}
