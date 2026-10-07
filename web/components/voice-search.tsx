'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MicIcon, CloseIcon } from './icons'
import { useVoiceSearch } from '@/lib/hooks/use-voice-search'
import styles from './voice-search.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Voice Search Modal
// يفتح من أي مكان — Web Speech + Whisper fallback
// ═══════════════════════════════════════════════════════════

type Props = {
  open: boolean
  onClose: () => void
}

export default function VoiceSearch({ open, onClose }: Props) {
  const router = useRouter()

  const voice = useVoiceSearch({
    onResult: (text) => {
      onClose()
      router.push(`/explore?q=${encodeURIComponent(text)}`)
    },
    onError: () => {
      /* التعامل داخل الـ modal عبر status */
    },
  })

  // فتح → ابدأ التسجيل
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => void voice.start(), 100)
      return () => clearTimeout(t)
    }
    voice.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Esc للإغلاق
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const statusLabel =
    voice.status === 'listening'
      ? 'بتكلم...'
      : voice.status === 'processing'
        ? 'بسمعك...'
        : voice.status === 'error'
          ? 'جرب تاني'
          : 'جاهز'

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="إغلاق">
          <CloseIcon size={20} />
        </button>

        <div className={`${styles.micWrap} ${voice.status === 'listening' ? styles.active : ''}`}>
          <span className={styles.ring} aria-hidden />
          <span className={styles.ring2} aria-hidden />
          <MicIcon size={40} />
        </div>

        <p className={styles.label}>{statusLabel}</p>
        <p className={styles.hint}>
          {voice.status === 'listening'
            ? 'اتكلم عادي — مثلاً "عايز مطعم بيتزا"'
            : voice.status === 'processing'
              ? 'ثانية واحدة...'
              : 'اضغط وأعد المحاولة'}
        </p>

        {voice.status === 'error' && (
          <button type="button" className={styles.retry} onClick={() => voice.start()}>
            جرب تاني
          </button>
        )}
      </div>
    </div>
  )
}
