'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchIcon, MicIcon, SparkleStarIcon, CloseIcon } from './icons'
import { getHistory, addToHistory, removeFromHistory, clearHistory } from '@/lib/search/history'
import styles from './explore-search.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Explore Search (with voice + history)
// ═══════════════════════════════════════════════════════════

type Props = {
  initialQuery?: string
}

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((e: { results: { 0: { 0: { transcript: string } } } }) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

export default function ExploreSearch({ initialQuery = '' }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  const [query, setQuery] = useState(initialQuery)
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    // one-time hydration from localStorage — not cascading
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory(getHistory())
    if (typeof window !== 'undefined') {
      const SR =
        (
          window as unknown as {
            SpeechRecognition?: new () => SpeechRecognitionLike
            webkitSpeechRecognition?: new () => SpeechRecognitionLike
          }
        ).SpeechRecognition ||
        (
          window as unknown as {
            webkitSpeechRecognition?: new () => SpeechRecognitionLike
          }
        ).webkitSpeechRecognition

      setSupported(!!SR)
    }
  }, [])

  // ─── Voice ───
  const startListening = () => {
    if (!supported) return
    const SR =
      (
        window as unknown as {
          SpeechRecognition?: new () => SpeechRecognitionLike
          webkitSpeechRecognition?: new () => SpeechRecognitionLike
        }
      ).SpeechRecognition ||
      (
        window as unknown as {
          webkitSpeechRecognition?: new () => SpeechRecognitionLike
        }
      ).webkitSpeechRecognition
    if (!SR) return

    const recognition = new SR()
    recognition.lang = 'ar-EG'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setQuery(transcript)
      setHistory(addToHistory(transcript))
      setListening(false)
      router.push(`/explore?q=${encodeURIComponent(transcript)}`)
    }

    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  const toggleVoice = () => {
    if (listening) stopListening()
    else startListening()
  }

  // ─── Submit ───
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setHistory(addToHistory(q))
    setShowHistory(false)
    router.push(`/explore?q=${encodeURIComponent(q)}`)
  }

  // ─── History actions ───
  const handleHistoryClick = (item: string) => {
    setQuery(item)
    setShowHistory(false)
    setHistory(addToHistory(item))
    router.push(`/explore?q=${encodeURIComponent(item)}`)
  }

  const handleRemove = (e: React.MouseEvent, item: string) => {
    e.stopPropagation()
    setHistory(removeFromHistory(item))
  }

  const handleClear = () => {
    clearHistory()
    setHistory([])
    setShowHistory(false)
  }

  return (
    <form onSubmit={handleSubmit} className="eah-search-form" role="search">
      <div className="eah-search-box">
        <span className="eah-search-icon" aria-hidden>
          <SearchIcon size={20} />
        </span>

        <input
          ref={inputRef}
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowHistory(true)}
          onBlur={() => setTimeout(() => setShowHistory(false), 200)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setQuery('')
              setShowHistory(false)
            }
          }}
          className="eah-search-input"
          placeholder="دور على مطعم، صيدلية، ماركت..."
          aria-label="البحث"
          autoComplete="off"
          enterKeyHint="search"
        />

        {supported && (
          <button
            type="button"
            className={`eah-icon-action ${listening ? 'eah-icon-listening' : ''}`}
            onClick={toggleVoice}
            data-tooltip={listening ? 'بيسمع...' : 'بحث صوتي'}
            aria-label="بحث صوتي"
          >
            <MicIcon size={18} />
          </button>
        )}

        <button
          type="submit"
          className="eah-icon-action eah-icon-gold"
          data-tooltip="رشحلي"
          aria-label="رشحلي"
          onClick={() => {
            setQuery('')
            router.push('/explore?suggest=1')
          }}
        >
          <SparkleStarIcon size={18} />
        </button>
      </div>

      {showHistory && history.length > 0 && (
        <div className={styles.historyBox}>
          <div className={styles.historyHeader}>
            <span>آخر البحث</span>
            <button type="button" className={styles.historyClear} onClick={handleClear}>
              امسح الكل
            </button>
          </div>

          <ul className={styles.historyList}>
            {history.map((item) => (
              <li key={item} className={styles.historyItem}>
                <button
                  type="button"
                  className={styles.historyBtn}
                  onClick={() => handleHistoryClick(item)}
                >
                  <SearchIcon size={14} />
                  <span>{item}</span>
                </button>
                <button
                  type="button"
                  className={styles.historyRemove}
                  onClick={(e) => handleRemove(e, item)}
                  aria-label={`احذف ${item}`}
                >
                  <CloseIcon size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  )
}
