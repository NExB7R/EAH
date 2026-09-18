'use client'
import { useEffect, useRef, useState } from 'react'

type Props = {
  onResult: (transcript: string) => void
  onPartial?: (transcript: string) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: any) => void) | null
  onerror: ((e: any) => void) | null
  onend: (() => void) | null
}

export default function VoiceButton({ onResult, onPartial, className = '', size = 'md' }: Props) {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recRef = useRef<SpeechRecognitionLike | null>(null)
  const finalRef = useRef<string>('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const W = window as any
    const SR = W.SpeechRecognition || W.webkitSpeechRecognition
    if (SR) {
      setSupported(true)
      const rec: SpeechRecognitionLike = new SR()
      rec.lang = 'ar-EG'
      rec.continuous = false
      rec.interimResults = true
      rec.maxAlternatives = 1

      rec.onresult = (e: any) => {
        let interim = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i]
          const txt = res[0].transcript
          if (res.isFinal) finalRef.current += txt
          else interim += txt
        }
        const shown = (finalRef.current + (interim ? ' ' + interim : '')).trim()
        if (interim && onPartial) onPartial(shown)
        if (finalRef.current) onResult(finalRef.current.trim())
      }
      rec.onerror = (e: any) => {
        setListening(false)
        if (e.error === 'not-allowed') setError('لازم تسمح بالميكروفون')
        else if (e.error === 'no-speech') setError('مسمعتش حاجة، جرب تاني')
        else setError('في مشكلة، جرب تاني')
      }
      rec.onend = () => {
        setListening(false)
      }
      recRef.current = rec
    }
  }, [onResult, onPartial])

  const start = () => {
    if (!recRef.current) return
    setError(null)
    finalRef.current = ''
    try {
      recRef.current.start()
      setListening(true)
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(15)
    } catch {
      // already started
    }
  }

  const stop = () => {
    if (!recRef.current) return
    try { recRef.current.stop() } catch {}
    setListening(false)
  }

  const sizes = { sm: 32, md: 40, lg: 56 }
  const px = sizes[size]

  if (!supported) {
    return null
  }

  return (
    <div className={`vb-wrap ${className}`}>
      <button
        type="button"
        className={`vb-btn ${listening ? 'vb-live' : ''}`}
        style={{ width: px, height: px }}
        onClick={listening ? stop : start}
        aria-label={listening ? 'وقف التسجيل' : 'ابحث بصوتك'}
        title={listening ? 'بسمعك...' : 'اتكلم'}
      >
        <svg viewBox="0 0 24 24" width={px * 0.5} height={px * 0.5} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="3" width="6" height="12" rx="3" />
          <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="8" y1="22" x2="16" y2="22" />
        </svg>
        {listening && <span className="vb-ring" />}
      </button>
      {error && <span className="vb-error">{error}</span>}
    </div>
  )
}
