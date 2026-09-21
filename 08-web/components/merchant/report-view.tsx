'use client'
import { useState } from 'react'
import './report-view.css'

type ReportData = {
  views: number; unique_visitors: number; prev_views: number; views_change_pct: number
  orders: number; confirmed_orders: number; prev_orders: number; orders_change_pct: number
  reviews_count: number; avg_rating: number; prev_reviews: number; prev_avg_rating: number
  conversion_rate: number
}

const MONTH_NAMES = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

function formatMonth(key: string) {
  const [y, m] = key.split('-')
  return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`
}

function ChangeBadge({ pct }: { pct: number }) {
  if (pct === 0) return <span className="rv__change rv__change--flat">—</span>
  const isUp = pct > 0
  return <span className={`rv__change ${isUp ? 'rv__change--up' : 'rv__change--down'}`}>{isUp ? '↗' : '↘'} {Math.abs(pct)}%</span>
}

function KpiCard({ label, value, change, accent = 'purple', suffix = '' }: { label: string; value: number | string; change?: number; accent?: 'purple'|'gold'|'green'|'blue'; suffix?: string }) {
  return (
    <div className={`rv-kpi rv-kpi--${accent}`}>
      <span className="rv-kpi__label">{label}</span>
      <span className="rv-kpi__value">
        {typeof value === 'number' ? value.toLocaleString('ar-EG') : value}
        {suffix && <span className="rv-kpi__suffix">{suffix}</span>}
      </span>
      {change !== undefined && <ChangeBadge pct={change} />}
    </div>
  )
}

function BarChart({ data, height = 180, accent = '#A855F7' }: { data: { label: string; value: number }[]; height?: number; accent?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const barW = 100 / data.length
  return (
    <div className="rv-chart" style={{ height }}>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="rv-chart__svg">
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 30)
          return <rect key={i} x={i * barW + barW * 0.15} y={height - 20 - h} width={barW * 0.7} height={h} fill="url(#barGrad)" rx="1" />
        })}
      </svg>
      <div className="rv-chart__labels">
        {data.map((d, i) => <span key={i} className="rv-chart__label">{d.label}</span>)}
      </div>
    </div>
  )
}

function RatingStars({ value }: { value: number }) {
  const rounded = Math.round(value)
  return (
    <span className="rv-stars">
      {[1,2,3,4,5].map((i) => <span key={i} className={`rv-star ${i <= rounded ? 'is-on' : ''}`}>★</span>)}
    </span>
  )
}

export default function ReportView({ report }: { report: any }) {
  const d: ReportData = report.data

  const bars = [
    { label: 'زيارات', value: d.views },
    { label: 'زوار', value: d.unique_visitors },
    { label: 'أوردرات', value: d.orders },
    { label: 'مؤكدة', value: d.confirmed_orders },
    { label: 'تقييمات', value: d.reviews_count },
  ]

  return (
    <div className="rv">
      <header className="rv__hero">
        <div className="rv__hero-glow" aria-hidden />
        <div className="rv__hero-content">
          <span className="rv__kicker">📊 تقرير شهري</span>
          <h1 className="rv__title">{formatMonth(report.month_key)}</h1>
          <p className="rv__sub">
            من {new Date(report.period_start).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
            {' '}لـ {new Date(new Date(report.period_end).getTime() - 86400000).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
          </p>
        </div>
        <button type="button" className="rv__print-btn" onClick={() => window.print()}>🖨 طباعة PDF</button>
      </header>

      <section className="rv__section">
        <h2 className="rv__section-title">📈 الأرقام الرئيسية</h2>
        <div className="rv__kpis">
          <KpiCard label="زوار الصفحة" value={d.views} change={d.views_change_pct} accent="purple" />
          <KpiCard label="زوار مميزين" value={d.unique_visitors} accent="blue" />
          <KpiCard label="الأوردرات" value={d.orders} change={d.orders_change_pct} accent="green" />
          <KpiCard label="معدل التحويل" value={d.conversion_rate} suffix="%" accent="gold" />
        </div>
      </section>

      <section className="rv__section">
        <h2 className="rv__section-title">📊 النشاط</h2>
        <div className="rv__chart-wrap"><BarChart data={bars} /></div>
      </section>

      <section className="rv__section">
        <h2 className="rv__section-title">⭐ التقييمات</h2>
        <div className="rv__ratings">
          <div className="rv__rating-card">
            <span className="rv__rating-label">المتوسط الشهري</span>
            <div className="rv__rating-value"><strong>{d.avg_rating.toFixed(1)}</strong><RatingStars value={d.avg_rating} /></div>
            <span className="rv__rating-count">{d.reviews_count} تقييم</span>
          </div>
          <div className="rv__rating-card">
            <span className="rv__rating-label">الشهر اللي فات</span>
            <div className="rv__rating-value"><strong>{d.prev_avg_rating.toFixed(1)}</strong><RatingStars value={d.prev_avg_rating} /></div>
            <span className="rv__rating-count">{d.prev_reviews} تقييم</span>
          </div>
        </div>
      </section>

      <section className="rv__section">
        <h2 className="rv__section-title">💡 الخلاصة</h2>
        <div className="rv__summary">
          {d.views_change_pct > 20 ? <p>🎉 شهر مميز! زياراتك زادت <strong>{d.views_change_pct}%</strong>.</p>
            : d.views_change_pct < -10 ? <p>⚠️ زياراتك نزلت <strong>{Math.abs(d.views_change_pct)}%</strong>.</p>
            : <p>📊 الأداء مستقر.</p>}
          {d.orders > 0 ? <p>🛒 استقبلت <strong>{d.orders} أوردر</strong> — {d.confirmed_orders} مؤكد.</p>
            : <p>💡 لسه مفيش أوردرات — فعّل استقبال أوردرات الواتساب.</p>}
          {d.avg_rating >= 4.5 ? <p>⭐ تقييمك <strong>{d.avg_rating.toFixed(1)}</strong> — ممتاز!</p>
            : d.avg_rating > 0 ? <p>⭐ تقييمك <strong>{d.avg_rating.toFixed(1)}</strong>.</p> : null}
        </div>
      </section>
    </div>
  )
}
