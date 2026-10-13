'use client'

import { useMemo } from 'react'
import type { DailyView } from '@/lib/data/admin'
import styles from './analytics.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Views Line Chart (SVG — no library)
// ═══════════════════════════════════════════════════════════

type Props = {
  data: DailyView[]
  height?: number
}

const PAD_X = 12
const PAD_Y = 16
const VIEW_W = 600

function shortDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'numeric' })
}

export default function ViewChart({ data, height = 180 }: Props) {
  const { path, area, points, gridLines } = useMemo(() => {
    if (data.length === 0) {
      return { path: '', area: '', points: [], gridLines: [] }
    }
    const max = Math.max(1, ...data.map((d) => d.count))
    const stepX = (VIEW_W - PAD_X * 2) / Math.max(1, data.length - 1)
    const usableH = height - PAD_Y * 2

    const pts = data.map((d, i) => ({
      x: PAD_X + i * stepX,
      y: PAD_Y + usableH - (d.count / max) * usableH,
      raw: d,
    }))

    const linePath = pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(' ')

    const areaPath = `${linePath} L ${pts[pts.length - 1]!.x.toFixed(2)} ${height - PAD_Y} L ${pts[0]!.x.toFixed(2)} ${height - PAD_Y} Z`

    // 4 grid lines
    const gridLines = [0, 0.33, 0.66, 1].map((frac) => ({
      y: PAD_Y + usableH * frac,
      value: Math.round(max * (1 - frac)),
    }))

    return { path: linePath, area: areaPath, points: pts, gridLines }
  }, [data, height])

  if (data.length === 0) {
    return (
      <div className={styles.chartEmpty}>
        <span>مفيش بيانات للفترة دي</span>
      </div>
    )
  }

  // 5 labels على المحور الأفقي
  const labelIndices = [
    0,
    Math.floor(data.length / 4),
    Math.floor(data.length / 2),
    Math.floor((data.length * 3) / 4),
    data.length - 1,
  ]

  return (
    <div className={styles.chartWrap}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${height}`}
        preserveAspectRatio="none"
        className={styles.chart}
        role="img"
        aria-label="عدد المشاهدات اليومية"
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0.35)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#9d4edd" />
            <stop offset="100%" stopColor="#c77dff" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map((g, i) => (
          <line
            key={i}
            x1={PAD_X}
            y1={g.y}
            x2={VIEW_W - PAD_X}
            y2={g.y}
            stroke="rgba(168, 85, 247, 0.08)"
            strokeDasharray="2 4"
          />
        ))}

        {/* Area fill */}
        <path d={area} fill="url(#areaGrad)" />

        {/* Line */}
        <path
          d={path}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points (only if <= 14 days) */}
        {data.length <= 14 &&
          points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3"
              fill="#c77dff"
              stroke="rgba(10, 7, 20, 0.9)"
              strokeWidth="1.5"
            />
          ))}
      </svg>

      <div className={styles.chartAxis}>
        {labelIndices.map((idx) => (
          <span key={idx} className={styles.chartLabel}>
            {shortDate(data[idx]!.date)}
          </span>
        ))}
      </div>
    </div>
  )
}
