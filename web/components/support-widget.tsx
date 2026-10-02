'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { MessageCircleIcon, SendIcon, AlertIcon, ShieldCheckIcon } from './icons'
import styles from './support-widget.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Support Widget (Inline — للـ /help)
// ═══════════════════════════════════════════════════════════

type Msg = { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'إزاي أفعّل الإشعارات؟',
  'نسيت كلمة السر',
  'إيه فرق الباقات؟',
  'إزاي أكسب نقاط؟',
]

export default function SupportWidget() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, pending])

  const send = (text: string) => {
    const msg = text.trim()
    if (!msg || pending) return
    setError(null)
    setInput('')

    const history = messages.slice(-6)
    setMessages((m) => [...m, { role: 'user', content: msg }])

    startTransition(async () => {
      try {
        const res = await fetch('/api/ai/support', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, history }),
        })
        const data = await res.json()
        if (data.ok) {
          setMessages((m) => [...m, { role: 'assistant', content: data.reply }])
        } else {
          setError(data.error ?? 'حصلت مشكلة')
        }
      } catch {
        setError('الاتصال فشل — جرب تاني')
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    send(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const reset = () => {
    setMessages([])
    setInput('')
    setError(null)
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <span className={styles.headerIcon}>
          <ShieldCheckIcon size={20} />
        </span>
        <div className={styles.headerText}>
          <h3 className={styles.headerTitle}>مساعد الدعم الفني</h3>
          <p className={styles.headerSub}>اسأل أي سؤال — رد فوري بدون انتظار</p>
        </div>
        {messages.length > 0 && (
          <button type="button" onClick={reset} className={styles.resetBtn}>
            جديد
          </button>
        )}
      </header>

      <div ref={scrollRef} className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>
              <MessageCircleIcon size={32} />
            </span>
            <p className={styles.emptyText}>
              أهلاً! اسألني أي سؤال عن EAH — تسجيل، نقاط، إشعارات، باقات، أو أي حاجة تانية.
            </p>
            <div className={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)} className={styles.suggestion}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`${styles.msg} ${m.role === 'user' ? styles.msgUser : styles.msgAi}`}
          >
            {m.role === 'assistant' && (
              <span className={styles.msgAvatar}>
                <ShieldCheckIcon size={12} />
              </span>
            )}
            <div className={styles.bubble}>{m.content}</div>
          </div>
        ))}

        {pending && (
          <div className={`${styles.msg} ${styles.msgAi}`}>
            <span className={styles.msgAvatar}>
              <ShieldCheckIcon size={12} />
            </span>
            <div className={styles.bubble}>
              <span className={styles.typing}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <AlertIcon size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب سؤالك…"
          maxLength={500}
          rows={1}
          className={styles.input}
          disabled={pending}
          dir="rtl"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className={styles.sendBtn}
          aria-label="إرسال"
        >
          <SendIcon size={16} />
        </button>
      </form>
    </div>
  )
}
