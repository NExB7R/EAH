'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import EahLogo from './eah-logo'
import './onboarding-overlay.css'

type Step = 0 | 1 | 2

const INTERESTS = [
  { key: 'restaurant', emoji: '🍽️', label: 'مطاعم' },
  { key: 'pharmacy', emoji: '💊', label: 'صيدليات' },
  { key: 'delivery', emoji: '🛵', label: 'توصيل' },
  { key: 'offers', emoji: '🔥', label: 'عروض' },
  { key: 'new', emoji: '🌱', label: 'جديد' },
  { key: 'trends', emoji: '📈', label: 'ترند' },
]

export default function OnboardingOverlay() {
  const [step, setStep] = useState<Step>(0)
  const [show, setShow] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    const supabase = createClient()
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase
        .from('profiles')
        .select('onboarding_done,display_name')
        .eq('id', user.id)
        .maybeSingle()
      if (p && !p.onboarding_done) {
        setName(p.display_name?.split(' ')[0] ?? '')
        setShow(true)
      }
    })()
  }, [])

  function toggleInterest(k: string) {
    setSelected(s => s.includes(k) ? s.filter(x => x !== k) : [...s, k])
  }

  async function finish() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({
        onboarding_done: true,
        interests: selected,
      }).eq('id', user.id)
    }
    setSaving(false)
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="onb">
      <div className="onb__backdrop" onClick={() => {}} />

      {/* Glow effects */}
      <div className="onb__glow onb__glow--1" aria-hidden />
      <div className="onb__glow onb__glow--2" aria-hidden />

      <div className="onb__card">
        {/* Progress */}
        <div className="onb__progress">
          {[0, 1, 2].map(i => (
            <div key={i} className={`onb__dot ${i <= step ? 'is-active' : ''}`} />
          ))}
        </div>

        {step === 0 && (
          <>
            <div className="onb__logo">
              <EahLogo size="lg" variant="full" href="/" />
            </div>
            <h2 className="onb__title">
              أهلاً بيك {name ? `يا ${name}` : 'في EAH'} 👋
            </h2>
            <p className="onb__text">
              إحنا هنا نساعدك تلاقي أحلى <strong>مطاعم</strong>، <strong>صيدليات</strong>، و<strong>توصيل</strong> في شبين القناطر.
            </p>
            <div className="onb__features">
              <div className="onb__feature">
                <span className="onb__feature-emoji">🔍</span>
                <span className="onb__feature-text">اكتشف أماكن جديدة</span>
              </div>
              <div className="onb__feature">
                <span className="onb__feature-emoji">⭐</span>
                <span className="onb__feature-text">قيّم وشارك تجربتك</span>
              </div>
              <div className="onb__feature">
                <span className="onb__feature-emoji">🎁</span>
                <span className="onb__feature-text">اكسب نقاط كل يوم</span>
              </div>
            </div>
            <button className="onb__btn onb__btn--primary" onClick={() => setStep(1)}>
              يلا نبدأ ⚡
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <span className="onb__step-emoji">🎯</span>
            <h2 className="onb__title">بتحب إيه؟</h2>
            <p className="onb__text">اختار اللي يهمك ونرشّحلك على أساسه</p>
            <div className="onb__interests">
              {INTERESTS.map(i => (
                <button
                  key={i.key}
                  type="button"
                  className={`onb__interest ${selected.includes(i.key) ? 'is-selected' : ''}`}
                  onClick={() => toggleInterest(i.key)}
                >
                  <span className="onb__interest-emoji">{i.emoji}</span>
                  <span>{i.label}</span>
                </button>
              ))}
            </div>
            <div className="onb__actions">
              <button className="onb__btn onb__btn--ghost" onClick={() => setStep(0)}>← رجوع</button>
              <button className="onb__btn onb__btn--primary" onClick={() => setStep(2)}>
                كمّل ←
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <span className="onb__step-emoji">🎁</span>
            <h2 className="onb__title">هدية الترحيب</h2>
            <p className="onb__text">
              كل يوم تدخل EAH بتكسب <strong>نقاط</strong>.
              <br />
              كل ما تكمل أيام متتالية، الجايزة تكبر!
            </p>
            <div className="onb__rewards">
              <div className="onb__reward">
                <span className="onb__reward-icon">🔥</span>
                <div>
                  <strong>7 أيام</strong>
                  <span>+10 نقطة</span>
                </div>
              </div>
              <div className="onb__reward">
                <span className="onb__reward-icon">🔥🔥</span>
                <div>
                  <strong>14 يوم</strong>
                  <span>+15 نقطة</span>
                </div>
              </div>
              <div className="onb__reward">
                <span className="onb__reward-icon">💎</span>
                <div>
                  <strong>30 يوم</strong>
                  <span>+20 نقطة</span>
                </div>
              </div>
            </div>
            <button
              className="onb__btn onb__btn--primary"
              onClick={finish}
              disabled={saving}
            >
              {saving ? '...' : 'ابدأ الرحلة ⚡'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
