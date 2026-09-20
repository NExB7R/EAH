'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import './locked-content.css'

type Props = {
  children: React.ReactNode
  /** النص اللي يظهر للزائر */
  title?: string
  /** وصف قصير */
  hint?: string
  /** ارتفاع تقريبي للمحتوى المقفول */
  minHeight?: number
  /** مسار الرجوع بعد التسجيل */
  redirectTo?: string
}

export default function LockedContent({
  children,
  title = 'سجّل عشان تشوف ده',
  hint = 'ثانية واحدة بس — رقم موبايل وكلمة سر، وخلاص',
  minHeight = 200,
  redirectTo,
}: Props) {
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let alive = true
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (alive) setAuthed(!!user)
    })()
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session?.user)
    })
    return () => { alive = false; sub.subscription.unsubscribe() }
  }, [])

  if (authed === null) {
    return <div className="lc lc--loading" style={{ minHeight }} />
  }

  if (authed) return <>{children}</>

  const next = redirectTo ?? (typeof window !== 'undefined' ? window.location.pathname : '/')
  const href = `/auth?next=${encodeURIComponent(next)}`

  return (
    <div className="lc" style={{ minHeight }}>
      <div className="lc__blur" aria-hidden>
        {children}
      </div>

      <div className="lc__overlay">
        <div className="lc__card">
          <span className="lc__lock" aria-hidden>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <h3 className="lc__title">{title}</h3>
          <p className="lc__hint">{hint}</p>
          <a href={href} className="lc__btn">
            <span>سجّل بسرعة</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </a>
          <span className="lc__sub">مجانًا · 5 ثواني · من غير كود تحقق</span>
        </div>
      </div>
    </div>
  )
}
