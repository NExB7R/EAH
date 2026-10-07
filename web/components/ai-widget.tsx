'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { CrownGoldIcon, CloseIcon, SendIcon, AlertIcon } from './icons'
import styles from './ai-widget.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — AI Widget (Floating Assistant)
// ═══════════════════════════════════════════════════════════

type Msg = { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'عايز مطعم بيتزا',
  'صيدلية قريبة مني',
  'إيه أخبار نقاطي؟',
  'ماركت مفتوح دلوقتي',
]

export default function AiWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Msg[]>([])
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, pending])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  const send = (text: string) => {
    const msg = text.trim()
    if (!msg || pending) return
    setError(null)
    setInput('')

    const history = messages.slice(-6)
    setMessages((m) => [...m, { role: 'user', content: msg }])

    startTransition(async () => {
      try {
        const res = await fetch('/api/ai/chat', {
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

  return (
    <>
      <button
        type="button"
        className={`${styles.fab} ${open ? styles.fabHidden : ''}`}
        onClick={() => setOpen(true)}
        aria-label="مساعد EAH الذكي"
      >
        <CrownGoldIcon size={22} />
        <span className={styles.fabLabel}>مساعد</span>
      </button>

      {open && (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} aria-hidden />

          <div className={styles.panel} role="dialog" aria-modal="true">
            <header className={styles.header}>
              <span className={styles.headerIcon}>
                <CrownGoldIcon size={18} />
              </span>
              <div className={styles.headerText}>
                <h3 className={styles.headerTitle}>مساعد EAH</h3>
                <p className={styles.headerSub}>اسأل عن أي نشاط أو خدمة</p>
              </div>
              <button
                type="button"
                className={styles.close}
                onClick={() => setOpen(false)}
                aria-label="إغلاق"
              >
                <CloseIcon size={16} />
              </button>
            </header>

            <div ref={scrollRef} className={styles.messages}>
              {messages.length === 0 && (
                <div className={styles.empty}>
                  <span className={styles.emptyIcon}>
                    <CrownGoldIcon size={28} />
                  </span>
                  <p className={styles.emptyText}>
                    اسألني أي حاجة عن EAH — مطاعم، صيدليات، نقاط، أو أي خدمة
                  </p>
                  <div className={styles.suggestions}>
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className={styles.suggestion}
                      >
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
                      <CrownGoldIcon size={12} />
                    </span>
                  )}
                  <div className={styles.bubble}>{m.content}</div>
                </div>
              ))}

              {pending && (
                <div className={`${styles.msg} ${styles.msgAi}`}>
                  <span className={styles.msgAvatar}>
                    <CrownGoldIcon size={12} />
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
                ref={inputRef}
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
        </>
      )}
    </>
  )
}
