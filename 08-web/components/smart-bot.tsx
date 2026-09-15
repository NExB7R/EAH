'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  loadHistory,
  saveHistory,
  clearHistory,
  generateReply,
  buildContext,
  type Message,
} from '@/lib/bot/intent-matcher'
import {
  BOT_GREETING,
  BOT_QUICK_START,
} from '@/lib/bot/knowledge-base'
import './smart-bot.css'

export default function SmartBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // تحميل المحادثة القديمة عند الفتح
  useEffect(() => {
    if (!open) return
    const history = loadHistory()
    if (history.length > 0) {
      setMessages(history)
    } else {
      setMessages([
        {
          id: 'welcome',
          role: 'bot',
          text: BOT_GREETING,
          timestamp: Date.now(),
          quickReplies: BOT_QUICK_START,
        },
      ])
    }
    // focus
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  // حفظ عند كل تغيير
  useEffect(() => {
    if (messages.length > 0) saveHistory(messages)
  }, [messages])

  // scroll تلقائي
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, typing])

  function send(text: string) {
    const t = text.trim()
    if (!t || typing) return

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: t,
      timestamp: Date.now(),
    }
    setMessages((m) => [...m, userMsg])
    setInput('')

    // typing effect
    setTyping(true)
    setTimeout(() => {
      const ctx = buildContext()
      const reply = generateReply(t, ctx)
      setMessages((m) => [...m, reply])
      setTyping(false)
    }, 600 + Math.random() * 500)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    send(input)
  }

  function handleQuickReply(qr: { label: string; action: 'reply' | 'link'; value: string }) {
    if (qr.action === 'reply') {
      send(qr.value)
    } else if (qr.action === 'link') {
      if (qr.value.startsWith('/')) {
        window.location.href = qr.value
      } else {
        window.open(qr.value, '_blank', 'noreferrer')
      }
    }
  }

  function handleReset() {
    if (!confirm('تحب تمسح كل المحادثة؟')) return
    clearHistory()
    setMessages([
      {
        id: 'welcome-new',
        role: 'bot',
        text: BOT_GREETING,
        timestamp: Date.now(),
        quickReplies: BOT_QUICK_START,
      },
    ])
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        className={`sb-trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'إغلاق المساعد' : 'افتح المساعد الذكي'}
        title="المساعد الذكي"
      >
        <span className="sb-trigger__icon" aria-hidden>
          {open ? (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          )}
        </span>
        {!open && <span className="sb-trigger__pulse" aria-hidden />}
      </button>

      {/* Panel */}
      {open && (
        <div className="sb-panel" role="dialog" aria-label="المساعد الذكي">
          {/* Header */}
          <header className="sb-header">
            <div className="sb-header__avatar" aria-hidden>
              <span>✨</span>
            </div>
            <div className="sb-header__info">
              <span className="sb-header__title">مساعد EAH</span>
              <span className="sb-header__status">
                <span className="sb-dot" />
                متاح دلوقتي
              </span>
            </div>
            <button
              type="button"
              className="sb-header__reset"
              onClick={handleReset}
              aria-label="مسح المحادثة"
              title="محادثة جديدة"
            >
              🔄
            </button>
          </header>

          {/* Messages */}
          <div className="sb-messages" ref={scrollRef}>
            {messages.map((m) => (
              <div key={m.id} className={`sb-msg sb-msg--${m.role}`}>
                <div className="sb-msg__bubble">
                  {m.text.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < m.text.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
                {m.quickReplies && m.quickReplies.length > 0 && (
                  <div className="sb-quick">
                    {m.quickReplies.map((qr, i) => (
                      <button
                        key={i}
                        type="button"
                        className="sb-quick__btn"
                        onClick={() => handleQuickReply(qr)}
                      >
                        {qr.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {typing && (
              <div className="sb-msg sb-msg--bot">
                <div className="sb-msg__bubble sb-msg__bubble--typing">
                  <span className="sb-typing-dot" />
                  <span className="sb-typing-dot" />
                  <span className="sb-typing-dot" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form className="sb-input-wrap" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              className="sb-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب سؤالك..."
              maxLength={200}
              disabled={typing}
            />
            <button
              type="submit"
              className="sb-send"
              disabled={!input.trim() || typing}
              aria-label="إرسال"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  )
}
