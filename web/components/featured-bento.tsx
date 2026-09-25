'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { Business } from '@/lib/data/businesses'
import { shuffleArray } from '@/lib/ranking'
import BusinessCard from './business-card'
import { CrownGoldIcon, ArrowLeftIcon, SparkleStarIcon } from './icons'
import styles from './featured-bento.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Featured Bento (المميزون)
// auto-slide + تحكم بسيط + shuffle عشوائي
// ═══════════════════════════════════════════════════════════

type Props = {
  businesses: Business[]
}

type Speed = 'slow' | 'normal' | 'fast'

const SPEEDS: Record<Speed, number> = {
  slow: 12000,
  normal: 8000,
  fast: 5000,
}

const SLIDE_SIZE = 5

export default function FeaturedBento({ businesses }: Props) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [speed, setSpeed] = useState<Speed>('normal')
  const [slideIndex, setSlideIndex] = useState(0)

  // Fisher-Yates shuffle — مرة واحدة عند mount
  const shuffled = useMemo(() => shuffleArray(businesses), [businesses])

  // تقسيم لمجموعات من 5
  const slides = useMemo(() => {
    const groups: Business[][] = []
    for (let i = 0; i < shuffled.length; i += SLIDE_SIZE) {
      groups.push(shuffled.slice(i, i + SLIDE_SIZE))
    }
    return groups
  }, [shuffled])

  const totalSlides = slides.length
  const currentSlide = slides[slideIndex] ?? []

  // Auto-slide
  useEffect(() => {
    if (!isPlaying || totalSlides <= 1) return
    const timer = setTimeout(() => {
      setSlideIndex((i) => (i + 1) % totalSlides)
    }, SPEEDS[speed])
    return () => clearTimeout(timer)
  }, [isPlaying, speed, slideIndex, totalSlides])

  if (businesses.length === 0) return null

  return (
    <section className={styles.section}>
      <div className={styles.ambient} aria-hidden />
      <div className={styles.grid} aria-hidden />

      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            <span className={styles.titleIcon}>
              <CrownGoldIcon size={22} />
            </span>
            <h2 className={styles.title}>المميزون</h2>
            <span className={styles.titleBadge}>Premium</span>
          </div>

          <Link href="/featured" className={styles.viewAll}>
            <span>شوف الكل</span>
            <ArrowLeftIcon size={16} />
          </Link>
        </header>

        <div className={styles.neonLine} aria-hidden />

        <div
          className={styles.bento}
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
        >
          {currentSlide.map((biz, idx) => (
            <div
              key={biz.id}
              className={`${styles.cell} ${idx === 0 ? styles.cellBig : ''}`}
            >
              <BusinessCard business={biz} variant="featured" />
            </div>
          ))}
        </div>

        {totalSlides > 1 && (
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.controlBtn}
              onClick={() => setIsPlaying((p) => !p)}
              aria-label={isPlaying ? 'إيقاف' : 'تشغيل'}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>

            <div className={styles.dots}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.dot} ${i === slideIndex ? styles.dotActive : ''}`}
                  onClick={() => setSlideIndex(i)}
                  aria-label={`شريحة ${i + 1}`}
                />
              ))}
            </div>

            <div className={styles.speeds}>
              {(['slow', 'normal', 'fast'] as Speed[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`${styles.speedBtn} ${speed === s ? styles.speedBtnActive : ''}`}
                  onClick={() => setSpeed(s)}
                >
                  {s === 'slow' ? 'بطيء' : s === 'normal' ? 'عادي' : 'سريع'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
