'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import './auth.css'
import EahLogo from '@/components/eah-logo'

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
  const [gender, setGender] = useState<'male' | 'female' | ''>('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
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
      if (!gender) {
        setMessage('اختار ذكر ولا أنثى.')
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
              gender,
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
    <main className="auth">
      <div className="auth__wrap">
        {/* Hero — RTL right side */}
        <section className="auth__hero">
          <div className="auth__logo"><EahLogo size="md" variant="full" href="/" /></div>
          <span className="auth__kicker">EAH • EAT AROUND HERE</span>
          <h1 className="auth__title">
            {mode === 'login' ? (
              <>سجّل بسرعة <span className="auth__title-accent">⚡</span></>
            ) : (
              <>اعمل حسابك <span className="auth__title-accent">⚡</span></>
            )}
          </h1>
          <p className="auth__lead">
            {mode === 'login'
              ? 'ادخل برقم الموبايل وكلمة المرور واستكمل رحلتك على EAH.'
              : 'اسمك + رقم موبايلك + كلمة مرور. من غير OTP ومن غير رسائل SMS.'}
          </p>

          <div className="auth__note">
            <strong className="auth__note-title">🔒 الجلسة بتفضل شغالة</strong>
            <p className="auth__note-text">
              لما تدخل مرة، EAH بيحافظ على جلستك ويجددها تلقائيًا طالما الحساب صالح. استخدم تسجيل الخروج لو الجهاز مش معاك.
            </p>
          </div>

          <p className="auth__fineprint">
            تسجيل الحساب بيتم برقم الموبايل الظاهر لك، بينما نظام المصادقة الداخلي يستخدم هوية آمنة خاصة بـ EAH.
          </p>
        </section>

        {/* Card — form */}
        <section className="auth__card">
          <div className="auth__tabs" role="tablist" aria-label="نوع الحساب">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={`auth__tab ${mode === 'login' ? 'auth__tab--active' : ''}`}
              onClick={() => { setMode('login'); setMessage('') }}
            >
              دخول
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              className={`auth__tab ${mode === 'signup' ? 'auth__tab--active' : ''}`}
              onClick={() => { setMode('signup'); setMessage('') }}
            >
              تسجيل جديد
            </button>
          </div>

          <form onSubmit={submit} className="auth__form">
            {mode === 'signup' && (
              <div className="auth__field">
                <label htmlFor="name" className="auth__label">الاسم</label>
                <div className="auth__input-wrap">
                  <input
                    id="name"
                    className="auth__input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثلاً: نور الدين"
                    required
                  />
                </div>
              </div>
            )}

            <div className="auth__field">
              <label htmlFor="phone" className="auth__label">رقم الموبايل</label>
              <div className="auth__input-wrap">
                <input
                  id="phone"
                  className="auth__input"
                  type="tel"
                  dir="ltr"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  required
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="auth__field">
              <label htmlFor="password" className="auth__label">كلمة المرور</label>
              <div className="auth__input-wrap">
                <input
                  id="password"
                  className="auth__input auth__input--with-btn"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8 أحرف أو أكثر"
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="auth__input-btn"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'إخفاء' : 'إظهار'}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="auth__field">
                <label htmlFor="confirm-password" className="auth__label">تأكيد كلمة المرور</label>
                <div className="auth__input-wrap">
                  <input
                    id="confirm-password"
                    className="auth__input auth__input--with-btn"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="كرر كلمة المرور"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth__input-btn"
                    onClick={() => setShowConfirm(v => !v)}
                    aria-label={showConfirm ? 'إخفاء' : 'إظهار'}
                    tabIndex={-1}
                  >
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            )}

            <button className="auth__submit" disabled={loading}>
              {loading ? 'جاري التنفيذ…' : mode === 'login' ? 'دخول ⚡' : 'سجّل بسرعة ⚡'}
            </button>
          </form>

          {mode === 'login' && (
            <div className="auth__recover">
              <a href="/auth/recover" className="auth__recover-link">
                نسيت كلمة المرور؟
              </a>
            </div>
          )}

          {message && <div className="auth__alert" role="alert">{message}</div>}
        </section>
      </div>
    </main>
  )
}
