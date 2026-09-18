'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CouponForm({ businessId }: { businessId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [form, setForm] = useState({
    code: '',
    title: '',
    description: '',
    discount_type: 'percent' as 'percent' | 'fixed',
    discount_value: '',
    min_order: '0',
    max_uses: '',
    per_user_limit: '1',
    ends_at: '',
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setMsg(null)
    const payload = {
      business_id: businessId,
      code: form.code.toUpperCase(),
      title: form.title,
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order: Number(form.min_order || 0),
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      per_user_limit: Number(form.per_user_limit || 1),
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
    }
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setMsg({ kind: 'ok', text: 'تم الإرسال — هيظهر بعد موافقة الإدارة' })
        setForm({ ...form, code: '', title: '', description: '', discount_value: '' })
        router.refresh()
      } else {
        setMsg({ kind: 'err', text: data.error === 'forbidden' ? 'مش مسموح' : 'حصلت مشكلة' })
      }
    } catch {
      setMsg({ kind: 'err', text: 'حصلت مشكلة' })
    }
    setLoading(false)
  }

  return (
    <form className="cf-form" onSubmit={submit}>
      <div className="cf-row">
        <label className="cf-label">
          الكود (إنجليزي/أرقام)
          <input className="cf-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER20" required minLength={3} maxLength={20} pattern="[A-Za-z0-9_-]+" />
        </label>
        <label className="cf-label">
          عنوان العرض
          <input className="cf-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="خصم الصيف" required minLength={3} maxLength={80} />
        </label>
      </div>

      <label className="cf-label">
        وصف (اختياري)
        <textarea className="cf-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} maxLength={300} />
      </label>

      <div className="cf-row">
        <label className="cf-label">
          نوع الخصم
          <select className="cf-input" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percent' | 'fixed' })}>
            <option value="percent">نسبة %</option>
            <option value="fixed">مبلغ ثابت</option>
          </select>
        </label>
        <label className="cf-label">
          القيمة
          <input className="cf-input" type="number" min="0.01" step="0.01" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} required />
        </label>
      </div>

      <div className="cf-row">
        <label className="cf-label">
          أقل أوردر (ج.م)
          <input className="cf-input" type="number" min="0" step="1" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value })} />
        </label>
        <label className="cf-label">
          أقصى استخدام (اختياري)
          <input className="cf-input" type="number" min="1" step="1" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="بدون حد" />
        </label>
        <label className="cf-label">
          لكل مستخدم
          <input className="cf-input" type="number" min="1" max="10" value={form.per_user_limit} onChange={(e) => setForm({ ...form, per_user_limit: e.target.value })} />
        </label>
      </div>

      <label className="cf-label">
        ينتهي في (اختياري)
        <input className="cf-input" type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
      </label>

      <button type="submit" className="cf-submit" disabled={loading}>
        {loading ? 'جاري الإرسال...' : 'أرسل للموافقة'}
      </button>
      {msg && <div className={`cf-msg cf-${msg.kind}`}>{msg.text}</div>}
    </form>
  )
}
