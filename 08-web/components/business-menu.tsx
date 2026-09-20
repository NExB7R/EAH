'use client'
import { useState } from 'react'
import './business-menu.css'

export default function BusinessMenu({ pages, name }: { pages: string[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null)
  if (!pages || pages.length === 0) return null

  return (
    <>
      <section className="bmn">
        <header className="bmn__head">
          <h2 className="bmn__title">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            المنيو
          </h2>
          <span className="bmn__count">{pages.length} صفحة</span>
        </header>
        <div className="bmn__grid">
          {pages.map((url, i) => (
            <button
              key={i}
              type="button"
              className="bmn__page"
              onClick={() => setOpen(i)}
              aria-label={`صفحة منيو ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${name} - منيو ${i + 1}`} loading="lazy" />
              <span className="bmn__page-num">{i + 1}</span>
            </button>
          ))}
        </div>
      </section>

      {open !== null && (
        <div className="bmn-lightbox" onClick={() => setOpen(null)}>
          <button type="button" className="bmn-lightbox__close" aria-label="إغلاق" onClick={() => setOpen(null)}>×</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pages[open]} alt={`${name} - منيو ${open + 1}`} className="bmn-lightbox__img" onClick={(e) => e.stopPropagation()} />
          {pages.length > 1 && (
            <>
              <button type="button" className="bmn-lightbox__nav bmn-lightbox__nav--prev" onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + pages.length) % pages.length) }}>›</button>
              <button type="button" className="bmn-lightbox__nav bmn-lightbox__nav--next" onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % pages.length) }}>‹</button>
            </>
          )}
          <span className="bmn-lightbox__counter">{open + 1} / {pages.length}</span>
        </div>
      )}
    </>
  )
}
