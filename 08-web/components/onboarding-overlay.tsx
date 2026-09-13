'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

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
      <div className="onb__backdrop" />
      <div className="onb__card">
        {step === 0 && (
          <>
            <span className="onb__emoji">👋</span>
            <h2 className="onb__title">أهلاً بيك في EAH!</h2>
            <p className="onb__text">
              إحنا هنا نساعدك تلاقي أحلى المطاعم والصيدليات ومكاتب التوصيل في شبين القناطر.
            </p>
            <button className="onb__btn onb__btn--primary" onClick={() => setStep(1)}>
              يلا نبدأ ←
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <span className="onb__emoji">🎯</span>
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
              <button className="onb__btn onb__btn--primary" onClick={() => setStep(2)}>كمّل ←</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <span className="onb__emoji">🎁</span>
            <h2 className="onb__title">هدية الترحيب</h2>
            <p className="onb__text">
              كل يوم تدخل EAH، بتكسب <strong>نقاط</strong>.
              <br />
              كل ما تكمل أيام متتالية، الجايزة تكبر!
            </p>
            <div className="onb__rewards">
              <div className="onb__reward"><span>🔥</span> 7 أيام = 10 نقاط</div>
              <div className="onb__reward"><span>🔥🔥</span> 14 يوم = 15 نقطة</div>
              <div className="onb__reward"><span>💎</span> 30 يوم = 20 نقطة</div>
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
