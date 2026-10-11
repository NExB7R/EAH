'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { SearchIcon, FilterIcon } from './icons'
import VoiceSearchButton from './voice-search-button'

export default function HomeSearchForm() {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  // link للفلتر: /explore + نفس البحث + يفتح الفلاتر تلقائياً
  const filterHref = value.trim()
    ? `/explore?q=${encodeURIComponent(value.trim())}&filters=1`
    : '/explore?filters=1'

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
          placeholder="اللي نفسك فيه... اكتبه واحنا نلاقيه"
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
          href={filterHref}
          className="eah-icon-action"
          aria-label="فلترة متقدمة"
          data-tooltip="فلترة"
        >
          <FilterIcon size={18} />
        </Link>
      </div>
    </form>
  )
}
