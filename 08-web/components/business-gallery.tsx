'use client'
import { useState } from 'react'
import './business-gallery.css'

export default function BusinessGallery({ images, name }: { images: string[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null)
  if (!images || images.length === 0) return null

  return (
    <>
      <section className="bg2">
        <header className="bg2__head">
          <h2 className="bg2__title">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            صور المكان
          </h2>
          <span className="bg2__count">{images.length} صورة</span>
        </header>
        <div className="bg2__grid">
          {images.map((url, i) => (
            <button
              key={i}
              type="button"
              className="bg2__item"
              onClick={() => setOpen(i)}
              aria-label={`صورة ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${name} - ${i + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
      </section>

      {open !== null && (
        <div className="bg2-lightbox" onClick={() => setOpen(null)}>
          <button type="button" className="bg2-lightbox__close" aria-label="إغلاق" onClick={() => setOpen(null)}>×</button>
          <button
            type="button"
            className="bg2-lightbox__nav bg2-lightbox__nav--prev"
            onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + images.length) % images.length) }}
            aria-label="السابق"
          >›</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[open]} alt={`${name} - ${open + 1}`} className="bg2-lightbox__img" onClick={(e) => e.stopPropagation()} />
          <button
            type="button"
            className="bg2-lightbox__nav bg2-lightbox__nav--next"
            onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % images.length) }}
            aria-label="التالي"
          >‹</button>
          <span className="bg2-lightbox__counter">{open + 1} / {images.length}</span>
        </div>
      )}
    </>
  )
}
