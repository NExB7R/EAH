'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  businessId: string
  disabled: boolean
  reason: string | null
}

export default function PromoSubmit({ businessId, disabled, reason }: Props) {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setMsg(null)
    try {
      const res = await fetch('/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: businessId, post_url: url.trim(), note: note.trim() || undefined }),
      })
      const data = await res.json()
      if (data.ok) {
        setMsg({ kind: 'ok', text: 'تم الإرسال — هنراجعه ونرد عليك' })
        setUrl(''); setNote('')
        router.refresh()
      } else {
        const reasons: Record<string, string> = {
          has_pending: 'عندك طلب معلق بالفعل',
          already_used: 'استخدمت الميزة قبل كده',
          bad_request: 'تحقق من الرابط',
        }
        setMsg({ kind: 'err', text: reasons[data.reason] ?? 'حصلت مشكلة' })
      }
    } catch { setMsg({ kind: 'err', text: 'حصلت مشكلة' }) }
    setLoading(false)
  }

  if (disabled) {
    return (
      <div className="promo-info">
        <p>ℹ️ {reason}</p>
      </div>
    )
  }

  return (
    <form className="promo-form" onSubmit={submit}>
      <div className="promo-info">
        <h3 className="promo-info__title">إزاي تستفيد؟</h3>
        <ol className="promo-info__list">
          <li>اعمل بوست على صفحة نشاطك على فيسبوك</li>
          <li>اكتب فيه تجربتك مع EAH + اللينك</li>
          <li>حط لينك البوست هنا</li>
          <li>هنراجعه خلال 24 ساعة</li>
          <li>موافقة → +15 يوم إضافي مجاناً</li>
        </ol>
      </div>

      <label className="promo-label">
        <span>لينك البوست على فيسبوك *</span>
        <input
          type="url"
          className="promo-input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.facebook.com/..."
          dir="ltr"
          required
        />
      </label>

      <label className="promo-label">
        <span>ملاحظات (اختياري)</span>
        <textarea
          className="promo-input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="أي حاجة تحب تقولها"
        />
      </label>

      <button type="submit" className="promo-submit" disabled={loading}>
        {loading ? '...' : 'أرسل للمراجعة'}
      </button>

      {msg && <div className={`promo-msg promo-msg--${msg.kind}`}>{msg.text}</div>}
    </form>
  )
}
