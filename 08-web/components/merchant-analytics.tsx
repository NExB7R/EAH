'use client'
import { useState } from 'react'
import './merchant-analytics.css'

type Metric = {
  label: string
  value: number | string
  hint?: string
  color?: string
  icon?: string
}

type Range = 7 | 14 | 30 | 90

type Props = {
  businessId: string
  businessName: string
  businessSlug: string
  metrics: {
    [key in Range]: Metric[]
  }
}

export default function MerchantAnalytics({ businessId, businessName, businessSlug, metrics }: Props) {
  const [range, setRange] = useState<Range>(7)
  const current = metrics[range] ?? metrics[7]

  function exportCsv() {
    window.location.href = `/api/merchant/export?business=${businessId}&range=${range}`
  }

  return (
    <div className="ma">
      <header className="ma__head">
        <div>
          <span className="ma__kicker">ANALYTICS</span>
          <h2 className="ma__title">📊 تحليلات {businessName}</h2>
          <p className="ma__sub">نظرة تفصيلية على أداء نشاطك</p>
        </div>
        <div className="ma__actions">
          <div className="ma__ranges">
            {([7, 14, 30, 90] as Range[]).map((r) => (
              <button
                key={r}
                type="button"
                className={`ma__range ${range === r ? 'is-active' : ''}`}
                onClick={() => setRange(r)}
              >
                {r} يوم
              </button>
            ))}
          </div>
          <button type="button" className="ma__export" onClick={exportCsv}>
            📥 CSV
          </button>
        </div>
      </header>

      <div className="ma__grid">
        {current.map((m, i) => (
          <div key={i} className="ma__card">
            {m.icon && <span className="ma__card-icon">{m.icon}</span>}
            <span className="ma__card-value" style={{ color: m.color }}>
              {m.value}
            </span>
            <span className="ma__card-label">{m.label}</span>
            {m.hint && <span className="ma__card-hint">{m.hint}</span>}
          </div>
        ))}
      </div>

      <div className="ma__links">
        <a href={`/businesses/${businessSlug}`} target="_blank" rel="noreferrer" className="ma__link">
          👁 مشاهدة الصفحة ↗
        </a>
        <a href="/merchant/businesses/[slug]/report" className="ma__link ma__link--hidden">
          تقرير مفصّل
        </a>
      </div>
    </div>
  )
}
