'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import VoiceButton from '@/components/voice/voice-button'
import { parseArabicQuery, smartPlaceholder } from '@/lib/search/normalize'

type Props = {
  initialQuery?: string
  autoFocus?: boolean
  className?: string
  onNavigate?: (url: string) => void
}

export default function SearchBar({ initialQuery = '', autoFocus = false, className = '', onNavigate }: Props) {
  const router = useRouter()
  const [q, setQ] = useState(initialQuery)
  const [listening, setListening] = useState(false)
  const [hint, setHint] = useState<string | null>(null)
  const [placeholder, setPlaceholder] = useState('دوّر على إيه النهاردة؟')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setPlaceholder(smartPlaceholder()) }, [])
  useEffect(() => { if (autoFocus) inputRef.current?.focus() }, [autoFocus])

  const go = (raw: string) => {
    const text = raw.trim()
    if (!text) return
    const parsed = parseArabicQuery(text)
    const params = new URLSearchParams()
    if (parsed.type) params.set('type', parsed.type)
    if (parsed.area) params.set('area', parsed.area)
    if (parsed.openNow === true) params.set('open', '1')
    if (parsed.budget) params.set('budget', parsed.budget)
    if (!parsed.hasIntent || parsed.keywords.length > 0) params.set('q', text)
    const url = `/explore${params.toString() ? '?' + params.toString() : ''}`
    if (onNavigate) onNavigate(url)
    else router.push(url)
  }

return (
    <div className={`sb-wrap ${className}`}>
      <form
        className="sb-form"
        onSubmit={(e) => { e.preventDefault(); go(q) }}
      >
        <svg className="sb-ic" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className="sb-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={listening ? 'بسمعك...' : placeholder}
          autoComplete="off"
          dir="rtl"
        />
        <VoiceButton
          size="sm"
          onPartial={(t) => { setQ(t); setHint(null) }}
          onResult={(t) => {
            setQ(t)
            setListening(false)
            const parsed = parseArabicQuery(t)
            if (parsed.type) {
              const typeNames: Record<string, string> = {
                restaurant: 'مطاعم', pharmacy: 'صيدليات',
                supermarket: 'ماركت', delivery_office: 'توصيل',
              }
              setHint(`جاري البحث في ${typeNames[parsed.type] ?? ''}...`)
            }
            setTimeout(() => go(t), 400)
          }}
        />
        {q && (
          <button type="button" className="sb-clear" onClick={() => { setQ(''); inputRef.current?.focus() }} aria-label="امسح">
            ×
          </button>
        )}
      </form>
      {hint && <div className="sb-hint">{hint}</div>}
    </div>
  )
}
