'use client'
import { FormEvent, useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import './change-password.css'
import { IcBan, IcCheckCircle, IcEye, IcLock } from '@/components/eah-icons'

function getStrength(pw: string) {
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 12) s++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  if (s <= 1) return { score: 1, label: 'ضعيفة', color: '#EF4444' }
  if (s === 2) return { score: 2, label: 'مقبولة', color: '#F97316' }
  if (s === 3) return { score: 3, label: 'جيدة', color: '#FBBF24' }
  if (s === 4) return { score: 4, label: 'قوية', color: '#A855F7' }
  return { score: 5, label: 'قوية جدًا', color: '#A855F7' }
}

export default function ChangePasswordPage() {
  const router = useRouter()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showCur, setShowCur] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const strength = useMemo(() => getStrength(next), [next])
  const mismatch = confirm.length > 0 && next !== confirm
  const canSubmit = current.length > 0 && next.length >= 8 && next !== current && next === confirm && !loading

  useEffect(() => {
    const supabase = createClient()
    void supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace('/auth?next=/auth/change-password')
    })
  }, [router])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: upErr } = await supabase.auth.updateUser({ password: next, current_password: current })
    if (upErr) { setLoading(false); setError(upErr.message || 'تعذر تغيير كلمة المرور. تأكد من كلمة المرور الحالية.'); return }
    const { error: soErr } = await supabase.auth.signOut({ scope: 'others' })
    setLoading(false)
    if (soErr) { setError('تم التغيير، لكن تعذر تسجيل خروج الأجهزة الأخرى.'); return }
    setSuccess(true); setCurrent(''); setNext(''); setConfirm('')
  }

  if (success) return (
    <main className="cpw"><div className="cpw__wrap"><section className="cpw__hero">
      <span className="cpw__kicker">EAH • الأمان</span>
      <h1 className="cpw__title"><IcCheckCircle /> تم التغيير</h1>
      <p className="cpw__lead">كلمة مرورك اتغيرت، وكل الأجهزة التانية اتطردت تلقائيًا.</p>
      <div className="cpw__success-actions">
        <Link href="/account" className="cpw__btn cpw__btn--primary">← رجوع للحساب</Link>
        <Link href="/" className="cpw__btn">الصفحة الرئيسية</Link>
      </div>
    </section></div></main>
  )

  return (
    <main className="cpw"><div className="cpw__wrap">
      <section className="cpw__hero">
        <span className="cpw__kicker">EAH • الأمان</span>
        <h1 className="cpw__title"><IcLock /> تغيير كلمة المرور</h1>
        <p className="cpw__lead">للأمان، محتاج تدخل كلمة المرور الحالية الأول. بعد التغيير، كل الأجهزة التانية هتتطرد تلقائيًا.</p>
        <div className="cpw__info">
          <span className="cpw__info-emoji">💡</span>
          <div>
            <strong className="cpw__info-title">نصائح لكلمة مرور قوية</strong>
            <ul className="cpw__info-list">
              <li>12 حرف على الأقل</li>
              <li>حروف كبيرة وصغيرة + أرقام + رموز</li>
              <li>متحطهاش حاجة شخصية</li>
              <li>مستخدمهاش في مواقع تانية</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="cpw__card">
        <form onSubmit={submit} className="cpw__form">
          <div className="cpw__field">
            <label htmlFor="current" className="cpw__label">كلمة المرور الحالية</label>
            <div className="cpw__input-wrap">
              <input id="current" type={showCur?'text':'password'} value={current} onChange={e=>setCurrent(e.target.value)} autoComplete="current-password" placeholder="••••••••" className="cpw__input cpw__input--with-btn" required />
              <button type="button" className="cpw__toggle" onClick={()=>setShowCur(v=>!v)} tabIndex={-1}>{showCur?<IcBan />:<IcEye />}</button>
            </div>
          </div>

          <div className="cpw__field">
            <label htmlFor="next" className="cpw__label">كلمة المرور الجديدة</label>
            <div className="cpw__input-wrap">
              <input id="next" type={showNew?'text':'password'} value={next} onChange={e=>setNext(e.target.value)} autoComplete="new-password" placeholder="8 أحرف على الأقل" className="cpw__input cpw__input--with-btn" required minLength={8} />
              <button type="button" className="cpw__toggle" onClick={()=>setShowNew(v=>!v)} tabIndex={-1}>{showNew?<IcBan />:<IcEye />}</button>
            </div>
            {next.length > 0 && (
              <div className="cpw__strength">
                <div className="cpw__strength-bar"><div className="cpw__strength-fill" style={{width:`${strength.score*20}%`,background:strength.color}} /></div>
                <span className="cpw__strength-label" style={{color:strength.color}}>{strength.label}</span>
              </div>
            )}
          </div>

          <div className="cpw__field">
            <label htmlFor="confirm" className="cpw__label">تأكيد كلمة المرور</label>
            <div className="cpw__input-wrap">
              <input id="confirm" type={showConf?'text':'password'} value={confirm} onChange={e=>setConfirm(e.target.value)} autoComplete="new-password" placeholder="كرر كلمة المرور" className={`cpw__input cpw__input--with-btn ${mismatch?'cpw__input--error':''}`} required />
              <button type="button" className="cpw__toggle" onClick={()=>setShowConf(v=>!v)} tabIndex={-1}>{showConf?<IcBan />:<IcEye />}</button>
            </div>
            {mismatch && <span className="cpw__error">كلمتا المرور مش متطابقتين</span>}
          </div>

          {error && <div className="cpw__alert">{error}</div>}
          <button type="submit" className="cpw__submit" disabled={!canSubmit}>{loading?'جاري التغيير…':'غيّر كلمة المرور'}</button>
          <Link href="/account" className="cpw__back">← رجوع للحساب</Link>
        </form>
      </section>
    </div></main>
  )
}
