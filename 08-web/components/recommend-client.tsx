'use client'
import { useState } from 'react'
import Link from 'next/link'
import ExploreCard from './explore-card'
import './recommend-client.css'

type Business = {
  slug: string
  name: string
  type: 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office'
  area: string
  badge?: string
  vibe: string[]
  reason: string
  open: boolean
  score?: number
  activeOffers?: number
  hook?: string
}

type Step = {
  key: string
  title: string
  options: { value: string; label: string; emoji: string }[]
}

const STEPS: Step[] = [
  {
    key: 'intent',
    title: 'نفسك في ايه؟',
    options: [
      { value: 'eat', label: 'آكل حاجة', emoji: '🍽️' },
      { value: 'drink', label: 'أشرب حاجة', emoji: '☕' },
      { value: 'medicine', label: 'دوا أو صيدلية', emoji: '💊' },
            { value: 'deliver', label: 'أوصّل حاجة', emoji: '🛵' },
    ],
  },
  {
    key: 'budget',
    title: 'الميزانية؟',
    options: [
      { value: 'low', label: 'اقتصادي', emoji: '💰' },
      { value: 'mid', label: 'متوسط', emoji: '💵' },
      { value: 'high', label: 'مستعد أصرف', emoji: '💎' },
    ],
  },
  {
    key: 'time',
    title: 'مستعجل؟',
    options: [
      { value: 'fast', label: 'على السريع', emoji: '⚡' },
      { value: 'chill', label: 'خد وقتك', emoji: '☕' },
    ],
  },
  {
    key: 'adventure',
    title: 'نفسك في؟',
    options: [
      { value: 'familiar', label: 'حاجة أعرفها', emoji: '❤️' },
      { value: 'new', label: 'أجرّب جديد', emoji: '✨' },
    ],
  },
]

export default function RecommendClient({ businesses }: { businesses: Business[] }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const select = (key: string, value: string) => {
    const next = { ...answers, [key]: value }
    setAnswers(next)
    if (step < STEPS.length - 1) {
      setTimeout(() => setStep(step + 1), 200)
    } else {
      setTimeout(() => setStep(STEPS.length), 200)
    }
  }

  const reset = () => {
    setAnswers({})
    setStep(0)
  }

  const recommend = () => {
    let filtered = [...businesses]
    const intent = answers.intent

    if (intent === 'eat' || intent === 'drink') filtered = filtered.filter((b) => b.type === 'restaurant')
    else if (intent === 'medicine') filtered = filtered.filter((b) => b.type === 'pharmacy')
    
    if (answers.time === 'fast') filtered = filtered.filter((b) => b.open)
    if (answers.adventure === 'new') filtered.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    if (answers.budget === 'low') filtered.sort((a, b) => (a.score ?? 0) - (b.score ?? 0))

    return filtered.slice(0, 6)
  }

  const done = step >= STEPS.length
  const results = done ? recommend() : []

  return (
    <div className="rec">
      {!done ? (
        <div className="rec__flow">
          <div className="rec__progress">
            <div className="rec__progress-bar" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>

          <div className="rec__step">
            <span className="rec__step-num">سؤال {step + 1} من {STEPS.length}</span>
            <h2 className="rec__step-title">{STEPS[step].title}</h2>

            <div className="rec__options">
              {STEPS[step].options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`rec__option ${answers[STEPS[step].key] === o.value ? 'is-picked' : ''}`}
                  onClick={() => select(STEPS[step].key, o.value)}
                >
                  <span className="rec__option-emoji">{o.emoji}</span>
                  <span className="rec__option-label">{o.label}</span>
                </button>
              ))}
            </div>

            {step > 0 && (
              <button type="button" className="rec__back" onClick={() => setStep(step - 1)}>
                ← سؤال سابق
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="rec__results">
          <div className="rec__results-head">
            <h2 className="rec__results-title">✨ رشحنا لك {results.length} مكان</h2>
            <button type="button" className="rec__reset" onClick={reset}>
              🔄 جرّب تاني
            </button>
          </div>

          {results.length > 0 ? (
            <div className="rec__grid">
              {results.map((b) => (
                <ExploreCard key={b.slug} business={b} size="lg" />
              ))}
            </div>
          ) : (
            <div className="rec__empty">
              <span style={{ fontSize: '3rem' }}>🤔</span>
              <p>مفيش نتائج مطابقة — جرّب تغيّر اختياراتك</p>
              <button type="button" className="admin-btn admin-btn--primary" onClick={reset}>
                🔄 ابدأ من جديد
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
