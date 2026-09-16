'use client'
import { useEffect, useState } from 'react'
import './smart-bot.css'
import { generateReply, buildContext } from '@/lib/bot/intent-matcher'

type Msg = { from: 'bot' | 'user'; text: string; actions?: { label: string; href: string }[] }

const GREETING: Msg = {
  from: 'bot',
  text: 'أهلاً! أنا "B7R" — B7R مساعدك الذكي. قوللي بتدور على إيه وأنا أوصلك أسرع.',
  actions: [
    { label: '🔍 اكتشف أماكن', href: '/explore' },
    { label: '🔥 شوف مولعة', href: '/trends' },
    { label: '🏪 عندي نشاط', href: '/merchant/apply' },
  ],
}

const QUICK = [
  { label: '🍽️ عايز أكل', q: 'عايز أكل' },
  { label: '💊 صيدلية قريبة', q: 'صيدلية قريبة' },
  { label: '🛒 ماركت', q: 'ماركت' },
  { label: '💬 كلموني', q: 'كلموني' },
]

export default function SmartBot() {
  const [open, setOpen] = useState(false)
  const [hint, setHint] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([GREETING])
  const [input, setInput] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setHint(true), 8000)
    const t2 = setTimeout(() => setHint(false), 16000)
    return () => { clearTimeout(t); clearTimeout(t2) }
  }, [])

  function send(q?: string) {
    const text = (q ?? input).trim()
    if (!text) return
    const user: Msg = { from: 'user', text }
    const ctx = buildContext()
    const res = generateReply(text, ctx)
    const bot: Msg = {
      from: 'bot',
      text: res.text,
      actions: (res.quickReplies ?? [])
        .filter((r) => r.action === 'link')
        .map((r) => ({ label: r.label, href: r.value })),
    }
    setMsgs((p) => [...p, user, bot])
    setInput('')
    setHint(false)
  }

  return (
    <>
      {hint && !open && (
        <div className="sb-hint" onClick={() => setOpen(true)}>
          <span className="sb-hint__emoji">👋</span>
          <span>أنا B7R — أقدر أساعدك؟</span>
        </div>
      )}

      {open && (
        <div className="sb-panel">
          <header className="sb-header">
            <span className="sb-avatar" aria-hidden>
              <svg viewBox="0 0 48 48" width="30" height="30" fill="none">
                <defs>
                  <linearGradient id="sbGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#A855F7"/>
                    <stop offset="100%" stopColor="#E8C79A"/>
                  </linearGradient>
                </defs>
                <circle cx="24" cy="24" r="20" stroke="url(#sbGrad)" strokeWidth="1.5" opacity=".5" fill="none"/>
                <circle cx="24" cy="20" r="6" fill="url(#sbGrad)"/>
                <path d="M12 40c2-7 7-10 12-10s10 3 12 10" fill="url(#sbGrad)" opacity=".85"/>
                <circle cx="24" cy="4" r="1.8" fill="#E8C79A"/>
                <path d="M24 6 L24 10" stroke="#E8C79A" strokeWidth="1"/>
                <circle cx="20" cy="8" r="1" fill="#A855F7"/>
                <circle cx="28" cy="8" r="1" fill="#A855F7"/>
              </svg>
            </span>
            <div className="sb-header-text">
              <strong>B7R</strong>
              <small>مساعد B7R الذكي</small>
            </div>
            <button type="button" className="sb-close" onClick={() => setOpen(false)} aria-label="إغلاق">×</button>
          </header>

          <div className="sb-body">
            {msgs.map((m, i) => (
              <div key={i} className={`sb-msg sb-msg--${m.from}`}>
                {m.text}
                {m.actions && (
                  <div className="sb-actions">
                    {m.actions.map((a) => (
                      <a key={a.href} href={a.href} className="sb-action">{a.label}</a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="sb-quick">
            {QUICK.map((q) => (
              <button key={q.q} type="button" className="sb-quick__btn" onClick={() => send(q.q)}>
                {q.label}
              </button>
            ))}
          </div>

          <form className="sb-form" onSubmit={(e) => { e.preventDefault(); send() }}>
            <input
              className="sb-input"
              placeholder="اكتب سؤالك..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="sb-send" aria-label="إرسال">➤</button>
          </form>
        </div>
      )}

      <button
        type="button"
        className={`sb-trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((p) => !p)}
        aria-label="مساعد B7R"
      >
        <span className="sb-trigger__glow" aria-hidden />
        <svg viewBox="0 0 48 48" width="32" height="32" fill="none">
          <defs>
            <linearGradient id="sbGradF" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#A855F7"/>
              <stop offset="100%" stopColor="#E8C79A"/>
            </linearGradient>
          </defs>
          <circle cx="24" cy="20" r="6" fill="url(#sbGradF)"/>
          <path d="M12 40c2-7 7-10 12-10s10 3 12 10" fill="url(#sbGradF)" opacity=".9"/>
          <circle cx="24" cy="4" r="2" fill="#E8C79A"/>
          <path d="M24 6v4" stroke="#E8C79A" strokeWidth="1"/>
          <circle cx="20" cy="8" r="1.2" fill="#A855F7"/>
          <circle cx="28" cy="8" r="1.2" fill="#A855F7"/>
        </svg>
      </button>
    </>
  )
}
