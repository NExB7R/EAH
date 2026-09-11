'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function AuthPage() {
  const [phone, setPhone] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function requestOtp(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({ phone })
      if (error) throw error
      setCodeSent(true)
      setMessage('اتبعث لك الكود. دخل الـ6 أرقام هنا.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'حصل خطأ في إرسال الكود.')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
      if (error) throw error
      window.location.href = '/'
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'الكود غير صحيح.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container" style={{ paddingTop: 56, maxWidth: 560 }}>
      <div className="eyebrow">EAH</div>
      <h1 style={{ fontSize: 'clamp(2rem, 7vw, 3rem)' }}>دخول سريع</h1>
      <p style={{ color: 'var(--muted)', lineHeight: 1.8 }}>سجّل برقم موبايلك. خطوة الـSMS هتشتغل أول ما نربط مزود الرسائل.</p>

      {!codeSent ? (
        <form onSubmit={requestOtp} className="card" style={{ padding: 18, marginTop: 20 }}>
          <label htmlFor="phone" className="meta">رقم الموبايل</label>
          <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+20..." required inputMode="tel" style={{ width: '100%', margin: '8px 0 12px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', padding: 14, borderRadius: 14 }} />
          <button className="primary" disabled={loading}>{loading ? 'جاري الإرسال…' : 'ابعتلي الكود'}</button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="card" style={{ padding: 18, marginTop: 20 }}>
          <label htmlFor="otp" className="meta">الكود</label>
          <input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" required inputMode="numeric" maxLength={6} style={{ width: '100%', margin: '8px 0 12px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', padding: 14, borderRadius: 14, letterSpacing: '.35em', textAlign: 'center' }} />
          <button className="primary" disabled={loading}>{loading ? 'جاري التحقق…' : 'تحقق ودخلني'}</button>
        </form>
      )}

      {message && <p role="status" style={{ marginTop: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{message}</p>}
    </main>
  )
}
