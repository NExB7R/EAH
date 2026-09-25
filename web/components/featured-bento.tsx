'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Business } from '@/lib/data/businesses'
import BusinessCard from './business-card'
import { CrownGoldIcon, ArrowLeftIcon } from './icons'
import styles from './featured-bento.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Featured Bento (خفيف + بدون hydration mismatch)
// ═══════════════════════════════════════════════════════════

type Props = {
  businesses: Business[]
}

const SLIDE_SIZE = 5
const SLIDE_INTERVAL = 10000 // 10 ثواني

export default function FeaturedBento({ businesses }: Props) {
  const [slideIndex, setSlideIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  // تقسيم لمجموعات من 5 (ثابت — نفس الترتيب server/client)
  const slides: Business[][] = []
  for (let i = 0; i < businesses.length; i += SLIDE_SIZE) {
    slides.push(businesses.slice(i, i + SLIDE_SIZE))
  }
  const totalSlides = slides.length
  const currentSlide = slides[slideIndex] ?? []

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || totalSlides <= 1) return
    const timer = setInterval(() => {
      setSlideIndex((i) => (i + 1) % totalSlides)
    }, SLIDE_INTERVAL)
    return () => clearInterval(timer)
  }, [mounted, totalSlides])

  if (businesses.length === 0) return null

  return (
    <section className={`eah-section-bg ${styles.section}`}>
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

        <div className={styles.grid}>
          {currentSlide.map((biz) => (
            <BusinessCard key={biz.id} business={biz} variant="featured" />
          ))}
        </div>

        {totalSlides > 1 && mounted && (
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
        )}
      </div>
    </section>
  )
}
