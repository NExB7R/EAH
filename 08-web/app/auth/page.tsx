'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import EahAdSlot from '@/components/eah-ad-slot'

function normalizeEgyptPhone(value: string) {
  const raw = value.trim().replace(/[\s()-]/g, '')
  if (raw.startsWith('+20')) return `+20${raw.slice(3).replace(/\D/g, '')}`
  if (raw.startsWith('20')) return `+${raw.replace(/\D/g, '')}`
  if (/^01\d{9}$/.test(raw)) return `+20${raw.slice(1)}`
  return null
}

function internalEmail(phoneE164: string) {
  return `phone_${phoneE164.replace(/\D/g, '')}@accounts.eah.invalid`
}

function friendlyError(error: unknown) {
  return error instanceof Error ? error.message : 'حصلت مشكلة. جرّب تاني.'
}

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let active = true

    void supabase.auth.getUser().then(async ({ data }) => {
      if (!active || !data.user) return
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .maybeSingle()
      if (!active) return
      const role = roleRow?.role ?? 'customer'
      const next = new URLSearchParams(window.location.search).get('next')
      const fallback = role === 'super_admin' ? '/admin' : role === 'merchant' ? '/merchant' : '/'
      window.location.replace(next || fallback)
    })

    return () => {
      active = false
    }
  }, [])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const normalized = normalizeEgyptPhone(phone)
    if (!normalized) {
      setMessage('اكتب رقم موبايل مصري صحيح، مثل 01012345678.')
      setLoading(false)
      return
    }

    if (mode === 'signup') {
      if (name.trim().length < 2) {
        setMessage('اكتب اسمك بشكل صحيح.')
        setLoading(false)
        return
      }
      if (password.length < 8) {
        setMessage('كلمة المرور لازم تكون 8 حروف/أرقام على الأقل.')
        setLoading(false)
        return
      }
      if (password !== confirmPassword) {
        setMessage('تأكيد كلمة المرور غير مطابق.')
        setLoading(false)
        return
      }
    }

    try {
      const supabase = createClient()
      const email = internalEmail(normalized)

      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: name.trim(),
              phone_e164: normalized,
            },
          },
        })
        if (error) throw error
        if (!data.session) {
          throw new Error('تعذر إنشاء الجلسة. تأكد أن Confirm email مقفول في Supabase.')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }

      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) throw userError ?? new Error('تعذر فتح جلسة الحساب.')

      const { data: roleRow, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userData.user.id)
        .maybeSingle()
      if (roleError) throw new Error(`تعذر قراءة صلاحية الحساب: ${roleError.message}`)

      const role = roleRow?.role ?? 'customer'
      const next = new URLSearchParams(window.location.search).get('next')
      const fallback = role === 'super_admin' ? '/admin' : role === 'merchant' ? '/merchant' : '/'
      window.location.href = next || fallback
    } catch (error) {
      setMessage(friendlyError(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container" style={{ paddingTop: 42, maxWidth: 980 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 460px)', gap: 28, alignItems: 'start' }}>
        <section style={{ paddingTop: 12 }}>
          <div className="eyebrow">EAH • EAT AROUND HERE</div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 7vw, 4.5rem)', lineHeight: 1.05, margin: '14px 0' }}>
            {mode === 'login' ? 'سجّل بسرعة ⚡' : 'اعمل حسابك على EAH ⚡'}
          </h1>
          <p className="lead" style={{ maxWidth: 620 }}>
            {mode === 'login'
              ? 'ادخل برقم الموبايل وكلمة المرور واستكمل رحلتك على EAH.'
              : 'اسمك + رقم موبايلك + كلمة مرور. من غير OTP ومن غير رسائل SMS.'}
          </p>
          <div className="card" style={{ marginTop: 22, padding: 18, background: 'linear-gradient(135deg, rgba(168,85,247,.10), rgba(124,58,237,.04))' }}>
            <strong>الجلسة بتفضل شغالة.</strong>
            <div style={{ marginTop: 6, opacity: .72, lineHeight: 1.7 }}>لما تدخل مرة، EAH بيحافظ على جلستك ويجددها تلقائيًا طالما الحساب صالح. استخدم تسجيل الخروج لو الجهاز مش معاك.</div>
          </div>
          <div style={{ marginTop: 18, fontSize: 13, opacity: .56 }}>تسجيل الحساب بيتم برقم الموبايل الظاهر لك، بينما نظام المصادقة الداخلي يستخدم هوية آمنة خاصة بـ EAH.</div>
        </section>

        <section>
          <EahAdSlot slotKey="auth_top" />

          <div className="choice-row" role="tablist" aria-label="نوع الحساب">
            <button type="button" className={`choice ${mode === 'login' ? 'selected' : ''}`} onClick={() => { setMode('login'); setMessage('') }}>دخول</button>
            <button type="button" className={`choice ${mode === 'signup' ? 'selected' : ''}`} onClick={() => { setMode('signup'); setMessage('') }}>تسجيل جديد</button>
          </div>

          <form onSubmit={submit} className="card" style={{ padding: 22, marginTop: 14, display: 'grid', gap: 12 }}>
            {mode === 'signup' && (
              <>
                <label htmlFor="name" className="meta">الاسم</label>
                <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً: نور الدين" required style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', padding: 14, borderRadius: 14 }} />
              </>
            )}
            <label htmlFor="phone" className="meta">رقم الموبايل</label>
            <input id="phone" type="tel" dir="ltr" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01012345678" required autoComplete="tel" style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', padding: 14, borderRadius: 14 }} />
            <label htmlFor="password" className="meta">كلمة المرور</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8 أحرف أو أكثر" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', padding: 14, borderRadius: 14 }} />
            {mode === 'signup' && (
              <>
                <label htmlFor="confirm-password" className="meta">تأكيد كلمة المرور</label>
                <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="كرر كلمة المرور" required autoComplete="new-password" style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', padding: 14, borderRadius: 14 }} />
              </>
            )}
            <button className="primary" disabled={loading} style={{ marginTop: 4, minHeight: 50 }}>{loading ? 'جاري التنفيذ…' : mode === 'login' ? 'دخول ⚡' : 'سجّل بسرعة ⚡'}</button>
          </form>

          {mode === 'login' && (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <a href="/auth/recover" style={{ color: '#c4b5fd', fontWeight: 700 }}>نسيت كلمة المرور؟</a>
            </div>
          )}

          {message && <p role="alert" style={{ marginTop: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{message}</p>}
        </section>
      </div>
    </main>
  )
}
