'use client'
type Bar = { label: string; value: number; color?: string }

export default function BarChart({
  data, height = 180, defaultColor = '#A855F7', label = '',
}: {
  data: Bar[]
  height?: number
  defaultColor?: string
  label?: string
}) {
  if (data.length === 0) return <div className="chart-empty">مفيش بيانات</div>

  const max = Math.max(...data.map(d => d.value), 1)
  const w = 600
  const h = height
  const pad = { t: 20, r: 20, b: 40, l: 40 }
  const innerW = w - pad.l - pad.r
  const innerH = h - pad.t - pad.b
  const gap = 8
  const barW = (innerW - gap * (data.length - 1)) / data.length

  return (
    <div className="chart">
      {label && <span className="chart__label">{label}</span>}
      <svg viewBox={`0 0 ${w} ${h}`} className="chart__svg" preserveAspectRatio="xMidYMid meet">
        {[0, 0.5, 1].map(f => (
          <line key={f} x1={pad.l} y1={pad.t + innerH * (1 - f)} x2={pad.l + innerW} y2={pad.t + innerH * (1 - f)}
            stroke="rgba(139,92,246,.1)" strokeDasharray="3 5" />
        ))}

        {data.map((d, i) => {
          const bh = (d.value / max) * innerH
          const x = pad.l + i * (barW + gap)
          const y = pad.t + innerH - bh
          const c = d.color ?? defaultColor
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={bh} rx="6" fill={c} opacity="0.85" />
              <text x={x + barW / 2} y={pad.t + innerH + 16} textAnchor="middle" fontSize="10" fill="#A5A3B8">
                {d.label}
              </text>
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="10" fill={c} fontWeight="700">
                {d.value}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
