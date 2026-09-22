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
  onresult: ((event: any) => void) | null
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
}

export default function VoiceButton({ onResult, onPartial, className = '', size = 'md' }: Props) {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const finalRef = useRef('')
  const failedRef = useRef(false)
  const onResultRef = useRef(onResult)
  const onPartialRef = useRef(onPartial)

  useEffect(() => { onResultRef.current = onResult }, [onResult])
  useEffect(() => { onPartialRef.current = onPartial }, [onPartial])

  useEffect(() => {
    const browser = window as any
    const SpeechRecognition = browser.SpeechRecognition || browser.webkitSpeechRecognition
    if (!SpeechRecognition) return

    setSupported(true)
    const recognition: SpeechRecognitionLike = new SpeechRecognition()
    recognition.lang = 'ar-EG'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      let interim = ''
      for (let index = event.resultIndex; index < event.results.length; index++) {
        const result = event.results[index]
        const transcript = result[0].transcript
        if (result.isFinal) finalRef.current += `${transcript} `
        else interim += `${transcript} `
      }
      const shown = `${finalRef.current}${interim}`.trim()
      if (shown) onPartialRef.current?.(shown)
    }

    recognition.onerror = (event: any) => {
      failedRef.current = true
      setListening(false)
      if (event.error === 'not-allowed') setError('لازم تسمح بالميكروفون')
      else if (event.error === 'no-speech') setError('مسمعتش حاجة، جرب تاني')
      else if (event.error !== 'aborted') setError('في مشكلة، جرب تاني')
    }

    recognition.onend = () => {
      setListening(false)
      const transcript = finalRef.current.trim()
      if (!failedRef.current && transcript) onResultRef.current(transcript)
    }

    recognitionRef.current = recognition
    return () => {
      try { recognition.abort() } catch { /* already stopped */ }
      recognitionRef.current = null
    }
  }, [])

  const start = () => {
    if (!recognitionRef.current) return
    setError(null)
    finalRef.current = ''
    failedRef.current = false
    try {
      recognitionRef.current.start()
      setListening(true)
      navigator.vibrate?.(15)
    } catch {
      // Browsers throw when recognition is already starting.
    }
  }

  const stop = () => {
    try { recognitionRef.current?.stop() } catch { /* already stopped */ }
    setListening(false)
  }

  const sizes = { sm: 32, md: 40, lg: 56 }
  const px = sizes[size]
  if (!supported) return null

  return (
    <div className={`vb-wrap ${className}`}>
      <button
        type="button"
        className={`vb-btn ${listening ? 'vb-live' : ''}`}
        style={{ width: px, height: px }}
        onClick={listening ? stop : start}
        aria-label={listening ? 'وقف التسجيل' : 'ابحث بصوتك'}
        aria-pressed={listening}
        title={listening ? 'بسمعك...' : 'اتكلم'}
      >
        <svg viewBox="0 0 24 24" width={px * 0.5} height={px * 0.5} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="9" y="3" width="6" height="12" rx="3" />
          <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="8" y1="22" x2="16" y2="22" />
        </svg>
        {listening && <span className="vb-ring" />}
      </button>
      {error && <span className="vb-error" role="status">{error}</span>}
    </div>
  )
}
