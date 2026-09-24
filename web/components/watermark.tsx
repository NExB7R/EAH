import Image from 'next/image'
import styles from './watermark.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Watermark Overlay
// wrapper للصور: لوجو + تاج، شفاف، مائل
// ⚠️ مؤقت — لما نستخدم Cloudinary: transformation فعلية
// ═══════════════════════════════════════════════════════════

type WatermarkProps = {
  children: React.ReactNode
  className?: string
}

export default function Watermark({ children, className }: WatermarkProps) {
  return (
    <div className={`${styles.wrap} ${className ?? ''}`}>
      {children}
      <div className={styles.overlay} aria-hidden>
        <Image
          src="/eah-crown.webp"
          alt=""
          width={489}
          height={264}
          className={styles.crown}
        />
        <Image
          src="/eah-word.webp"
          alt=""
          width={546}
          height={231}
          className={styles.word}
        />
      </div>
    </div>
  )
}
