'use client'
type Point = { label: string; value: number }

export default function LineChart({
  data, height = 180, color = '#A855F7', label = '',
}: {
  data: Point[]
  height?: number
  color?: string
  label?: string
}) {
  if (data.length === 0) {
    return <div className="chart-empty">مفيش بيانات</div>
  }

  const max = Math.max(...data.map(d => d.value), 1)
  const w = 600
  const h = height
  const pad = { t: 20, r: 20, b: 30, l: 40 }
  const innerW = w - pad.l - pad.r
  const innerH = h - pad.t - pad.b
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0

  const points = data.map((d, i) => ({
    x: pad.l + i * stepX,
    y: pad.t + innerH - (d.value / max) * innerH,
    ...d,
  }))

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const area = `${path} L ${points[points.length - 1].x} ${pad.t + innerH} L ${points[0].x} ${pad.t + innerH} Z`

  return (
    <div className="chart">
      {label && <span className="chart__label">{label}</span>}
      <svg viewBox={`0 0 ${w} ${h}`} className="chart__svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`grad-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <line
            key={f}
            x1={pad.l} y1={pad.t + innerH * f}
            x2={pad.l + innerW} y2={pad.t + innerH * f}
            stroke="rgba(139,92,246,.1)" strokeDasharray="3 5"
          />
        ))}

        {/* Y-axis labels */}
        {[0, 0.5, 1].map(f => (
          <text key={f} x={pad.l - 6} y={pad.t + innerH * (1 - f) + 4} textAnchor="end"
            fontSize="10" fill="#6B6880">
            {Math.round(max * f)}
          </text>
        ))}

        {/* area */}
        <path d={area} fill={`url(#grad-${color.slice(1)})`} />

        {/* line */}
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} stroke="#0a0810" strokeWidth="2" />
        ))}
      </svg>

      <div className="chart__labels">
        {data.map((d, i) => (
          <span key={i} className="chart__xlabel">{d.label}</span>
        ))}
      </div>
    </div>
  )
}
