'use client'
import { useRouter } from 'next/navigation'
import { useState, FormEvent } from 'react'
import { IconSearch } from './neon-icons'
import './search-bar.css'

export default function SearchBar({
  initialQuery = '',
  autoFocus = false,
  size = 'md',
  placeholder = 'ابحث عن مطعم، صيدلية، عرض...',
}: {
  initialQuery?: string
  autoFocus?: boolean
  size?: 'md' | 'lg'
  placeholder?: string
}) {
  const [q, setQ] = useState(initialQuery)
  const router = useRouter()

  function submit(e: FormEvent) {
    e.preventDefault()
    const query = q.trim()
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`)
    else router.push('/search')
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
      <button type="submit" className="sbar__btn">ابحث</button>
    </form>
  )
}
