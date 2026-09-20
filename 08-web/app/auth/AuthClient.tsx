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

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
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

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

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
              phone_e164: cleanPhone,
              display_name: name.trim(),
              gender,
            },
          },
        })
        if (e1) {
          const msg = e1.message
          if (msg.includes('already registered') || msg.includes('already been registered')) {
            setError('الرقم ده مسجل بالفعل — جرّب تدخل بدل ما تسجل')
          } else {
            setError(msg)
          }
          return
        }
        if (!data.user) { setError('حصلت مشكلة، حاول تاني'); return }
        router.replace(next)
        router.refresh()
        return
      }

      const { error: e2 } = await supabase.auth.signInWithPassword({ email, password })
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
        {/* ═══ يسار: الفورم ═══ */}
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
              <div className="ac__pass-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8 حروف أو أكتر"
                  minLength={8}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="ac__eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'إخفاء كلمة السر' : 'إظهار كلمة السر'}
                  tabIndex={-1}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </label>

            {mode === 'signup' && (
              <label className="ac__field">
                <span className="ac__label">تأكيد كلمة السر</span>
                <div className="ac__pass-wrap">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="كرّر كلمة السر"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="ac__eye"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? 'إخفاء' : 'إظهار'}
                    tabIndex={-1}
                  >
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
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

        {/* ═══ يمين: المميزات ═══ */}
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
              ? 'رقمك + كلمة السر — وخلاص. من غير كود ولا SMS.'
              : 'اسمك + رقمك + كلمة سر. 5 ثواني وتبقى جوه.'}
          </p>

          <div className="ac__perks-cards">
            {/* ═══ كارت 1: لك كعميل ═══ */}
            <div className="ac__perk-card">
              <div className="ac__perk-head">
                <span className="ac__perk-icon-wrap ac__perk-icon-wrap--purple">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <h3 className="ac__perk-title">لك كعميل</h3>
              </div>
              <ul className="ac__perk-list">
                <li>شوف أرقام كل مكان + الواتساب + الموقع الدقيق</li>
                <li>كوبونات وخصومات حصرية لأعضاء EAH</li>
                <li>احفظ الأماكن المفضلة — رجعلها من أي جهاز</li>
                <li>اجمع نقاط مع كل تفاعل</li>
              </ul>
            </div>

            {/* ═══ كارت 2: لأصحاب الأنشطة ═══ */}
            <div className="ac__perk-card ac__perk-card--gold">
              <div className="ac__perk-head">
                <span className="ac__perk-icon-wrap ac__perk-icon-wrap--gold">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l1.5-5h15L21 9" />
                    <path d="M3 9v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9" />
                    <path d="M3 9h18" />
                    <path d="M9 13h6" />
                  </svg>
                </span>
                <h3 className="ac__perk-title">لصاحب نشاط</h3>
              </div>
              <ul className="ac__perk-list">
                <li>سجّل نشاطك مجاناً — صفحة كاملة بلوجو وصور ومنيو</li>
                <li>وصلك أوردرات مباشر على واتسابك بدون وسيط</li>
                <li>تحكم كامل في العروض والكوبونات</li>
                <li>لوحة إحصائيات وتقارير بالزيارات</li>
              </ul>
            </div>

            {/* ═══ كارت 3: مفيش تعقيد ═══ */}
            <div className="ac__perk-card ac__perk-card--compact">
              <div className="ac__perk-head">
                <span className="ac__perk-icon-wrap ac__perk-icon-wrap--green">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </span>
                <h3 className="ac__perk-title">سريع ومباشر</h3>
              </div>
              <div className="ac__perk-inline">
                <span>بدون كود تحقق</span>
                <span>بدون SMS</span>
                <span>دخول تلقائي على كل أجهزتك</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
