'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

function normalizeEgyptPhone(value: string) {
  const raw = value.trim().replace(/[\s()-]/g, '')

  if (raw.startsWith('+20')) {
    return `+20${raw.slice(3).replace(/\D/g, '')}`
  }

  if (raw.startsWith('20')) {
    return `+${raw.replace(/\D/g, '')}`
  }

  if (/^01\d{9}$/.test(raw)) {
    return `+20${raw.slice(1)}`
  }

  return null
}

export default function AuthPage() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [normalizedPhone, setNormalizedPhone] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendOtp(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const normalized = normalizeEgyptPhone(phone)
    if (!normalized) {
      setMessage('اكتب رقم موبايل مصري صحيح، مثل 01012345678.')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({ phone: normalized })
      if (error) throw error

      setNormalizedPhone(normalized)
      setStep('otp')
      setMessage('اتبعنا. بعتنالك كود تحقق على الموبايل.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'تعذر إرسال كود التحقق.')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const token = otp.trim().replace(/\D/g, '')
    if (!/^\d{6}$/.test(token)) {
      setMessage('اكتب كود التحقق المكوّن من 6 أرقام.')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.verifyOtp({
        phone: normalizedPhone,
        token,
        type: 'sms',
      })
      if (error) throw error

      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) {
        throw userError ?? new Error('تعذر تأكيد جلسة الدخول.')
      }

      const { data: roleRow, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userData.user.id)
        .maybeSingle()

      if (roleError) throw new Error(`تعذر قراءة صلاحية الحساب: ${roleError.message}`)

      const role = roleRow?.role ?? 'customer'

      if (role === 'admin' || role === 'super_admin') {
        window.location.href = '/admin'
        return
      }

      // Merchant workspace will be wired separately. Until then, keep the user in the product.
      window.location.href = '/'
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'كود التحقق غير صحيح أو انتهت صلاحيته.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container" style={{ paddingTop: 56, maxWidth: 560 }}>
      <div className="eyebrow">EAH</div>
      <h1 style={{ fontSize: 'clamp(2rem, 7vw, 3rem)' }}>
        {step === 'phone' ? 'دخول سريع' : 'تأكيد رقم الموبايل'}
      </h1>
      <p style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
        {step === 'phone'
          ? 'اكتب رقم موبايلك. هنستخدمه للدخول أو إنشاء حسابك من غير كلمة مرور.'
          : `دخل الكود اللي وصل على ${normalizedPhone}.`}
      </p>

      {step === 'phone' ? (
        <form onSubmit={sendOtp} className="card" style={{ padding: 18, marginTop: 20 }}>
          <label htmlFor="phone" className="meta">رقم الموبايل</label>
          <input
            id="phone"
            type="tel"
            dir="ltr"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01012345678"
            required
            autoComplete="tel"
            style={{ width: '100%', margin: '8px 0 12px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', padding: 14, borderRadius: 14 }}
          />
          <button className="primary" disabled={loading}>
            {loading ? 'جاري إرسال الكود…' : 'إرسال كود الدخول'}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="card" style={{ padding: 18, marginTop: 20 }}>
          <label htmlFor="otp" className="meta">كود التحقق</label>
          <input
            id="otp"
            type="text"
            dir="ltr"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            required
            autoComplete="one-time-code"
            style={{ width: '100%', margin: '8px 0 12px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', padding: 14, borderRadius: 14, letterSpacing: '.3em', textAlign: 'center', fontSize: 22 }}
          />
          <button className="primary" disabled={loading}>
            {loading ? 'جاري التحقق…' : 'تأكيد الدخول'}
          </button>
          <button
            type="button"
            className="ghost"
            disabled={loading}
            onClick={() => {
              setStep('phone')
              setOtp('')
              setMessage('')
            }}
            style={{ marginTop: 10 }}
          >
            تغيير الرقم
          </button>
        </form>
      )}

      {message && <p role="alert" style={{ marginTop: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{message}</p>}
    </main>
  )
}
