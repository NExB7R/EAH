'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { toPng } from 'html-to-image'
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon, ImageIcon, CheckIcon } from './icons'
import WmImage from './wm-image'
import styles from './menu-slider.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Menu Slider (داخل OrderModal)
//   • صور المنيو كـ slider سلس
//   • زر "التقط صورة" → PNG
//   • آخر شريحة: العروض
// ═══════════════════════════════════════════════════════════

type Offer = {
  title: string
  image: string | null
}

type Props = {
  open: boolean
  onClose: () => void
  images: string[]
  offers?: Offer[]
  businessName: string
}

export default function MenuSlider({ open, onClose, images, offers = [], businessName }: Props) {
  const [index, setIndex] = useState(0)
  const [captured, setCaptured] = useState(false)
  const [pending, startTransition] = useTransition()
  const sliderRef = useRef<HTMLDivElement>(null)

  const hasOffers = offers.length > 0
  const totalSlides = images.length + (hasOffers ? 1 : 0)

  const next = useCallback(() => {
    if (totalSlides <= 1) return
    setIndex((i) => (i + 1) % totalSlides)
  }, [totalSlides])

  const prev = useCallback(() => {
    if (totalSlides <= 1) return
    setIndex((i) => (i - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') next()
      if (e.key === 'ArrowRight') prev()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, next, prev, onClose])

  const capture = () => {
    const el = sliderRef.current
    if (!el) return

    startTransition(async () => {
      try {
        const dataUrl = await toPng(el, {
          quality: 0.95,
          pixelRatio: 2,
          cacheBust: true,
          backgroundColor: '#07020D',
        })

        const link = document.createElement('a')
        link.download = `${businessName}-منيو-${Date.now()}.png`
        link.href = dataUrl
        link.click()

        setCaptured(true)
        setTimeout(() => setCaptured(false), 2500)
      } catch (err) {
        console.error('Screenshot failed:', err)
      }
    })
  }

  if (!open) return null

  if (totalSlides === 0) {
    return (
      <div className={styles.overlay} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <h3 className={styles.title}>منيو {businessName}</h3>
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="إغلاق">
            <CloseIcon size={18} />
          </button>
        </div>
        <div className={styles.empty}>
          <p>لسه مفيش صور منيو للنشاط ده</p>
        </div>
      </div>
    )
  }

  const isOffersSlide = hasOffers && index === images.length
  const currentImage = !isOffersSlide ? images[index] : null

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.header}>
        <h3 className={styles.title}>منيو {businessName}</h3>
        <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="إغلاق">
          <CloseIcon size={18} />
        </button>
      </div>

      <div ref={sliderRef} className={styles.sliderWrap}>
        <div className={styles.sliderInner}>
          {currentImage ? (
            <div className={styles.slide}>
              <WmImage
                src={currentImage}
                alt={`منيو ${businessName} — ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className={styles.image}
              />
            </div>
          ) : isOffersSlide ? (
            <div className={styles.offersSlide}>
              <div className={styles.offersHead}>
                <span className={styles.offersBadge}>عروض</span>
                <h4 className={styles.offersTitle}>عروض {businessName}</h4>
              </div>
              <ul className={styles.offersList}>
                {offers.slice(0, 6).map((o, i) => (
                  <li key={i} className={styles.offerItem}>
                    {o.image ? (
                      <span className={styles.offerImgWrap}>
                        <WmImage
                          src={o.image}
                          alt={o.title}
                          fill
                          sizes="60px"
                          className={styles.offerImg}
                        />
                      </span>
                    ) : (
                      <span className={styles.offerNoImg}>🎁</span>
                    )}
                    <span className={styles.offerTitle}>{o.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {totalSlides > 1 && (
          <>
            <button type="button" onClick={prev} className={styles.navPrev} aria-label="السابق">
              <ChevronRightIcon size={22} />
            </button>
            <button type="button" onClick={next} className={styles.navNext} aria-label="التالي">
              <ChevronLeftIcon size={22} />
            </button>
          </>
        )}

        <span className={styles.watermark}>EAH</span>
      </div>

      {totalSlides > 1 && (
        <div className={styles.dots}>
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
              aria-label={`شريحة ${i + 1}`}
            />
          ))}
        </div>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          onClick={capture}
          disabled={pending}
          className={`${styles.captureBtn} ${captured ? styles.captured : ''}`}
        >
          {captured ? (
            <>
              <CheckIcon size={16} />
              <span>تم النسخ</span>
            </>
          ) : (
            <>
              <ImageIcon size={16} />
              <span>{pending ? 'جاري التصوير…' : 'التقط صورة'}</span>
            </>
          )}
        </button>
        <p className={styles.hint}>صوّر أي صفحة → ابعتها مع طلبك</p>
      </div>
    </div>
  )
}
