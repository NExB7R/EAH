import styles from './watermark.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Watermark Overlay
// SVG inline — صفر صور، صفر طلبات، صفر client JS
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
        <svg className={styles.crown} viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10 50 L10 25 L25 38 L40 15 L50 32 L60 15 L75 38 L90 25 L90 50 Z"
            fill="currentColor"
          />
          <circle cx="25" cy="38" r="3" fill="currentColor" />
          <circle cx="50" cy="32" r="3" fill="currentColor" />
          <circle cx="75" cy="38" r="3" fill="currentColor" />
        </svg>
        <svg className={styles.word} viewBox="0 0 300 80" xmlns="http://www.w3.org/2000/svg">
          <text
            x="150"
            y="55"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
            fontSize="56"
            fontWeight="900"
            fill="currentColor"
            letterSpacing="6"
          >
            EAH
          </text>
        </svg>
      </div>
    </div>
  )
}
