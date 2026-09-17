'use client'
import { useMemo } from 'react'
import './merchant-insights.css'

type DailyPoint = { day: string; views: number; reveals: number; orders: number }

type Props = {
  daily: DailyPoint[]
  totalViews: number
  totalReveals: number
  totalOrders: number
  avgRating: number
}

export default function MerchantInsights({ daily, totalViews, totalReveals, totalOrders, avgRating }: Props) {
  const insights = useMemo(() => {
    if (daily.length === 0) return []
    const out: { emoji: string; title: string; body: string; tone: 'good' | 'warn' | 'info' }[] = []

    // Best day
    const bestDay = daily.reduce((a, b) => (b.views > a.views ? b : a))
    if (bestDay.views > 0) {
      out.push({
        emoji: '🔥',
        title: 'أعلى يوم نشاط',
        body: `${new Date(bestDay.day).toLocaleDateString('ar-EG', { weekday: 'long' })} — ${bestDay.views} مشاهدة`,
        tone: 'good',
      })
    }

    // Growth trend
    if (daily.length >= 14) {
      const recent = daily.slice(-7).reduce((s, d) => s + d.views, 0)
      const prev = daily.slice(-14, -7).reduce((s, d) => s + d.views, 0)
      if (prev > 0) {
        const pct = Math.round(((recent - prev) / prev) * 100)
        if (pct >= 15) out.push({ emoji: '📈', title: 'نمو أسبوعي', body: `+${pct}% عن الأسبوع اللي فات — كمّل كده!`, tone: 'good' })
        else if (pct <= -15) out.push({ emoji: '📉', title: 'انخفاض', body: `${pct}% — حاول تنشر عرض جديد على EAH`, tone: 'warn' })
      }
    }

    // Conversion rate
    if (totalViews > 0) {
      const conv = ((totalReveals / totalViews) * 100).toFixed(1)
      if (Number(conv) < 5) {
        out.push({ emoji: '💡', title: 'نسبة كشف الأرقام قليلة', body: `فقط ${conv}% — ضيف صور وعروض لجذب الزوار`, tone: 'info' })
      } else if (Number(conv) > 20) {
        out.push({ emoji: '🎯', title: 'تحويل ممتاز', body: `${conv}% من الزوار بيكشفوا رقمك — شغلك عاجبهم`, tone: 'good' })
      }
    }

    // Orders recommendation
    if (totalOrders === 0 && totalViews > 30) {
      out.push({ emoji: '💬', title: 'فعّل أوردرات واتساب', body: 'عندك زوار كتير — فعّل استقبال الأوردرات وابدأ استقبل طلبات', tone: 'warn' })
    }

    // Rating tip
    if (avgRating > 0 && avgRating < 4) {
      out.push({ emoji: '⭐', title: 'التقييم يحتاج تحسين', body: `تقييمك ${avgRating.toFixed(1)}/5 — تفاعل مع التعليقات وحسّن الخدمة`, tone: 'warn' })
    }

    // Empty traffic tip
    if (totalViews < 10) {
      out.push({ emoji: '📣', title: 'نشاطك لسه جديد', body: 'انشر رابط صفحتك على فيسبوك وواتساب — استخدم زر "شارك"', tone: 'info' })
    }

    return out.slice(0, 4)
  }, [daily, totalViews, totalReveals, totalOrders, avgRating])

  if (insights.length === 0) return null

  return (
    <section className="mins">
      <header className="mins__head">
        <span className="mins__kicker">✨ توصيات ذكية</span>
        <h2 className="mins__title">نصايح على مزاج نشاطك</h2>
      </header>
      <div className="mins__grid">
        {insights.map((ins, i) => (
          <article key={i} className={`mins__card mins__card--${ins.tone}`}>
            <span className="mins__emoji">{ins.emoji}</span>
            <div className="mins__body">
              <strong className="mins__card-title">{ins.title}</strong>
              <p className="mins__card-desc">{ins.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
