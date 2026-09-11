'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

function normalizeEgyptPhone(value: string) {
  const raw = value.trim().replace(/[\s()-]/g, '')
  if (raw.startsWith('+20')) return `+20${raw.slice(3).replace(/\D/g, '')}`
  if (raw.startsWith('20')) return `+${raw.replace(/\D/g, '')}`
  if (/^01\d{9}$/.test(raw)) return `+20${raw.slice(1)}`
  return null
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

      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          phone: normalized,
          password,
          options: { data: { display_name: name.trim(), phone_e164: normalized } },
        })
        if (error) throw error
        if (!data.session) {
          throw new Error('التسجيل يحتاج تأكيد الهاتف. عطّل Confirm phone في Supabase لأن EAH يعمل برقم + كلمة مرور بدون OTP.')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ phone: normalized, password })
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
      window.location.href = role === 'super_admin' ? '/admin' : role === 'merchant' ? '/merchant' : '/'
    } catch (error) {
      setMessage(friendlyError(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container" style={{ paddingTop: 56, maxWidth: 560 }}>
      <div className="eyebrow">EAH • ⚡</div>
      <h1 style={{ fontSize: 'clamp(2rem, 7vw, 3rem)' }}>{mode === 'login' ? 'سجّل بسرعة ⚡' : 'حساب جديد ⚡'}</h1>
      <p className="lead">{mode === 'login' ? 'ادخل برقم الموبايل وكلمة المرور.' : 'اعمل حسابك باسمك ورقم موبايلك وكلمة المرور. من غير OTP.'}</p>

      <div className="choice-row" style={{ marginTop: 18 }} role="tablist" aria-label="نوع الحساب">
        <button type="button" className={`choice ${mode === 'login' ? 'selected' : ''}`} onClick={() => { setMode('login'); setMessage('') }}>دخول</button>
        <button type="button" className={`choice ${mode === 'signup' ? 'selected' : ''}`} onClick={() => { setMode('signup'); setMessage('') }}>تسجيل جديد</button>
      </div>

      <form onSubmit={submit} className="card" style={{ padding: 18, marginTop: 20, display: 'grid', gap: 12 }}>
        {mode === 'signup' && (
          <>
            <label htmlFor="name" className="meta">الاسم</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك" required style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', padding: 14, borderRadius: 14 }} />
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
        <button className="primary" disabled={loading} style={{ marginTop: 4 }}>{loading ? 'جاري التنفيذ…' : 'سجّل بسرعة ⚡'}</button>
      </form>
      {message && <p role="alert" style={{ marginTop: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{message}</p>}
    </main>
  )
}
