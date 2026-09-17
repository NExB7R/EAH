'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import EahLogo from './eah-logo'
import './onboarding-overlay.css'

type Step = 0 | 1 | 2 | 3

const INTERESTS = [
  { key: 'restaurant', emoji: '', label: 'مطاعم' },
  { key: 'pharmacy', emoji: '', label: 'صيدليات' },
  { key: 'delivery', emoji: '', label: 'توصيل' },
  { key: 'supermarket', emoji: '', label: 'ماركت' },
  { key: 'offers', emoji: '', label: 'عروض' },
  { key: 'new', emoji: '', label: 'جديد' },
  { key: 'trends', emoji: '', label: 'ترند' },
  { key: 'coffee', emoji: '', label: 'كافيهات' },
]

const AREAS = [
  { key: 'shibin', label: 'شبين القناطر' },
  { key: 'qalag', label: 'القلج' },
  { key: 'jabal_asfar', label: 'الجبل الأصفر' },
  { key: 'kafr_bata', label: 'كفر بطا' },
  { key: 'nawa', label: 'نوى' },
  { key: 'taha', label: 'طحا' },
  { key: 'manshaat_karam', label: 'منشأة الكرام' },
  { key: 'abu_zaabal', label: 'أبو زعبل' },
]

const BUDGETS = [
  { key: 'low', emoji: '', label: 'اقتصادي', hint: 'أقل من 50ج' },
  { key: 'mid', emoji: '', label: 'متوسط', hint: '50 - 150ج' },
  { key: 'high', emoji: '', label: 'مميز', hint: 'أكتر من 150ج' },
]

export default function OnboardingOverlay() {
  const [step, setStep] = useState<Step>(0)
  const [show, setShow] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [area, setArea] = useState<string | null>(null)
  const [budget, setBudget] = useState<string | null>(null)
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
      const tags = [
        ...selected,
        ...(area ? [`area:${area}`] : []),
        ...(budget ? [`budget:${budget}`] : []),
      ]
      await supabase.from('profiles').update({
        onboarding_done: true,
        interests: tags,
      }).eq('id', user.id)
    }
    setSaving(false)
    setShow(false)
  }

  if (!show) return null

  const progress = [0, 1, 2, 3]
  const canProceedStep2 = area !== null && budget !== null

  return (
    <div className="onb">
      <div className="onb__backdrop" onClick={() => {}} />
      <div className="onb__glow onb__glow--1" aria-hidden />
      <div className="onb__glow onb__glow--2" aria-hidden />

      <div className="onb__card">
        <div className="onb__progress">
          {progress.map(i => (
            <div key={i} className={`onb__dot ${i <= step ? 'is-active' : ''}`} />
          ))}
        </div>

        {step === 0 && (
          <>
            <div className="onb__logo">
              <EahLogo size="lg" variant="full" href="/" />
            </div>
            <h2 className="onb__title">
              أهلاً بيك {name ? `يا ${name}` : 'في EAH'}
            </h2>
            <p className="onb__text">
              إحنا هنا نساعدك تلاقي أحلى <strong>مطاعم</strong>، <strong>صيدليات</strong>، و<strong>توصيل</strong> في شبين القناطر.
            </p>
            <div className="onb__features">
              <div className="onb__feature">
                <span className="onb__feature-emoji"></span>
                <span className="onb__feature-text">اكتشف أماكن جديدة</span>
              </div>
              <div className="onb__feature">
                <span className="onb__feature-emoji"></span>
                <span className="onb__feature-text">قيّم وشارك تجربتك</span>
              </div>
              <div className="onb__feature">
                <span className="onb__feature-emoji"></span>
                <span className="onb__feature-text">اكسب نقاط كل يوم</span>
              </div>
            </div>
            <button className="onb__btn onb__btn--primary" onClick={() => setStep(1)}>
              يلا نبدأ
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <span className="onb__step-emoji"></span>
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
            <span className="onb__step-emoji"></span>
            <h2 className="onb__title">أنت منين؟</h2>
            <p className="onb__text">نرشّحلك الأقرب ليك</p>
            <div className="onb__interests">
              {AREAS.map(a => (
                <button
                  key={a.key}
                  type="button"
                  className={`onb__interest ${area === a.key ? 'is-selected' : ''}`}
                  onClick={() => setArea(a.key)}
                >
                  <span>{a.label}</span>
                </button>
              ))}
            </div>

            <h2 className="onb__title" style={{ marginTop: 24 }}>ميزانيتك؟</h2>
            <div className="onb__budgets">
              {BUDGETS.map(b => (
                <button
                  key={b.key}
                  type="button"
                  className={`onb__budget ${budget === b.key ? 'is-selected' : ''}`}
                  onClick={() => setBudget(b.key)}
                >
                  <span className="onb__budget-emoji">{b.emoji}</span>
                  <strong>{b.label}</strong>
                  <small>{b.hint}</small>
                </button>
              ))}
            </div>

            <div className="onb__actions">
              <button className="onb__btn onb__btn--ghost" onClick={() => setStep(1)}>← رجوع</button>
              <button
                className="onb__btn onb__btn--primary"
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
              >
                كمّل ←
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <span className="onb__step-emoji"></span>
            <h2 className="onb__title">هدية الترحيب</h2>
            <p className="onb__text">
              كل يوم تدخل EAH بتكسب <strong>نقاط</strong>.
              <br />
              كل ما تكمل أيام متتالية، الجايزة تكبر!
            </p>
            <div className="onb__rewards">
              <div className="onb__reward">
                <span className="onb__reward-icon"></span>
                <div>
                  <strong>7 أيام</strong>
                  <span>+10 نقطة</span>
                </div>
              </div>
              <div className="onb__reward">
                <span className="onb__reward-icon"></span>
                <div>
                  <strong>14 يوم</strong>
                  <span>+15 نقطة</span>
                </div>
              </div>
              <div className="onb__reward">
                <span className="onb__reward-icon"></span>
                <div>
                  <strong>30 يوم</strong>
                  <span>+20 نقطة</span>
                </div>
              </div>
            </div>
            <div className="onb__actions">
              <button className="onb__btn onb__btn--ghost" onClick={() => setStep(2)}>← رجوع</button>
              <button
                className="onb__btn onb__btn--primary"
                onClick={finish}
                disabled={saving}
              >
                {saving ? '...' : 'ابدأ الرحلة'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
