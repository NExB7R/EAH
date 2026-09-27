import styles from './signature.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Signature (SVG + handwritten cursive, gold neon)
// ═══════════════════════════════════════════════════════════

export default function Signature() {
  return (
    <div className={styles.wrap}>
      <div className={styles.plate}>
        {/* Handwritten name as SVG text with glowing filter */}
        <svg
          viewBox="0 0 460 130"
          className={styles.svg}
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="NourEldin B7R"
        >
          <defs>
            <linearGradient id="eahSigGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F5E4BC" />
              <stop offset="50%" stopColor="#E8C79A" />
              <stop offset="100%" stopColor="#C9A56C" />
            </linearGradient>
            <filter id="eahSigGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Underline flourish */}
          <path
            d="M 30 108 Q 130 118 230 110 T 430 104"
            fill="none"
            stroke="url(#eahSigGold)"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.55"
            filter="url(#eahSigGlow)"
          />
          {/* Swash */}
          <path
            d="M 55 100 Q 25 92 45 76 Q 60 65 90 74"
            fill="none"
            stroke="url(#eahSigGold)"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.7"
            filter="url(#eahSigGlow)"
          />

          {/* Signature name */}
          <text
            x="50%"
            y="72"
            textAnchor="middle"
            fontFamily="'Great Vibes', 'Snell Roundhand', cursive"
            fontSize="76"
            fill="url(#eahSigGold)"
            filter="url(#eahSigGlow)"
            className={styles.text}
          >
            NourEldin B7R
          </text>
        </svg>
      </div>
    </div>
  )
}
