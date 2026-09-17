'use client'
import './order-timeline.css'
import { IcBan, IcEye } from '@/components/eah-icons'

type HistoryItem = {
  id: string
  old_status: string | null
  new_status: string
  note: string | null
  created_at: string
}

const LABELS: Record<string, { icon: React.ReactNode; text: string }> = {
  sent: { icon: null, text: 'أُرسل' },
  seen: { icon: <IcEye />, text: 'شافه المطعم' },
  accepted: { icon: null, text: 'قبل المطعم' },
  rejected: { icon: null, text: 'رفض المطعم' },
  delivered: { icon: null, text: 'تم التسليم' },
  cancelled: { icon: <IcBan />, text: 'ملغي' },
}

export default function OrderTimeline({ items }: { items: HistoryItem[] }) {
  if (items.length === 0) {
    return <div className="otl__empty">لا يوجد سجل بعد</div>
  }

  return (
    <ol className="otl">
      {items.map((item, i) => {
        const meta = LABELS[item.new_status] ?? { icon: null, text: item.new_status }
        const isLast = i === items.length - 1
        return (
          <li key={item.id} className={`otl__item ${isLast ? 'otl__item--current' : ''}`}>
            <span className="otl__dot" aria-hidden>{meta.icon}</span>
            <div className="otl__body">
              <strong className="otl__label">{meta.text}</strong>
              <span className="otl__time">
                {new Date(item.created_at).toLocaleString('ar-EG', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {item.note && <p className="otl__note">{item.note}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
