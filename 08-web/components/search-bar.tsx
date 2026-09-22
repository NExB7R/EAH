'use client'
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import VoiceButton from './voice/voice-button'
import { buildExploreSearchUrl, smartPlaceholder } from '@/lib/search/normalize'
import { IconSearch } from './neon-icons'
import './search-bar.css'

type Props = {
  initialQuery?: string
  autoFocus?: boolean
  size?: 'md' | 'lg'
  placeholder?: string
  className?: string
  onNavigate?: (url: string) => void
}

export default function SearchBar({
  initialQuery = '',
  autoFocus = false,
  size = 'md',
  placeholder,
  className = '',
  onNavigate,
}: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [smartHint, setSmartHint] = useState(placeholder ?? 'دوّر على إيه النهاردة؟')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    if (!placeholder) setSmartHint(smartPlaceholder())
  }, [placeholder])

  const go = useCallback((raw: string) => {
    const url = buildExploreSearchUrl(raw)
    if (onNavigate) onNavigate(url)
    else router.push(url)
  }, [onNavigate, router])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    go(query)
  }

  const handleVoiceResult = useCallback((transcript: string) => {
    setQuery(transcript)
    go(transcript)
  }, [go])

  const handleVoicePartial = useCallback((transcript: string) => {
    setQuery(transcript)
  }, [])

  return (
    <form onSubmit={submit} className={`sbar sbar--${size} ${className}`.trim()} role="search">
      <span className="sbar__icon" aria-hidden><IconSearch /></span>
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={smartHint}
        aria-label="ابحث في EAH"
        autoFocus={autoFocus}
        autoComplete="off"
        enterKeyHint="search"
        className="sbar__input"
      />
      {query && (
        <button
          type="button"
          className="sbar__clear"
          onClick={() => {
            setQuery('')
            inputRef.current?.focus()
          }}
          aria-label="امسح البحث"
        >
          ×
        </button>
      )}
      <VoiceButton size="sm" onResult={handleVoiceResult} onPartial={handleVoicePartial} />
      <button type="submit" className="sbar__btn">ابحث</button>
    </form>
  )
}
