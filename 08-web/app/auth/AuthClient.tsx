'use client'
import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import './auth-client.css'

type Mode = 'login' | 'signup'

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('20')) return digits
  if (digits.startsWith('0')) return '20' + digits.slice(1)
  if (digits.startsWith('1')) return '20' + digits
  return digits
}

export default function AuthClient() {
  const router = useRouter()
  const sp = useSearchParams()
  const next = sp.get('next') ?? '/'
  const [mode, setMode] = useState<Mode>('login')

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | ''>('')

  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  // لو مسجل دخول بالفعل → روّحه
  useEffect(() => {
    const supabase = createClient()
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) router.replace(next)
    })()
  }, [router, next])

  function switchMode(m: Mode) {
    setMode(m)
    setError(null)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const cleanPhone = normalizePhone(phone)
    if (cleanPhone.length < 11) { setError('رقم الموبايل مش صح'); return }
    if (password.length < 8) { setError('كلمة السر 8 حروف أو أكتر'); return }

    if (mode === 'signup') {
      if (password !== confirmPassword) { setError('كلمتين السر مش متطابقين'); return }
      if (name.trim().length < 2) { setError('اكتب اسمك'); return }
      if (!gender) { setError('اختار ذكر أو أنثى'); return }
    }

    start(async () => {
      const supabase = createClient()
      const email = `${cleanPhone}@eah.local`

      if (mode === 'signup') {
        const { data, error: e1 } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              phone: cleanPhone,
              display_name: name.trim(),
              gender,
            },
          },
        })
        if (e1) { setError(e1.message); return }
        if (!data.user) { setError('حصلت مشكلة، حاول تاني'); return }

        // أول ما يدخل، نحدّث بروفايله
        try {
          await supabase
            .from('profiles')
            .update({
              display_name: name.trim(),
              phone: cleanPhone,
              gender,
            })
            .eq('id', data.user.id)
        } catch { /* silent */ }

        router.replace(next)
        router.refresh()
        return
      }

      // login
      const { error: e2 } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (e2) {
        setError(e2.message === 'Invalid login credentials' ? 'رقم أو كلمة السر غلط' : e2.message)
        return
      }
      router.replace(next)
      router.refresh()
    })
  }

  return (
    <div className="ac">
      <div className="ac__bg" aria-hidden />
      <div className="ac__glow" aria-hidden />

      <div className="ac__wrap">
        {/* ═══ يسار: الوصف ═══ */}
        <aside className="ac__aside">
          <div className="ac__logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/crown-512.png" alt="EAH" />
          </div>

          <span className="ac__kicker">EAH · اللي نفسك فيه</span>

          <h1 className="ac__hero">
            {mode === 'login' ? (
              <>سجّل <em>بسرعة</em></>
            ) : (
              <>اعمل <em>حسابك</em></>
            )}
          </h1>

          <p className="ac__sub">
            {mode === 'login'
              ? 'رقم موبايلك + كلمة السر — وخلاص. من غير كود ولا SMS.'
              : 'اسمك + رقمك + كلمة سر. من غير كود تحقق. من غير أي تعقيد.'}
          </p>

          <ul className="ac__perks">
            <li>
              <span className="ac__perk-icon">🔓</span>
              <div>
                <strong>شوف الأرقام والتواصل</strong>
                <small>أرقام كل مكان + واتسابهم + الموقع الدقيق</small>
              </div>
            </li>
            <li>
              <span className="ac__perk-icon">💎</span>
              <div>
                <strong>خصومات وعروض حصرية</strong>
                <small>كوبونات المحلات لأعضاء EAH بس</small>
              </div>
            </li>
            <li>
              <span className="ac__perk-icon">🔖</span>
              <div>
                <strong>احفظ الأماكن المفضلة</strong>
                <small>رجعلها في أي وقت من أي جهاز</small>
              </div>
            </li>
          </ul>
        </aside>

        {/* ═══ يمين: الفورم ═══ */}
        <main className="ac__form-wrap">
          <div className="ac__tabs">
            <button
              type="button"
              className={`ac__tab ${mode === 'login' ? 'is-active' : ''}`}
              onClick={() => switchMode('login')}
            >
              دخول
            </button>
            <button
              type="button"
              className={`ac__tab ${mode === 'signup' ? 'is-active' : ''}`}
              onClick={() => switchMode('signup')}
            >
              تسجيل جديد
            </button>
          </div>

          <form className="ac__form" onSubmit={submit}>
            {mode === 'signup' && (
              <>
                <label className="ac__field">
                  <span className="ac__label">اسمك</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثلاً: نور الدين"
                    maxLength={60}
                    autoComplete="name"
                  />
                </label>

                <div className="ac__field">
                  <span className="ac__label">إنت مين؟</span>
                  <div className="ac__gender">
                    <button
                      type="button"
                      className={`ac__gender-btn ${gender === 'male' ? 'is-active' : ''}`}
                      onClick={() => setGender('male')}
                    >
                      <span className="ac__gender-emoji">👨</span>
                      <span>ذكر</span>
                    </button>
                    <button
                      type="button"
                      className={`ac__gender-btn ${gender === 'female' ? 'is-active' : ''}`}
                      onClick={() => setGender('female')}
                    >
                      <span className="ac__gender-emoji">👩</span>
                      <span>أنثى</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            <label className="ac__field">
              <span className="ac__label">رقم الموبايل</span>
              <input
                type="tel"
                dir="ltr"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
                maxLength={20}
                autoComplete="tel"
              />
            </label>

            <label className="ac__field">
              <span className="ac__label">كلمة السر</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 حروف أو أكتر"
                minLength={8}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </label>

            {mode === 'signup' && (
              <label className="ac__field">
                <span className="ac__label">تأكيد كلمة السر</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="كرّر كلمة السر"
                  autoComplete="new-password"
                />
              </label>
            )}

            {error && <div className="ac__error">{error}</div>}

            <button type="submit" className="ac__submit" disabled={pending}>
              {pending ? (
                <span className="ac__spinner" />
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  <span>{mode === 'login' ? 'دخول' : 'سجّل دلوقتي'}</span>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </>
              )}
            </button>

            {mode === 'login' && (
              <Link href="/auth/recover" className="ac__recover">
                نسيت كلمة السر؟
              </Link>
            )}
          </form>

          <div className="ac__session">
            <span className="ac__session-icon">🛡</span>
            <div>
              <strong>الجلسة بتفضل شغالة</strong>
              <small>لما تدخل مرة، EAH بيحافظ على جلستك — لحد ما تسجل خروج بإيدك.</small>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
