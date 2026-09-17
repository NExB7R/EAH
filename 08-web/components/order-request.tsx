'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import './order-request.css'
import { buildOrderMessage, generateOrderCode } from '@/lib/whatsapp-order'
import { IcMarket, IcChat, IcPhone } from './eah-icons'

type Props = {
  businessId: string
  businessName: string
  merchantPhone: string | null
}

export default function OrderRequest({ businessId, businessName, merchantPhone }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [area, setArea] = useState('')
  const [address, setAddress] = useState('')
  const [items, setItems] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  // Prefill name/phone from profile if logged in
  useEffect(() => {
    if (!open) return
    const supabase = createClient()
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name,phone')
        .eq('id', user.id)
        .maybeSingle()
      if (profile?.display_name) setName(profile.display_name)
      if (profile?.phone) setPhone(profile.phone)
    })()
  }, [open])

  function validate() {
    if (name.trim().length < 2) return 'اكتب اسمك'
    if (!/^[\d+\s-]{8,}$/.test(phone.trim())) return 'رقم موبايل غير صحيح'
    if (items.trim().length < 5) return 'اكتب الأوردر بالتفصيل'
    if (!merchantPhone) return 'المطعم مش مسجل رقم واتساب'
    return null
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const err = validate()
    if (err || !merchantPhone) { setError(err ?? 'رقم المطعم غير متاح'); return }

    const phoneNumber = merchantPhone
    setStatus('sending')

    const orderCode = generateOrderCode()

    // fetch profile extras
    let customerTrustScore: number | undefined
    let customerVerified: boolean | undefined
    let customerReviews: number | undefined
    let customerProfileId: string | null = null

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        customerProfileId = user.id
        const { data: prof } = await supabase
          .from('profiles')
          .select('trust_score,verified_at')
          .eq('id', user.id)
          .maybeSingle()
        if (prof) {
          customerTrustScore = prof.trust_score ?? 0
          customerVerified = !!prof.verified_at
        }
        const { count } = await supabase
          .from('business_reviews')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
        customerReviews = count ?? 0
      }
    } catch { /* silent */ }

    const msg = buildOrderMessage({
      orderCode,
      businessName,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      area: area.trim() || null,
      address: address.trim() || null,
      items: items.trim(),
      notes: notes.trim() || null,
      customerTrustScore,
      customerVerified,
      customerReviews,
    })

    const waUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`

    try {
      const supabase = createClient()
      const { data: inserted } = await supabase.from('order_requests').insert({
        business_id: businessId,
        customer_user_id: customerProfileId,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_area: area.trim() || null,
        customer_address: address.trim() || null,
        items_summary: items.trim(),
        notes: notes.trim() || null,
        merchant_phone: phoneNumber,
        whatsapp_url: waUrl,
        order_code: orderCode,
        status: 'sent',
      }).select('id').maybeSingle()

      if (inserted?.id) {
        fetch('/api/orders/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: inserted.id }),
        }).catch(() => {})
      }

      window.open(waUrl, '_blank', 'noreferrer')
      setStatus('sent')
    } catch (e) {
      setStatus('error')
      setError(e instanceof Error ? e.message : 'حصل خطأ')
    }
  }

  if (!merchantPhone) return null

  if (!open) {
    return (
      <button type="button" className="orr__trigger" onClick={() => setOpen(true)}>
        <span className="orr__trigger-icon"><IcMarket /></span>
        <span className="orr__trigger-text">
          <strong>اطلب أوردر</strong>
          <small>يتبعت مباشر على واتساب المطعم</small>
        </span>
        <span className="orr__trigger-arrow">←</span>
      </button>
    )
  }

  return (
    <div className="orr">
      <header className="orr__head">
        <div>
          <span className="orr__kicker">نموذج الطلب</span>
          <h3 className="orr__title">اطلب من {businessName}</h3>
          <p className="orr__sub">
            اكتب الأوردر، ونحوله لك على واتساب المطعم مباشرة
          </p>
        </div>
        <button type="button" className="orr__close" onClick={() => setOpen(false)}>×</button>
      </header>

      {status === 'sent' ? (
        <div className="orr__success">
          <span className="orr__success-emoji">✅</span>
          <h4>تم إرسال طلبك</h4>
          <p>
            الأوردر اتبعت على واتساب المطعم. لو مفتحش تلقائياً،
            دوس على الرابط تحت.
          </p>
          <a
            href={`https://wa.me/${merchantPhone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="orr__success-btn"
          >
            افتح واتساب المطعم
          </a>
          <button
            type="button"
            className="orr__success-close"
            onClick={() => { setOpen(false); setStatus('idle') }}
          >
            تمام
          </button>
        </div>
      ) : (
        <form className="orr__form" onSubmit={submit}>
          <div className="orr__grid">
            <label className="orr__field">
              <span>الاسم *</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسمك الكامل"
                maxLength={80}
                required
              />
            </label>
            <label className="orr__field">
              <span>رقم الموبايل *</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
                dir="ltr"
                maxLength={20}
                required
              />
            </label>
          </div>

          <div className="orr__grid">
            <label className="orr__field">
              <span>المنطقة</span>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="مثلاً: شبين القناطر"
                maxLength={60}
              />
            </label>
            <label className="orr__field">
              <span>العنوان بالتفصيل</span>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="اسم الشارع + علامة مميزة"
                maxLength={200}
              />
            </label>
          </div>

          <label className="orr__field">
            <span>الأوردر *</span>
            <textarea
              value={items}
              onChange={(e) => setItems(e.target.value)}
              placeholder="مثلاً: 2 شاورما فراخ + 1 بيبسي كبير"
              rows={4}
              maxLength={500}
              required
            />
            <small className="orr__hint">{items.length}/500 حرف</small>
          </label>

          <label className="orr__field">
            <span>ملاحظات إضافية</span>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلاً: حار شوية، بدون بصل..."
              maxLength={200}
            />
          </label>

          {error && <div className="orr__error">{error}</div>}

          <div className="orr__actions">
            <button
              type="submit"
              className="orr__submit"
              disabled={status === 'sending'}
            >
              {status === 'sending' ? '...' : '📤 إرسال على واتساب'}
            </button>
            <button
              type="button"
              className="orr__cancel"
              onClick={() => setOpen(false)}
            >
              إلغاء
            </button>
          </div>

          <p className="orr__note">
            🔒 بياناتك بتُستخدم فقط لتحويل الأوردر للمطعم. مفيش أي رسوم على العميل.
          </p>
        </form>
      )}
    </div>
  )
}
