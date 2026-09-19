'use client'
import { useRouter } from 'next/navigation'
import { useState, FormEvent } from 'react'
import VoiceButton from './voice/voice-button'
import { parseArabicQuery } from '@/lib/search/normalize'
import { IconSearch } from './neon-icons'
import './search-bar.css'

export default function SearchBar({
  initialQuery = '',
  autoFocus = false,
  size = 'md',
  placeholder = 'دوّر على إيه النهاردة؟',
}: {
  initialQuery?: string
  autoFocus?: boolean
  size?: 'md' | 'lg'
  placeholder?: string
}) {
  const [q, setQ] = useState(initialQuery)
  const router = useRouter()

  function go(raw: string) {
    const text = raw.trim()
    if (!text) { router.push('/explore'); return }
    const parsed = parseArabicQuery(text)
    const params = new URLSearchParams()
    if (parsed.type) params.set('type', parsed.type)
    if (parsed.area) params.set('area', parsed.area)
    if (parsed.openNow === true) params.set('open', '1')
    if (parsed.budget) params.set('budget', parsed.budget)
    if (!parsed.hasIntent || parsed.keywords.length > 0) params.set('q', text)
    router.push(`/explore${params.toString() ? '?' + params.toString() : ''}`)
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    go(q)
  }

  return (
    <form onSubmit={submit} className={`sbar sbar--${size}`}>
      <span className="sbar__icon" aria-hidden><IconSearch /></span>
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label="ابحث في EAH"
        autoFocus={autoFocus}
        className="sbar__input"
      />
      <VoiceButton
        size="sm"
        onResult={(t) => { setQ(t); setTimeout(() => go(t), 300) }}
        onPartial={(t) => setQ(t)}
      />
      <button type="submit" className="sbar__btn">ابحث</button>
    </form>
  )
}
