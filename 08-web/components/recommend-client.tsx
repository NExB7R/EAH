'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import EahLogo from './eah-logo'
import './recommend-client.css'

type Business = {
  slug: string
  name: string
  type?: string
  area?: string
  badge?: string
  hook?: string
  reason?: string
  open?: boolean
  score?: number
  activeOffers?: number
  is_premium?: boolean
}

type Question = {
  id: string
  title: string
  subtitle?: string
  options: { key: string; emoji: string; label: string; hint?: string }[]
  multi?: boolean
}

const QUESTIONS: Question[] = [
  {
    id: 'intent',
    title: 'نفسك في ايه؟',
    subtitle: 'اختار من اللي تحت، وإحنا نظبطلك',
    options: [
      { key: 'food', emoji: '🍽️', label: 'آكل حاجة', hint: 'مطاعم وأكل بيتي' },
      { key: 'pharmacy', emoji: '💊', label: 'دو أو صيدلية', hint: 'أدوية ومستلزمات طبية' },
      { key: 'shop', emoji: '🛒', label: 'اشترى حاجة من الماركت', hint: 'بقالة ومستلزمات' },
      { key: 'delivery', emoji: '🛵', label: 'أوصّل حاجة', hint: 'توصيل وطلبات' },
    ],
  },
  {
    id: 'budget',
    title: 'الميزانية؟',
    subtitle: 'قولنا نطاق السعر المناسب',
    options: [
      { key: 'low', emoji: '💰', label: 'اقتصادي', hint: 'أقل من 50 ج' },
      { key: 'mid', emoji: '💰💰', label: 'متوسط', hint: '50 - 150 ج' },
      { key: 'high', emoji: '💎', label: 'مميز', hint: 'أكتر من 150 ج' },
      { key: 'any', emoji: '🎯', label: 'مش مهم', hint: 'وريني كل حاجة' },
    ],
  },
  {
    id: 'mood',
    title: 'مزاجك إيه؟',
    subtitle: 'اختار اللي يشبه حالتك',
    options: [
      { key: 'new', emoji: '🌱', label: 'حاجة جديدة', hint: 'أماكن لسه مكتشفة' },
      { key: 'trending', emoji: '🔥', label: 'الترند', hint: 'اللي الناس عليه' },
      { key: 'offers', emoji: '🎁', label: 'عروض حلوة', hint: 'وفّر وأنا بطلب' },
      { key: 'nearby', emoji: '📍', label: 'قريب مني', hint: 'مش عايز أتحرك كتير' },
    ],
  },
  {
    id: 'urgency',
    title: 'مستعجل؟',
    subtitle: 'آخر سؤال ونبدأ',
    options: [
      { key: 'now', emoji: '⚡', label: 'على طول', hint: 'لازم دلوقتي' },
      { key: 'soon', emoji: '🕐', label: 'بعد شوية', hint: 'خلال ساعة' },
      { key: 'later', emoji: '🌙', label: 'بعدين', hint: 'بسجلها للمستقبل' },
    ],
  },
]

export default function RecommendClient({ businesses }: { businesses: Business[] }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)

  const currentQ = QUESTIONS[step]
  const progress = showResults ? 100 : ((step) / QUESTIONS.length) * 100

  function pick(key: string) {
    setAnswers((a) => ({ ...a, [currentQ.id]: key }))
    if (step === QUESTIONS.length - 1) {
      setShowResults(true)
    } else {
      setStep((s) => s + 1)
    }
  }

  function back() {
    if (showResults) {
      setShowResults(false)
      return
    }
    setStep((s) => Math.max(0, s - 1))
  }

  function reset() {
    setStep(0)
    setAnswers({})
    setShowResults(false)
  }

  const results = useMemo(() => {
    if (!showResults) return []
    let list = [...businesses]

    // intent filter
    const intent = answers.intent
    if (intent === 'pharmacy') list = list.filter((b) => b.type === 'pharmacy')
    else if (intent === 'delivery') list = list.filter((b) => b.type === 'delivery_office')
    else if (intent === 'shop') list = list.filter((b) => b.type === 'supermarket')
    else if (intent === 'food') list = list.filter((b) => b.type === 'restaurant')

    // mood boosts
    const mood = answers.mood
    if (mood === 'offers') list = list.filter((b) => (b.activeOffers ?? 0) > 0)
    if (mood === 'trending') list = list.filter((b) => (b.score ?? 0) > 0)

    // fallback: لو الفلاتر ضيقة، نرجع للكل
    if (list.length === 0) list = [...businesses]

    // sort by score
    list.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))

    return list.slice(0, 6)
  }, [showResults, answers, businesses])

  return (
    <div className="rc">
      {/* Progress bar */}
      <div className="rc-progress">
        <div className="rc-progress__bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="rc-shell">
        {/* Hero with logo */}
        <div className="rc-hero">
          <EahLogo size="lg" variant="full" href="/" />
          <p className="rc-hero__tagline">
            {showResults ? 'لقينالك اللي يناسبك ✨' : 'هترشحلك إيه؟'}
          </p>
        </div>

        {!showResults ? (
          <div className="rc-quiz">
            <div className="rc-quiz__step">
              <span className="rc-quiz__num">سؤال {step + 1} من {QUESTIONS.length}</span>
            </div>

            <h2 className="rc-quiz__title">{currentQ.title}</h2>
            {currentQ.subtitle && (
              <p className="rc-quiz__subtitle">{currentQ.subtitle}</p>
            )}

            <div className="rc-options">
              {currentQ.options.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  className={`rc-option ${answers[currentQ.id] === o.key ? 'is-selected' : ''}`}
                  onClick={() => pick(o.key)}
                >
                  <span className="rc-option__emoji">{o.emoji}</span>
                  <div className="rc-option__text">
                    <span className="rc-option__label">{o.label}</span>
                    {o.hint && <span className="rc-option__hint">{o.hint}</span>}
                  </div>
                  <span className="rc-option__arrow">←</span>
                </button>
              ))}
            </div>

            {step > 0 && (
              <button type="button" className="rc-back" onClick={back}>
                ← رجوع
              </button>
            )}
          </div>
        ) : (
          <div className="rc-results">
            <h2 className="rc-results__title">التوصيات ليك</h2>
            <p className="rc-results__subtitle">
              {results.length > 0
                ? `${results.length} مكان مناسب لمزاجك`
                : 'مفيش نتائج دقيقة — جرّب تغيير إجابة'}
            </p>

            {results.length === 0 ? (
              <button type="button" className="rc-reset" onClick={reset}>
                🔄 جرّب تاني
              </button>
            ) : (
              <div className="rc-cards">
                {results.map((b, i) => (
                  <Link key={b.slug} href={`/businesses/${b.slug}`} className="rc-card">
                    <span className="rc-card__rank">#{i + 1}</span>
                    <div className="rc-card__info">
                      <h3 className="rc-card__name">{b.name}</h3>
                      <span className="rc-card__meta">
                        {b.area ?? ''}
                        {b.badge && <span className="rc-card__badge">{b.badge}</span>}
                        {b.is_premium && <span className="rc-card__badge rc-card__badge--gold">⭐ مميز</span>}
                      </span>
                      {(b.hook || b.reason) && (
                        <p className="rc-card__reason">
                          ✨ {b.hook ?? b.reason}
                        </p>
                      )}
                    </div>
                    <span className="rc-card__arrow">←</span>
                  </Link>
                ))}
              </div>
            )}

            <div className="rc-results__actions">
              <button type="button" className="rc-reset" onClick={reset}>
                🔄 جرّب من تاني
              </button>
              <Link href="/explore" className="rc-explore">
                اكتشف الكل →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
