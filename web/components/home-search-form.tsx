'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { SearchIcon, SparkleStarIcon } from './icons'
import VoiceSearchButton from './voice-search-button'

export default function HomeSearchForm() {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <form action="/explore" method="get" className="eah-search-form" role="search">
      <div className="eah-search-box">
        <span className="eah-search-icon" aria-hidden>
          <SearchIcon size={20} />
        </span>
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="eah-search-input"
          placeholder="دور على مطعم، صيدلية، ماركت..."
          aria-label="البحث"
          autoComplete="off"
          enterKeyHint="search"
        />
        <VoiceSearchButton
          className="eah-icon-action"
          size={18}
          onResult={(text) => {
            setValue(text)
            inputRef.current?.focus()
          }}
        />
        <Link
          href="/explore?suggest=1"
          className="eah-icon-action eah-icon-gold"
          aria-label="رشحلي"
          prefetch={false}
          data-tooltip="رشحلي"
        >
          <SparkleStarIcon size={18} />
        </Link>
      </div>
    </form>
  )
}
